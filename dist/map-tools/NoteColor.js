"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoteColor = void 0;
var NoteColor;
(function (NoteColor) {
    /**
     * Left hand color
     */
    NoteColor[NoteColor["Red"] = 0] = "Red";
    /**
     * Right hand color
     */
    NoteColor[NoteColor["Blue"] = 1] = "Blue";
    NoteColor[NoteColor["Unknown"] = 999] = "Unknown";
})(NoteColor || (exports.NoteColor = NoteColor = {}));
