import JSZip from 'jszip';
import { convertV2MapToV3Map } from './MapConverter';
import type { V3Map } from './V3MapTypes';
import type { MapMetadata } from './MapMetadata';
import type { MapDifficulty } from './MapDifficulty';
import type { MapInfo } from './MapInfo';


function parseMetadata(metadata: any) : MapMetadata {
    let mapMetadata: MapMetadata = {
        id: metadata["id"],
        songName: metadata["metadata"]["songName"],
        songSubName: metadata["metadata"]["songSubName"],
        songAuthorName: metadata["metadata"]["songAuthorName"],
        levelAuthorName: metadata["metadata"]["levelAuthorName"],
        bpm: metadata["metadata"]["bpm"],
        duration: metadata["metadata"]["duration"],
        coverURL: metadata["versions"][0]["coverURL"]
    }

    return mapMetadata;
}


function parseDifficulty(characteristic: string, difficulty: string, metadatajson: any) : MapDifficulty {
    let foundDiff = metadatajson["versions"][0]["diffs"].find((diff: any) => (diff["difficulty"] == difficulty && diff["characteristic"] == characteristic));
    let MapDifficulty: MapDifficulty = {
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
    }
    return MapDifficulty;
}

interface MapDownloadResult {
    maps: any[],
    audioBlob: Blob | null
}


export async function beatSaverHashToMapId(hash: string): Promise<string> {
    const response = await fetch(`https://beatsaver.com/api/maps/hash/${hash}`);
    const json = await response.json();
    return json["id"];
}


export async function downloadMapDiff(id: string, characteristic: string, difficulty: string): Promise<any> {
    const allMapData = await downloadMap(id);
    for (const map of allMapData.maps) {
        if (map.parsedDifficulty.characteristic == characteristic && map.parsedDifficulty.difficulty == difficulty) {
            return map;
        }
    }
    return null;
}


export default async function downloadMap(id: string): Promise<MapDownloadResult> {

    // Download the beatsaver map metadata first to get the version hash
    let mapMetadata = await fetch(`https://beatsaver.com/api/maps/id/${id}`);

    if (!mapMetadata.ok) {
        return {maps: [], audioBlob: null};
    }

    let mapMetadataJson: any = await mapMetadata.json();
    let mapVersionHash = mapMetadataJson["versions"][0]["hash"];

    const url = `https://r2cdn.beatsaver.com/${mapVersionHash}.zip`
    let response = await fetch(url)

    if (response.status !== 200) {
        throw new Error(`Could not download map ${id}`)
    }

    const buffer = await response.arrayBuffer()
    const zip = await JSZip.loadAsync(buffer)

    var infoFile = zip.file('info.dat');
    if (!infoFile) {
        infoFile = zip.file('Info.dat');
        if (!infoFile) {
            throw new Error(`Could not find info.dat or Info.dat in map ${id}`);
        }
    }

    const info = await infoFile.async('string');
    const parsedInfo: MapInfo = JSON.parse(info);

    // construct MapHelpers of all difficulties of all characteristics in the map
    let maps = Array<Object>();
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

            var mapV3: V3Map;
            if (mapMajorVersion == "2") {
                var isMappingExtensions = false;
                if (beatmap._customData && beatmap._customData["_requirements"]) {
                    for (const requirement of beatmap._customData ? beatmap._customData["_requirements"]: []) {
                        if (requirement == "Mapping Extensions") {
                            isMappingExtensions = true;
                            break;
                        }
                    }
                }
                mapV3 = convertV2MapToV3Map(parsedJSON, isMappingExtensions);
            } else if (mapMajorVersion == "3") {
                mapV3 = parsedJSON;
            } else {
                throw new Error(`Unsupported map version ${mapVersion}`);
            }

            let parsedMetadata = parseMetadata(mapMetadataJson);
            let parsedDifficulty = parseDifficulty(beatmapSet._beatmapCharacteristicName, beatmap._difficulty, mapMetadataJson);

            let mapHelper = {mapV3: mapV3, parsedMetadata: parsedMetadata, parsedDifficulty: parsedDifficulty};
            maps.push(mapHelper);
        }
    }

    // get the song file as a blob from the zip
    const songFile = zip.file(parsedInfo._songFilename);
    if (!songFile) {
        throw new Error(`Could not find ${parsedInfo._songFilename} in zip`);
    }
    const audioBlob = await songFile.async('blob');

    return {maps: maps, audioBlob: audioBlob};

}


