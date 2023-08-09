// https://bsmg.wiki/mapping/map-format.html#difficulty-file-v3

import type { NoteColor } from "./NoteColor";
import type { NoteDirection } from "./NoteDirection";

export type V3Map = {
    version: String;
    bpmEvents: Array<V3BpmEvent>;
    rotationEvents: Array<V3RotationEvent>;
    colorNotes: Array<V3ColorNote>;
    bombNotes: Array<V3BombNote>;
    obstacles: Array<V3Obstacle>;
    sliders: Array<V3Slider>;
    burstSliders: Array<V3BurstSlider>;
    waypoints: Array<any>; // documentation almost non-existent
    basicBeatmapEvents: Array<V3BasicBeatmapEvent>;
    colorBoostBeatmapEvents: Array<any>; // got lazy
    lightColorEventBoxGroups: Array<any>; // got lazy
    lightRotationEventBoxGroups: Array<any>; // got lazy
    basicEventTypesWithKeywords: any; // documentation non-existent
    useNormalEventsAsCompatibleEvents: boolean;
}

export type V3BpmEvent = {
    b: number; // beat
    m: number; // bpm
}

export type V3RotationEvent = {
    b: number; // beat
    e: number; // event type
    r: number; // rotation
}

export type V3ColorNote = {
    b: number; // beat
    x: number; // x position
    y: number; // y position
    c: NoteColor; // color
    d: NoteDirection; // direction
    a: number; // angle offset
}

export type V3BombNote = {
    b: number; // beat
    x: number; // x position
    y: number; // y position
}

export type V3Obstacle = {
    b: number; // beat
    x: number; // x position
    y: number; // y position
    d: number; // duration in beats
    w: number; // width
    h: number; // height
}

export type V3Slider = {
    b: number; // head beat
    c: NoteColor; // color
    x: number; // head x position
    y: number; // head y position
    d: NoteDirection; // head direction
    mu: number; // head multiplier
    tb: number; // tail beat
    tx: number; // tail x position
    ty: number; // tail y position
    tc: NoteDirection; // tail direction // TODO: is this a typo? should it be td?
    tmu: number; // tail multiplier
    m: number; // mid-anchor mode
}

export type V3BurstSlider = {
    b: number; // head beat
    x: number; // head x position
    y: number; // head y position
    c: NoteColor; // color
    d: NoteDirection; // head direction
    tb: number; // tail beat
    tx: number; // tail x position
    ty: number; // tail y position
    sc: number; // segment count
    s: number; // squish factor
}

export type V3BasicBeatmapEvent = {
    b: number; // beat. Equivalent to _time in V2
    et: number; // event type. Equivalent to _type in V2
    i: number; // intensity. Equivalent to _value in V2
    f: number; // float value. Equivalent to _floatValue in V2
}
