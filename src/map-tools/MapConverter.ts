import { NoteDirection } from "./NoteDirection"
import type { V2Map } from "./V2MapTypes"
import type { V3Map, V3RotationEvent, V3ColorNote, V3BombNote, V3Obstacle, V3BasicBeatmapEvent, V3Slider } from "./V3MapTypes"

function getV3RotationEvents(map: V2Map): Array<V3RotationEvent> {
    var rotationEvents: Array<V3RotationEvent> = [];
    for (var i = 0; i < map._events.length; i++) {
        var event = map._events[i];
        if (event._type == 14) {
            rotationEvents.push({
                b: event._time,
                e: 0,
                r: event._value
            });
        } else if (event._type == 15) {
            rotationEvents.push({
                b: event._time,
                e: 1,
                r: event._value
            });
        }
    }
    return rotationEvents;
}

/**
 * @param isME whether or not the map is a Mapping Extensions map
 */
function getV3ColorNotes(map: V2Map, isME: boolean = false): Array<V3ColorNote> {
    var colorNotes: Array<V3ColorNote> = [];
    for (const note of map._notes) {
        // filter out bombs
        if (note._type != 0 && note._type != 1) {
            continue;
        }

        var colorNote = {
            b: note._time,
            x: note._lineIndex,
            y: note._lineLayer,
            c: note._type,
            d: note._cutDirection,
            a: 0
        }

        if (isME) {
            if (note._lineIndex >= 1000) {
                colorNote.x = note._lineIndex/1000 - 1;
            } else if (note._lineIndex <= -1000) {
                colorNote.x = note._lineIndex/1000 + 1;
            }

            if (note._lineLayer >= 1000) {
                colorNote.y = note._lineLayer/1000 - 1;
            } else if (note._lineLayer <= -1000) {
                colorNote.y = note._lineLayer/1000 + 1;
            }

            if (note._cutDirection >= 1000) {
                colorNote.d = note._cutDirection == NoteDirection.Any ? NoteDirection.Any : 0;
                colorNote.a = note._cutDirection % 1000;
            }
        }

        colorNotes.push(colorNote);
    }
    return colorNotes;
}

/**
 * @param isME whether or not the map is a Mapping Extensions map
 */
function getV3BombNotes(map: V2Map, isME: boolean = false): Array<V3BombNote> {
    var bombNotes: Array<V3BombNote> = [];
    for (const bomb of map._notes) {
        // filter out non-bombs
        if (bomb._type != 3) {
            continue;
        }

        var bombNote: V3BombNote = {
            b: bomb._time,
            x: bomb._lineIndex,
            y: bomb._lineLayer
        }

        if (isME) {
            if (bomb._lineIndex >= 1000) {
                bombNote.x = bomb._lineIndex/1000 - 1;
            } else if (bomb._lineIndex <= -1000) {
                bombNote.x = bomb._lineIndex/1000 + 1;
            }

            if (bomb._lineLayer >= 1000) {
                bombNote.y = bomb._lineLayer/1000 - 1;
            } else if (bomb._lineLayer <= -1000) {
                bombNote.y = bomb._lineLayer/1000 + 1;
            }
        }

        bombNotes.push(bombNote);
    }
    return bombNotes;
}

/**
 * @param isME whether or not the map is a Mapping Extensions map
 */
