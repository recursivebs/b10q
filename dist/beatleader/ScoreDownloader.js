"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchScoreData = exports.fetchScoreStatData = void 0;
async function fetchScoreStatData(scoreId) {
    const url = `https://api.beatleader.xyz/score/statistic/${scoreId}`;
    const response = await fetch(url);
    // Check if the request was successful
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
}
exports.fetchScoreStatData = fetchScoreStatData;
async function fetchScoreData(scoreId) {
    const url = `https://api.beatleader.xyz/score/${scoreId}`;
    const response = await fetch(url);
    // Check if the request was successful
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
}
exports.fetchScoreData = fetchScoreData;
