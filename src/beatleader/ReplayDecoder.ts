// Ported from https://github.com/BeatLeader/BeatSaber-Web-Replays/blob/52f0e8950255bff076bb9a4832006c77057f48e0/src/open-replay-decoder.js

let dataViewPointer = 0; // adding as a global because why not


export function checkBSOR(file: any, isLink: boolean, completion: any) {
	if (isLink) {
		if (file.split('.').pop() == 'bsor' || file.split('.').pop() == 'bsortemp') {
			file = file.replace('https://cdn.discordapp.com/', '/cors/discord-cdn/');
			fetch(file)
				.then((response) => response.blob())
				.then((blob) => {
					checkBSORFile(blob, completion);
				});
		} else {
			completion(null);
		}
	} else {
		checkBSORFile(file, completion);
	}
}

function checkBSORFile(blob: Blob, completion: any) {
	blob.arrayBuffer().then((arrayBuffer) => {
		decode(arrayBuffer, completion);
	});
}

export function ssReplayToBSOR(ssReplay: any) {
	var result: any = {};

	result.info = ssReplay.info;
	if (ssReplay.dynamicHeight) {
		result.heights = ssReplay.dynamicHeight.map((el: any) => ({time: el?.a, height: el?.h}));
	}

	result.notes = [];
	result.walls = [];
	ssReplay.scores.forEach((score: any, i: number) => {
		if (i < ssReplay.noteInfos.length) {
			var note: any = {};
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
		} else {
			var wall: any = {};
			wall.time = ssReplay.noteTime[i];
			result.walls.push(wall);
		}
	});
	result.frames = ssReplay.frames;
	result.frames.forEach((frame: any) => {
		frame.time = frame.a;
		frame.fps = frame.i;
	});

	return result;
}

const enum StructType {
	info = 0,
	frames = 1,
	notes = 2,
	walls = 3,
	heights = 4,
	pauses = 5,
};

export enum NoteEventType {
	good = 0,
	bad = 1,
	miss = 2,
	bomb = 3,
};

function decode(arrayBuffer: any, completion: any) {

	const dataView = new DataView(arrayBuffer);
	dataViewPointer = 0;

	const magic: number = DecodeInt(dataView);
	const version = DecodeUint8(dataView);

	let magicNumber: number = 0x442d3d69;

	if (version == 1 && magic == magicNumber) {
		var replay: any = {};

		for (var a = 0; a < StructType.pauses + 1; a++) {
			const type = DecodeUint8(dataView);
			switch (type) {
				case StructType.info:
					replay.info = DecodeInfo(dataView);
					break;
				case StructType.frames:
					replay.frames = DecodeFrames(dataView);
					break;
				case StructType.notes:
					replay.notes = DecodeNotes(dataView);
					break;
				case StructType.walls:
					replay.walls = DecodeWalls(dataView);
					break;
				case StructType.heights:
					replay.heights = DecodeHeight(dataView);
					break;
				case StructType.pauses:
					replay.pauses = DecodePauses(dataView);
					break;
			}
		}

		completion(replay);
	} else {
		completion(null);
	}
}

function DecodeInfo(dataView: DataView) {
	var result: any = {};

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

function DecodeFrames(dataView: DataView) {
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

function DecodeFrame(dataView: DataView) {
	var result: any = {};
	result.time = DecodeFloat(dataView);
	result.fps = DecodeInt(dataView);
	result.h = DecodeEuler(dataView);
	result.l = DecodeEuler(dataView);
	result.r = DecodeEuler(dataView);

	return result;
}

function DecodeNotes(dataView: DataView) {
	const length = DecodeInt(dataView);
	var result = [];
	for (var i = 0; i < length; i++) {
		result.push(DecodeNote(dataView));
	}
	return result;
}

function DecodeWalls(dataView: DataView) {
	const length = DecodeInt(dataView);
	var result = [];
	for (var i = 0; i < length; i++) {
		var wall: any = {};
		wall.wallID = DecodeInt(dataView);
		wall.energy = DecodeFloat(dataView);
		wall.time = DecodeFloat(dataView);
		wall.spawnTime = DecodeFloat(dataView);
		result.push(wall);
	}
	return result;
}

function DecodeHeight(dataView: DataView) {
	const length = DecodeInt(dataView);
	var result = [];
	for (var i = 0; i < length; i++) {
		var height: any = {};
		height.height = DecodeFloat(dataView);
		height.time = DecodeFloat(dataView);
		result.push(height);
	}
	return result;
}

function DecodePauses(dataView: DataView) {
	const length = DecodeInt(dataView);
	var result = [];
	for (var i = 0; i < length; i++) {
		var pause: any = {};
		pause.duration = DecodeLong(dataView);
		pause.time = DecodeFloat(dataView);
		result.push(pause);
	}
	return result;
}

function DecodeNote(dataView: DataView) {
	var result: any = {};

	result.noteID = DecodeInt(dataView);
	result.eventTime = DecodeFloat(dataView);
	result.spawnTime = DecodeFloat(dataView);
	result.eventType = DecodeInt(dataView);
	if (result.eventType == NoteEventType.good || result.eventType == NoteEventType.bad) {
		result.noteCutInfo = DecodeCutInfo(dataView);
	}

	return result;
}

function DecodeCutInfo(dataView: DataView) {

	var result: any = {};

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

function DecodeEuler(dataView: DataView): any {
	var result: any = {};
	result.p = DecodeVector3(dataView);
	result.r = DecodeQuaternion(dataView);

	return result;
}

function DecodeVector3(dataView: DataView): any {

	var result: any = {};

	result.x = DecodeFloat(dataView);
	result.y = DecodeFloat(dataView);
	result.z = DecodeFloat(dataView);

	return result;
}

function DecodeQuaternion(dataView: DataView): any {

	var result: any = {};

	result.x = DecodeFloat(dataView);
	result.y = DecodeFloat(dataView);
	result.z = DecodeFloat(dataView);
	result.w = DecodeFloat(dataView);

	return result;
}

function DecodeLong(dataView: DataView): bigint {
	const result = dataView.getBigInt64(dataViewPointer, true);
	dataViewPointer += 8;
	return result;
}

function DecodeInt(dataView: DataView): number {
	const result = dataView.getInt32(dataViewPointer, true);
	dataViewPointer += 4;
	return result;
}

function DecodeUint8(dataView: DataView): number {
	const result = dataView.getUint8(dataViewPointer);
	dataViewPointer++;
	return result;
}

function DecodeString(dataView: DataView): string {
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

function DecodeName(dataView: DataView): string {
	const length = dataView.getInt32(dataViewPointer, true);
	var enc = new TextDecoder('utf-8');
	let lengthOffset = 0;
	if (length > 0) {
		while (
			dataView.getInt32(length + dataViewPointer + 4 + lengthOffset, true) != 6 &&
			dataView.getInt32(length + dataViewPointer + 4 + lengthOffset, true) != 5 &&
			dataView.getInt32(length + dataViewPointer + 4 + lengthOffset, true) != 8
		) {
			lengthOffset++;
		}
	}

	const string = enc.decode(new Int8Array(dataView.buffer.slice(dataViewPointer + 4, length + dataViewPointer + 4 + lengthOffset)));
	dataViewPointer += length + 4 + lengthOffset;
	return string;
}

function DecodeFloat(dataView: DataView): number {
	const result = dataView.getFloat32(dataViewPointer, true);
	dataViewPointer += 4;
	return result;
}

function DecodeBool(dataView: DataView): boolean {
	const result = dataView.getUint8(dataViewPointer) != 0;
	dataViewPointer++;
	return result;
}
