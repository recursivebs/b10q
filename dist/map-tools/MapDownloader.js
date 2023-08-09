"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadMapDiff = exports.beatSaverHashToMapId = void 0;
const jszip_1 = __importDefault(require("jszip"));
const MapConverter_1 = require("./MapConverter");
function parseMetadata(metadata) {
    let mapMetadata = {
        id: metadata["id"],
        songName: metadata["metadata"]["songName"],
        songSubName: metadata["metadata"]["songSubName"],
        songAuthorName: metadata["metadata"]["songAuthorName"],
        levelAuthorName: metadata["metadata"]["levelAuthorName"],
        bpm: metadata["metadata"]["bpm"],
        duration: metadata["metadata"]["duration"],
        coverURL: metadata["versions"][0]["coverURL"]
    };
    return mapMetadata;
}
function parseDifficulty(characteristic, difficulty, metadatajson) {
    let foundDiff = metadatajson["versions"][0]["diffs"].find((diff) => (diff["difficulty"] == difficulty && diff["characteristic"] == characteristic));
    let MapDifficulty = {
        njs: foundDiff["njs"],
        offset: foundDiff["offset"],
        notes: foundDiff["notes"],
        bombs: foundDiff["bombs"],
        obstacles: foundDiff["obstacles"],
        nps: foundDiff["nps"],
        length: foundDiff["length"],
        characteristic: foundDiff["characteristic"],
        difficulty: foundDiff["difficulty"],
        events: foundDiff["events"],
        chroma: foundDiff["chroma"],
        me: foundDiff["me"],
        ne: foundDiff["ne"],
        cinema: foundDiff["cinema"],
        seconds: foundDiff["seconds"],
        paritySummary: foundDiff["paritySummary"],
        stars: foundDiff["stars"],
        maxScore: foundDiff["maxScore"]
    };
    return MapDifficulty;
}
async function beatSaverHashToMapId(hash) {
    const response = await fetch(`https://beatsaver.com/api/maps/hash/${hash}`);
    const json = await response.json();
    return json["id"];
}
exports.beatSaverHashToMapId = beatSaverHashToMapId;
async function downloadMapDiff(id, characteristic, difficulty) {
    const allMapData = await downloadMap(id);
    for (const map of allMapData.maps) {
        if (map.parsedDifficulty.characteristic == characteristic && map.parsedDifficulty.difficulty == difficulty) {
            return map;
        }
    }
    return null;
}
exports.downloadMapDiff = downloadMapDiff;
async function downloadMap(id) {
    // Download the beatsaver map metadata first to get the version hash
    let mapMetadata = await fetch(`https://beatsaver.com/api/maps/id/${id}`);
    if (!mapMetadata.ok) {
        return { maps: [], audioBlob: null };
    }
    let mapMetadataJson = await mapMetadata.json();
    let mapVersionHash = mapMetadataJson["versions"][0]["hash"];
    const url = `https://r2cdn.beatsaver.com/${mapVersionHash}.zip`;
    let response = await fetch(url);
    if (response.status !== 200) {
        throw new Error(`Could not download map ${id}`);
    }
    const buffer = await response.arrayBuffer();
    const zip = await jszip_1.default.loadAsync(buffer);
    var infoFile = zip.file('info.dat');
    if (!infoFile) {
        infoFile = zip.file('Info.dat');
        if (!infoFile) {
            throw new Error(`Could not find info.dat or Info.dat in map ${id}`);
        }
    }
    const info = await infoFile.async('string');
    const parsedInfo = JSON.parse(info);
    // construct MapHelpers of all difficulties of all characteristics in the map
    let maps = Array();
    for (const beatmapSet of parsedInfo._difficultyBeatmapSets) {
        for (const beatmap of beatmapSet._difficultyBeatmaps) {
            const file = zip.file(beatmap._beatmapFilename);
            if (!file) {
                throw new Error(`Could not find ${beatmap._beatmapFilename} in zip`);
            }
            // Read file contents as JSON
            const json = await file.async('string');
            const parsedJSON = JSON.parse(json);
            // always check in this order because some maps on BeatSaver fused V3 data with V2 data
            var mapVersion = parsedJSON["version"];
            if (mapVersion == undefined) {
                mapVersion = parsedJSON["_version"];
                // some maps have no _version field and are still V2 maps
                if (mapVersion == undefined && parsedJSON["_notes"] != undefined) {
                    mapVersion = "2.0.0";
                }
            }
            const mapMajorVersion = mapVersion.split('.')[0];
            var mapV3;
            if (mapMajorVersion == "2") {
                var isMappingExtensions = false;
                if (beatmap._customData && beatmap._customData["_requirements"]) {
                    for (const requirement of beatmap._customData ? beatmap._customData["_requirements"] : []) {
                        if (requirement == "Mapping Extensions") {
                            isMappingExtensions = true;
                            break;
                        }
                    }
                }
                mapV3 = (0, MapConverter_1.convertV2MapToV3Map)(parsedJSON, isMappingExtensions);
            }
            else if (mapMajorVersion == "3") {
                mapV3 = parsedJSON;
            }
            else {
                throw new Error(`Unsupported map version ${mapVersion}`);
            }
            let parsedMetadata = parseMetadata(mapMetadataJson);
            let parsedDifficulty = parseDifficulty(beatmapSet._beatmapCharacteristicName, beatmap._difficulty, mapMetadataJson);
            let mapHelper = { mapV3: mapV3, parsedMetadata: parsedMetadata, parsedDifficulty: parsedDifficulty };
            maps.push(mapHelper);
        }
    }
    // get the song file as a blob from the zip
    const songFile = zip.file(parsedInfo._songFilename);
    if (!songFile) {
        throw new Error(`Could not find ${parsedInfo._songFilename} in zip`);
    }
    const audioBlob = await songFile.async('blob');
    return { maps: maps, audioBlob: audioBlob };
}
exports.default = downloadMap;
