// https://github.com/BeatLeader/BS-Open-Replay#structure

export type ReplayInfo = {
    version: string;
    /**
     * @example "1.25.1"
     */
    gameVersion: string;
    /**
     * play start unix timestamp
     */
    timestamp: string;

    playerID: string;
    playerName: string;
    platform: string;

    trackingSystem: string;
    hmd: string;
    controller: string;

    hash: string;
    songName: string;
    mapper: string;
    /**
     * @example "ExpertPlus"
     */
    difficulty: string;

    /**
     * total unmodified score
     */
    score: number;
    /**
     * @example "Standard"
     */
    mode: string;
    environment: string;
    /**
     * comma separated string, game modifiers
     * @example: "FS,GN"
     */
    modifiers: string;
    jumpDistance: number;
    leftHanded: boolean;
    height: number;

    /**
     * song start time (practice mode)
     */
    startTime: number;
    /**
     * song fail time (only if failed)
     */
    failTime: number;
    /**
     * song speed (practice mode)
     */
    speed: number;
}


export type ReplayFrameTransform = {
    position: {
        x: number;
        y: number;
        z: number;
    };
    rotation: {
        x: number;
        y: number;
        z: number;
        w: number;
    };
}


export type ReplayFrame = {
    time: number;
    fps: number;
    headset: ReplayFrameTransform;
    leftHand: ReplayFrameTransform;
    rightHand: ReplayFrameTransform;
};


export type ReplayNoteCutInfo = {
    speedOK: boolean;
    directionOK: boolean;
    saberTypeOK: boolean;
    wasCutTooSoon: boolean;
    saberSpeed: number;
    saberDir: {
        x: number;
        y: number;
        z: number;
    };
    saberType: number;
    timeDeviation: number;
    cutDirDeviation: number;
    cutPoint: {
        x: number;
        y: number;
        z: number;
    };
    cutNormal: {
        x: number;
        y: number;
        z: number;
    };
    cutDistanceToCenter: number;
    cutAngle: number;
    beforeCutRating: number;
    afterCutRating: number;
};


export type ReplayNoteInfo = {
    noteID: number;
    eventTime: number;
    spawnTime: number;
    eventType: number;
    noteCutInfo: ReplayNoteCutInfo | null;
};


export type ReplayWalls = {
    wallID: number;
    energy: number;
    time: number;
    spawnTime: number;
};


export type ReplayPauses = {
    duration: number;
    time: number;
};


export type ReplayHeight = {
    height: number;
    time: number;
};


export type Replay = {
    info: {

    },
    frames: Array<ReplayFrame>;
    notes: Array<ReplayNoteInfo>;
    walls: Array<ReplayWalls>;
    pauses: Array<ReplayPauses>;
    heights: Array<ReplayHeight>;
}
