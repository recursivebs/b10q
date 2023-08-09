// https://bsmg.wiki/mapping/map-format.html#difficulty-file-v2

import type { NoteDirection } from "./NoteDirection";

export type V2Map = {
    _version: String;
    _notes: Array<V2Note>;
    _sliders?: Array<V2Slider>; // Introduced in version 2.6.0
    _obstacles: Array<V2Obstacle>;
    _events: Array<V2Event>;
    _waypoints?: Array<any>; // Introduced in version 2.2.0
    _customData?: any;
}

export type V2Note = {
    _time: number;
    _lineIndex: number;
    _lineLayer: number;
    _type: number;
    _cutDirection: NoteDirection;
    _customData?: any;
}

export type V2Slider = {
    _colorType: number;
    _headTime: number;
    _headLineIndex: number;
    _headLineLayer: number;
    _headControlPointLengthMultiplier: number;
    _headCutDirection: NoteDirection;
    _tailTime: number;
    _tailLineIndex: number;
    _tailLineLayer: number;
    _tailControlPointLengthMultiplier: number;
    _tailCutDirection: NoteDirection;
    _sliderMidAnchorMode: number;
    _customData?: any;
}

export type V2Obstacle = {
    _time: number;
    _lineIndex: number;
    _type: number;
    _duration: number;
    _width: number;
    _customData?: any;
}

export type V2Event = {
    _time: number;
    _type: number;
    _value: number;
    _floatValue?: number;
    _customData?: any;
}