function getV3Obstacles(map: V2Map, isME: boolean = false): Array<V3Obstacle> {
    var obstacles: Array<V3Obstacle> = [];
    for (const obstacle of map._obstacles) {
        var y = 0;
        var h = 5; // height
        if (obstacle._type == 0) {
            y = 0;
            h = 5
        } else if (obstacle._type == 1) {
            y = 2;
            h = 3;
        }

        var obstacleV3: V3Obstacle = {
            b: obstacle._time,
            x: obstacle._lineIndex,
            y: y,
            d: obstacle._duration,
            w: obstacle._width,
            h: h
        }

        // https://github.com/Kylemc1413/MappingExtensions/blob/ed81a9702b5b8163b60fbd4956fccefdefac1509/MappingExtensions/HarmonyPatches/BeatmapSaveData.cs
        if (isME) {
            if (obstacle._lineIndex >= 1000) {
                obstacleV3.x = obstacle._lineIndex/1000 - 1;
            } else if (obstacle._lineIndex <= -1000) {
                obstacleV3.x = obstacle._lineIndex/1000 + 1;
            }

            if (obstacle._width >= 1000) {
                obstacleV3.w = obstacle._width/1000 - 1;
            }

            // get height
            if (
                obstacle._type >= 1000 &&
                obstacle._type <= 4000 ||
                obstacle._type >= 4001 &&
                obstacle._type <= 4005000
            ) {
                var preciseHeightStart: boolean = obstacle._type >= 4001 && obstacle._type <= 4100000 ? true : false;
                var obsHeight: number;
                var value = obstacle._type;
                if (preciseHeightStart) {
                    value -= 4001;
                    obsHeight = value / 1000;
                } else {
                    obsHeight = value - 1000;
                }
                var height = obsHeight / 1000 * 5;
                height = height * 1000 + 1000;
                obstacleV3.h = height / 1000 - 1;
            }

            // get y
            if (
                obstacle._type >= 1000 &&
                obstacle._type <= 4000 ||
                obstacle._type >= 4001 &&
                obstacle._type <= 4005000
            ) {
                var preciseHeightStart: boolean = obstacle._type >= 4001 && obstacle._type <= 4100000 ? true : false;
                var startHeight = 0;
                var value = obstacle._type;
                if (preciseHeightStart) {
                    value -= 4001;
                    startHeight = value % 1000;
                }

                var layer = startHeight / 750 * 5;
                layer = layer * 1000 + 1334;
                obstacleV3.y = layer / 1000 - 1;
            }
        }

        obstacles.push(obstacleV3);
    }
    return obstacles;
}

function getV3Sliders(map: V2Map): Array<V3Slider> {
    var sliders: Array<V3Slider> = [];
    if (map._sliders == undefined) {
        return sliders;
    }
    for (var i = 0; i < map._sliders.length; i++) {
        var slider = map._sliders[i];
        sliders.push({
            b: slider._headTime,
            c: slider._colorType,
            x: slider._headLineIndex,
            y: slider._headLineLayer,
            d: slider._headCutDirection,
            mu: slider._headControlPointLengthMultiplier,
            tb: slider._tailTime,
            tx: slider._tailLineIndex,
            ty: slider._tailLineLayer,
            tc: slider._tailCutDirection,
            tmu: slider._tailControlPointLengthMultiplier,
            m: slider._sliderMidAnchorMode
        });
    }
    return sliders;
}

function getV3BasicBeatmapEvents(map: V2Map): Array<V3BasicBeatmapEvent> {
    var basicBeatmapEvents: Array<V3BasicBeatmapEvent> = [];
    for (var i = 0; i < map._events.length; i++) {
        var event = map._events[i];
        var f = 0;
        var floatValue = event._floatValue;
        if (floatValue != undefined) {
            f = floatValue;
        }
        basicBeatmapEvents.push({
            b: event._time,
            et: event._type,
            i: event._value,
            f
        });
    }
    return basicBeatmapEvents;
}

/**
 * @param isME whether or not the V2 map is a Mapping Extensions map
 */
export function convertV2MapToV3Map(map: V2Map, isME: boolean = false): V3Map {
    var v3Map: V3Map = {
        version: "3.0.0",
        bpmEvents: [], // not in V2
        rotationEvents: getV3RotationEvents(map),
        colorNotes: getV3ColorNotes(map, isME),
        bombNotes: getV3BombNotes(map, isME),
        obstacles: getV3Obstacles(map, isME),
        sliders: getV3Sliders(map),
        burstSliders: [], // not in V2
        waypoints: [], // bts character waypoints. documentation almost non-existent. this is in V2
        basicBeatmapEvents: getV3BasicBeatmapEvents(map),
        colorBoostBeatmapEvents: [], // TODO
        lightColorEventBoxGroups: [], // not in V2
        lightRotationEventBoxGroups: [], // not in V2
        basicEventTypesWithKeywords: {}, // idk what this is
        useNormalEventsAsCompatibleEvents: false // idk what this is
    };
    return v3Map;
}
