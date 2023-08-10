import { downloadReplayServer } from "./beatleader/ReplayDownloader";
import { downloadMapDiff, beatSaverHashToMapId } from "./map-tools/MapDownloader";
import { fetchScoreData, fetchScoreStatData } from "./beatleader/ScoreDownloader";
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import fs from 'fs';


async function buildScoreData(scoreId: string, includeFrames: Boolean) {
    console.log(`Building score data for score ${scoreId}`);
    console.log(`Fetching replay data for score ${scoreId}`);
    const replay = await downloadReplayServer(scoreId);
    console.log(`Fetched replay data for score ${scoreId}`);
    console.log(`Fetching score data for score ${scoreId}`);
    const scoreData = await fetchScoreData(scoreId);
    console.log(`Fetched score data for score ${scoreId}`);
    console.log(`Fetching score stat data for score ${scoreId}`);
    const scoreStatData = await fetchScoreStatData(scoreId);
    console.log(`Fetched score stat data for score ${scoreId}`);
    console.log(`Fetching map data for score ${scoreId}`);
    const mapId = await beatSaverHashToMapId(replay.info.hash);
    const map = await downloadMapDiff(mapId, "Standard", "ExpertPlus");
    console.log(`Fetched map data for score ${scoreId}`);

    const data = {
        replay: replay,
        scoreData: scoreData,
        scoreStatData: scoreStatData,
        map: map,
    };

    // Strip out the frames if we don't want them
    if (!includeFrames) {
        delete data.replay.frames;
    }

    // Write to a file
    let jsonData = JSON.stringify(data, null, 2);

    // create the out directory if it doesn't already exist
    if (!fs.existsSync('out')) {
        fs.mkdirSync('out');
    }

    // delete the existing file if it exists
    if (fs.existsSync(`out/${scoreId}.json`)) {
        fs.unlinkSync(`out/${scoreId}.json`);
    }

    // Write the data to a file
    fs.writeFile(`out/${scoreId}.json`, jsonData, (err) => {
        if (err) {
            console.error('Error writing file', err);
        } else {
            console.log(`Successfully wrote to ${scoreId}.json! 🎉`);
        }
    });

}

const argv = yargs(hideBin(process.argv))
  .command('buildScoreData', 'Builds the score data', {
    scoreId: {
      description: 'The ID of the score to build',
      alias: 's',
      type: 'number',
    },
    noFrames: {
        description: 'Whether or not to include the frames in the replay',
        alias: 'n',
        type: 'boolean',
    },
  })
  .demandCommand(1, 'You need at least one command before moving on')
  .help()
  .alias('help', 'h')
  .argv as any;

if (argv._.includes('buildScoreData')) {

    let includeFrames: Boolean = true;
    if (argv.noFrames) {
        includeFrames = false;
    }

    buildScoreData(argv.scoreId, includeFrames);
}

