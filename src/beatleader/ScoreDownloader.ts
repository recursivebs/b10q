export async function fetchScoreStatData(scoreId: string): Promise<any> {

    const url = `https://api.beatleader.xyz/score/statistic/${scoreId}`;
    const response = await fetch(url);

    // Check if the request was successful
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;

}


export async function fetchScoreData(scoreId: string): Promise<any> {

    const url = `https://api.beatleader.xyz/score/${scoreId}`;
    const response = await fetch(url);

    // Check if the request was successful
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;

}


