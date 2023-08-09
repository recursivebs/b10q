"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoteDirection = void 0;
var NoteDirection;
(function (NoteDirection) {
    NoteDirection[NoteDirection["Up"] = 0] = "Up";
    NoteDirection[NoteDirection["Down"] = 1] = "Down";
    NoteDirection[NoteDirection["Left"] = 2] = "Left";
    NoteDirection[NoteDirection["Right"] = 3] = "Right";
    NoteDirection[NoteDirection["UpLeft"] = 4] = "UpLeft";
    NoteDirection[NoteDirection["UpRight"] = 5] = "UpRight";
    NoteDirection[NoteDirection["DownLeft"] = 6] = "DownLeft";
    NoteDirection[NoteDirection["DownRight"] = 7] = "DownRight";
    NoteDirection[NoteDirection["Any"] = 8] = "Any";
})(NoteDirection || (exports.NoteDirection = NoteDirection = {}));
