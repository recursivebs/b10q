"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadReplayClient = exports.downloadReplayServer = exports.downloadScoreData = void 0;
const ReplayHelper_1 = __importDefault(require("./ReplayHelper"));
const ReplayDecoder_1 = require("./ReplayDecoder");
async function downloadScoreData(scoreId) {
    let scoreData = await fetch(`https://api.beatleader.xyz/score/${scoreId}`);
    if (scoreData.status !== 200) {
        throw new Error(`Could not download score data ${scoreId}`);
    }
    let json = await scoreData.json();
    return json;
}
exports.downloadScoreData = downloadScoreData;
async function downloadReplayServer(scoreId) {
    let scoreDataJson = await downloadScoreData(scoreId);
    return new Promise((resolve, reject) => {
        (0, ReplayDecoder_1.checkBSOR)(scoreDataJson.replay, true, (replay) => {
            if (replay === null) {
                reject(new Error(`Could not download replay ${scoreId}`));
            }
            else {
                resolve(replay);
            }
        });
    });
}
exports.downloadReplayServer = downloadReplayServer;
async function downloadReplayClient(scoreId) {
    let request = await fetch(`/api/replay?id=${scoreId}`);
    const replay = await request.json();
    return new Promise((resolve, reject) => {
        try {
            console.time("ReplayHelper");
            const replayHelper = new ReplayHelper_1.default(replay);
            console.timeEnd("ReplayHelper");
            resolve(replayHelper);
        }
        catch (e) {
            reject(e);
            //reject("Could not parse replay");
        }
    });
}
exports.downloadReplayClient = downloadReplayClient;
