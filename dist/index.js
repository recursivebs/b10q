"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ReplayDownloader_1 = require("./beatleader/ReplayDownloader");
const MapDownloader_1 = require("./map-tools/MapDownloader");
const ScoreDownloader_1 = require("./beatleader/ScoreDownloader");
const yargs_1 = __importDefault(require("yargs"));
const helpers_1 = require("yargs/helpers");
const fs_1 = __importDefault(require("fs"));
async function buildScoreData(scoreId) {
    console.log(`Building score data for score ${scoreId}`);
    console.log(`Fetching replay data for score ${scoreId}`);
    const replay = await (0, ReplayDownloader_1.downloadReplayServer)(scoreId);
    console.log(`Fetched replay data for score ${scoreId}`);
    console.log(`Fetching score data for score ${scoreId}`);
    const scoreData = await (0, ScoreDownloader_1.fetchScoreData)(scoreId);
    console.log(`Fetched score data for score ${scoreId}`);
    console.log(`Fetching score stat data for score ${scoreId}`);
    const scoreStatData = await (0, ScoreDownloader_1.fetchScoreStatData)(scoreId);
    console.log(`Fetched score stat data for score ${scoreId}`);
    console.log(`Fetching map data for score ${scoreId}`);
    const mapId = await (0, MapDownloader_1.beatSaverHashToMapId)(replay.info.hash);
    const map = await (0, MapDownloader_1.downloadMapDiff)(mapId, "Standard", "ExpertPlus");
    console.log(`Fetched map data for score ${scoreId}`);
    const data = {
        replay: replay,
        scoreData: scoreData,
        scoreStatData: scoreStatData,
        map: map,
    };
    // Write to a file
    let jsonData = JSON.stringify(data, null, 2);
    // create the out directory if it doesn't already exist
    if (!fs_1.default.existsSync('out')) {
        fs_1.default.mkdirSync('out');
    }
    // delete the existing file if it exists
    if (fs_1.default.existsSync(`out/${scoreId}.json`)) {
        fs_1.default.unlinkSync(`out/${scoreId}.json`);
    }
    // Write the data to a file
    fs_1.default.writeFile(`out/${scoreId}.json`, jsonData, (err) => {
        if (err) {
            console.error('Error writing file', err);
        }
        else {
            console.log(`Successfully wrote to ${scoreId}.json! 🎉`);
        }
    });
}
const argv = (0, yargs_1.default)((0, helpers_1.hideBin)(process.argv))
    .command('buildScoreData', 'Builds the score data', {
    scoreId: {
        description: 'The ID of the score to build',
        alias: 's',
        type: 'number',
    }
})
    .demandCommand(1, 'You need at least one command before moving on')
    .help()
    .alias('help', 'h')
    .argv;
if (argv._.includes('buildScoreData')) {
    buildScoreData(argv.scoreId);
}
