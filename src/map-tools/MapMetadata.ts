export type MapMetadata = {
    id: string,
    songName: string,
    songSubName?: string,
    songAuthorName: string,
    levelAuthorName: string,
    coverURL: string,
    bpm: number,
    duration: number, // in seconds
}