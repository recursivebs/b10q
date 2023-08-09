"use strict";
// Ported from https://github.com/BeatLeader/BeatSaber-Web-Replays/blob/52f0e8950255bff076bb9a4832006c77057f48e0/src/open-replay-decoder.js
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoteEventType = exports.ssReplayToBSOR = exports.checkBSOR = void 0;
let dataViewPointer = 0; // adding as a global because why not
function checkBSOR(file, isLink, completion) {
    if (isLink) {
        if (file.split('.').pop() == 'bsor' || file.split('.').pop() == 'bsortemp') {
            file = file.replace('https://cdn.discordapp.com/', '/cors/discord-cdn/');
            fetch(file)
                .then((response) => response.blob())
                .then((blob) => {
                checkBSORFile(blob, completion);
            });
        }
        else {
            completion(null);
        }
    }
    else {
        checkBSORFile(file, completion);
    }
}
exports.checkBSOR = checkBSOR;
function checkBSORFile(blob, completion) {
    blob.arrayBuffer().then((arrayBuffer) => {
        decode(arrayBuffer, completion);
    });
}
function ssReplayToBSOR(ssReplay) {
    var result = {};
    result.info = ssReplay.info;
    if (ssReplay.dynamicHeight) {
        result.heights = ssReplay.dynamicHeight.map((el) => ({ time: el?.a, height: el?.h }));
    }
    result.notes = [];
    result.walls = [];
    ssReplay.scores.forEach((score, i) => {
        if (i < ssReplay.noteInfos.length) {
            var note = {};
            const info = ssReplay.noteInfos[i];
            var noteType = parseInt(info[3]);
            if (isNaN(noteType)) {
                noteType = 3;
            }
            note.noteID = parseInt(info[0]) * 1000 + parseInt(info[1]) * 100 + noteType * 10 + parseInt(info[2]);
            note.eventTime = ssReplay.noteTime[i];
            note.spawnTime = i;
            note.eventType = score > 0 ? NoteEventType.good : (score + 1) * -1;
            note.score = score;
            result.notes.push(note);
        }
        else {
            var wall = {};
            wall.time = ssReplay.noteTime[i];
            result.walls.push(wall);
        }
    });
    result.frames = ssReplay.frames;
    result.frames.forEach((frame) => {
        frame.time = frame.a;
        frame.fps = frame.i;
    });
    return result;
}
exports.ssReplayToBSOR = ssReplayToBSOR;
;
var NoteEventType;
(function (NoteEventType) {
    NoteEventType[NoteEventType["good"] = 0] = "good";
    NoteEventType[NoteEventType["bad"] = 1] = "bad";
    NoteEventType[NoteEventType["miss"] = 2] = "miss";
    NoteEventType[NoteEventType["bomb"] = 3] = "bomb";
})(NoteEventType || (exports.NoteEventType = NoteEventType = {}));
;
function decode(arrayBuffer, completion) {
    const dataView = new DataView(arrayBuffer);
    dataViewPointer = 0;
    const magic = DecodeInt(dataView);
    const version = DecodeUint8(dataView);
    let magicNumber = 0x442d3d69;
    if (version == 1 && magic == magicNumber) {
        var replay = {};
        for (var a = 0; a < 5 /* StructType.pauses */ + 1; a++) {
            const type = DecodeUint8(dataView);
            switch (type) {
                case 0 /* StructType.info */:
                    replay.info = DecodeInfo(dataView);
                    break;
                case 1 /* StructType.frames */:
                    replay.frames = DecodeFrames(dataView);
                    break;
                case 2 /* StructType.notes */:
                    replay.notes = DecodeNotes(dataView);
                    break;
                case 3 /* StructType.walls */:
                    replay.walls = DecodeWalls(dataView);
                    break;
                case 4 /* StructType.heights */:
                    replay.heights = DecodeHeight(dataView);
                    break;
                case 5 /* StructType.pauses */:
                    replay.pauses = DecodePauses(dataView);
                    break;
            }
        }
        completion(replay);
    }
    else {
        completion(null);
    }
}
function DecodeInfo(dataView) {
    var result = {};
    result.version = DecodeString(dataView);
    result.gameVersion = DecodeString(dataView);
    result.timestamp = DecodeString(dataView);
    result.playerID = DecodeString(dataView);
    result.playerName = DecodeName(dataView);
    result.platform = DecodeString(dataView);
    result.trackingSystem = DecodeString(dataView);
    result.hmd = DecodeString(dataView);
    result.controller = DecodeString(dataView);
    result.hash = DecodeString(dataView);
    result.songName = DecodeString(dataView);
    result.mapper = DecodeString(dataView);
    result.difficulty = DecodeString(dataView);
    result.score = DecodeInt(dataView);
    result.mode = DecodeString(dataView);
    result.environment = DecodeString(dataView);
    result.modifiers = DecodeString(dataView);
    result.jumpDistance = DecodeFloat(dataView);
    result.leftHanded = DecodeBool(dataView);
    result.height = DecodeFloat(dataView);
    result.startTime = DecodeFloat(dataView);
    result.failTime = DecodeFloat(dataView);
    result.speed = DecodeFloat(dataView);
    return result;
}
function DecodeFrames(dataView) {
    const length = DecodeInt(dataView);
    var result = [];
    for (var i = 0; i < length; i++) {
        var frame = DecodeFrame(dataView);
        if (frame.time != 0) {
            result.push(frame);
        }
    }
    if (result.length > 2) {
        var sameFramesCount = 0;
        while (result[sameFramesCount].time == result[sameFramesCount + 1].time) {
            sameFramesCount++;
        }
        if (sameFramesCount > 0) {
            sameFramesCount++;
            var newResult = [];
            for (let index = 0; index < result.length; index += sameFramesCount) {
                newResult.push(result[index]);
            }
            result = newResult;
        }
    }
    return result;
}
function DecodeFrame(dataView) {
    var result = {};
    result.time = DecodeFloat(dataView);
    result.fps = DecodeInt(dataView);
    result.h = DecodeEuler(dataView);
    result.l = DecodeEuler(dataView);
    result.r = DecodeEuler(dataView);
    return result;
}
function DecodeNotes(dataView) {
    const length = DecodeInt(dataView);
    var result = [];
    for (var i = 0; i < length; i++) {
        result.push(DecodeNote(dataView));
    }
    return result;
}
function DecodeWalls(dataView) {
    const length = DecodeInt(dataView);
    var result = [];
    for (var i = 0; i < length; i++) {
        var wall = {};
        wall.wallID = DecodeInt(dataView);
        wall.energy = DecodeFloat(dataView);
        wall.time = DecodeFloat(dataView);
        wall.spawnTime = DecodeFloat(dataView);
        result.push(wall);
    }
    return result;
}
function DecodeHeight(dataView) {
    const length = DecodeInt(dataView);
    var result = [];
    for (var i = 0; i < length; i++) {
        var height = {};
        height.height = DecodeFloat(dataView);
        height.time = DecodeFloat(dataView);
        result.push(height);
    }
    return result;
}
function DecodePauses(dataView) {
    const length = DecodeInt(dataView);
    var result = [];
    for (var i = 0; i < length; i++) {
        var pause = {};
        pause.duration = DecodeLong(dataView);
        pause.time = DecodeFloat(dataView);
        result.push(pause);
    }
    return result;
}
function DecodeNote(dataView) {
    var result = {};
    result.noteID = DecodeInt(dataView);
    result.eventTime = DecodeFloat(dataView);
    result.spawnTime = DecodeFloat(dataView);
    result.eventType = DecodeInt(dataView);
    if (result.eventType == NoteEventType.good || result.eventType == NoteEventType.bad) {
        result.noteCutInfo = DecodeCutInfo(dataView);
    }
    return result;
}
function DecodeCutInfo(dataView) {
    var result = {};
    result.speedOK = DecodeBool(dataView);
    result.directionOK = DecodeBool(dataView);
    result.saberTypeOK = DecodeBool(dataView);
    result.wasCutTooSoon = DecodeBool(dataView);
    result.saberSpeed = DecodeFloat(dataView);
    result.saberDir = DecodeVector3(dataView);
    result.saberType = DecodeInt(dataView);
    result.timeDeviation = DecodeFloat(dataView);
    result.cutDirDeviation = DecodeFloat(dataView);
    result.cutPoint = DecodeVector3(dataView);
    result.cutNormal = DecodeVector3(dataView);
    result.cutDistanceToCenter = DecodeFloat(dataView);
    result.cutAngle = DecodeFloat(dataView);
    result.beforeCutRating = DecodeFloat(dataView);
    result.afterCutRating = DecodeFloat(dataView);
    return result;
}
function DecodeEuler(dataView) {
    var result = {};
    result.p = DecodeVector3(dataView);
    result.r = DecodeQuaternion(dataView);
    return result;
}
function DecodeVector3(dataView) {
    var result = {};
    result.x = DecodeFloat(dataView);
    result.y = DecodeFloat(dataView);
    result.z = DecodeFloat(dataView);
    return result;
}
function DecodeQuaternion(dataView) {
    var result = {};
    result.x = DecodeFloat(dataView);
    result.y = DecodeFloat(dataView);
    result.z = DecodeFloat(dataView);
    result.w = DecodeFloat(dataView);
    return result;
}
function DecodeLong(dataView) {
    const result = dataView.getBigInt64(dataViewPointer, true);
    dataViewPointer += 8;
    return result;
}
function DecodeInt(dataView) {
    const result = dataView.getInt32(dataViewPointer, true);
    dataViewPointer += 4;
    return result;
}
function DecodeUint8(dataView) {
    const result = dataView.getUint8(dataViewPointer);
    dataViewPointer++;
    return result;
}
function DecodeString(dataView) {
    const length = dataView.getInt32(dataViewPointer, true);
    if (length < 0 || length > 1000) {
        dataViewPointer += 1;
        return DecodeString(dataView);
    }
    var enc = new TextDecoder('utf-8');
    const string = enc.decode(new Int8Array(dataView.buffer.slice(dataViewPointer + 4, length + dataViewPointer + 4)));
    dataViewPointer += length + 4;
    return string;
}
function DecodeName(dataView) {
    const length = dataView.getInt32(dataViewPointer, true);
    var enc = new TextDecoder('utf-8');
    let lengthOffset = 0;
    if (length > 0) {
        while (dataView.getInt32(length + dataViewPointer + 4 + lengthOffset, true) != 6 &&
            dataView.getInt32(length + dataViewPointer + 4 + lengthOffset, true) != 5 &&
            dataView.getInt32(length + dataViewPointer + 4 + lengthOffset, true) != 8) {
            lengthOffset++;
        }
    }
    const string = enc.decode(new Int8Array(dataView.buffer.slice(dataViewPointer + 4, length + dataViewPointer + 4 + lengthOffset)));
    dataViewPointer += length + 4 + lengthOffset;
    return string;
}
function DecodeFloat(dataView) {
    const result = dataView.getFloat32(dataViewPointer, true);
    dataViewPointer += 4;
    return result;
}
function DecodeBool(dataView) {
    const result = dataView.getUint8(dataViewPointer) != 0;
    dataViewPointer++;
    return result;
}
