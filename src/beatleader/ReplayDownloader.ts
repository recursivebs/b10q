import ReplayHelper from "./ReplayHelper"
import { checkBSOR } from "./ReplayDecoder"


export async function downloadScoreData(scoreId: string): Promise<any> {
    let scoreData = await fetch(`https://api.beatleader.xyz/score/${scoreId}`);
    if (scoreData.status !== 200) {
        throw new Error(`Could not download score data ${scoreId}`);
    }
    let json = await scoreData.json();
    return json
}


export async function downloadReplayServer(scoreId: string): Promise<any> {
    let scoreDataJson = await downloadScoreData(scoreId);
    return new Promise ((resolve, reject) => {
        checkBSOR(scoreDataJson.replay, true, (replay: any) => {
            if (replay === null) {
                reject(new Error(`Could not download replay ${scoreId}`));
            } else {
                resolve(replay);
            }
        })
    });
}


export async function downloadReplayClient(scoreId: string): Promise<ReplayHelper> {
    let request = await fetch(`/api/replay?id=${scoreId}`);
    const replay = await request.json();

    return new Promise((resolve, reject) => {
        try {
            console.time("ReplayHelper");
            const replayHelper = new ReplayHelper(replay);
            console.timeEnd("ReplayHelper");
            resolve(replayHelper);
        } catch (e) {
            reject(e);
            //reject("Could not parse replay");
        }
    });
}
