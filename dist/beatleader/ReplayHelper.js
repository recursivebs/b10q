"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = require("three");
class ReplayHelper {
    constructor(replayJson) {
        this.frames = [];
        this.notes = [];
        this.walls = [];
        this.pauses = [];
        this.heights = [];
        // Process info data
        const jsonInfo = replayJson["info"];
        this.info = {
            version: jsonInfo["version"],
            gameVersion: jsonInfo["gameVersion"],
            timestamp: jsonInfo["timestamp"],
            playerID: jsonInfo["playerID"],
            playerName: jsonInfo["playerName"],
            platform: jsonInfo["platform"],
            trackingSystem: jsonInfo["trackingSystem"],
            hmd: jsonInfo["hmd"],
            controller: jsonInfo["controller"],
            hash: jsonInfo["hash"],
            songName: jsonInfo["songName"],
            mapper: jsonInfo["mapper"],
            difficulty: jsonInfo["difficulty"],
            score: jsonInfo["score"],
            mode: jsonInfo["mode"],
            environment: jsonInfo["environment"],
            modifiers: jsonInfo["modifiers"],
            jumpDistance: jsonInfo["jumpDistance"],
            leftHanded: jsonInfo["leftHanded"],
            height: jsonInfo["height"],
            startTime: jsonInfo["startTime"],
            failTime: jsonInfo["failTime"],
            speed: jsonInfo["speed"],
        };
        // Process frame data
        for (let i = 0; i < replayJson["frames"].length; i++) {
            let frame = replayJson["frames"][i];
            let replayFrame = {
                time: frame["time"],
                fps: frame["fps"],
                headset: {
                    position: {
                        x: frame["h"]["p"]["x"],
                        y: frame["h"]["p"]["y"],
                        z: frame["h"]["p"]["z"],
                    },
                    rotation: {
                        x: frame["h"]["r"]["x"],
                        y: frame["h"]["r"]["y"],
                        z: frame["h"]["r"]["z"],
                        w: frame["h"]["r"]["w"],
                    },
                },
                leftHand: {
                    position: {
                        x: frame["l"]["p"]["x"],
                        y: frame["l"]["p"]["y"],
                        z: frame["l"]["p"]["z"],
                    },
                    rotation: {
                        x: frame["l"]["r"]["x"],
                        y: frame["l"]["r"]["y"],
                        z: frame["l"]["r"]["z"],
                        w: frame["l"]["r"]["w"],
                    },
                },
                rightHand: {
                    position: {
                        x: frame["r"]["p"]["x"],
                        y: frame["r"]["p"]["y"],
                        z: frame["r"]["p"]["z"],
                    },
                    rotation: {
                        x: frame["r"]["r"]["x"],
                        y: frame["r"]["r"]["y"],
                        z: frame["r"]["r"]["z"],
                        w: frame["r"]["r"]["w"],
                    },
                },
            };
            this.frames.push(replayFrame);
        }
        // Process note data
        for (let i = 0; i < replayJson["notes"].length; i++) {
            let note = replayJson["notes"][i];
            let replayNote = {
                noteID: note["noteID"],
                eventTime: note["eventTime"],
                spawnTime: note["spawnTime"],
                eventType: note["eventType"],
                noteCutInfo: null,
            };
            // noteCutInfo is not always present (e.g. for missed notes)
            if (note["noteCutInfo"] !== undefined) {
                replayNote.noteCutInfo = {
                    speedOK: note["noteCutInfo"]["speedOK"],
                    directionOK: note["noteCutInfo"]["directionOK"],
                    saberTypeOK: note["noteCutInfo"]["saberTypeOK"],
                    wasCutTooSoon: note["noteCutInfo"]["wasCutTooSoon"],
                    saberSpeed: note["noteCutInfo"]["saberSpeed"],
                    saberDir: {
                        x: note["noteCutInfo"]["saberDir"]["x"],
                        y: note["noteCutInfo"]["saberDir"]["y"],
                        z: note["noteCutInfo"]["saberDir"]["z"],
                    },
                    saberType: note["noteCutInfo"]["saberType"],
                    timeDeviation: note["noteCutInfo"]["timeDeviation"],
                    cutDirDeviation: note["noteCutInfo"]["cutDirDeviation"],
                    cutPoint: {
                        x: note["noteCutInfo"]["cutPoint"]["x"],
                        y: note["noteCutInfo"]["cutPoint"]["y"],
                        z: note["noteCutInfo"]["cutPoint"]["z"],
                    },
                    cutNormal: {
                        x: note["noteCutInfo"]["cutNormal"]["x"],
                        y: note["noteCutInfo"]["cutNormal"]["y"],
                        z: note["noteCutInfo"]["cutNormal"]["z"],
                    },
                    cutDistanceToCenter: note["noteCutInfo"]["cutDistanceToCenter"],
                    cutAngle: note["noteCutInfo"]["cutAngle"],
                    beforeCutRating: note["noteCutInfo"]["beforeCutRating"],
                    afterCutRating: note["noteCutInfo"]["afterCutRating"],
                };
            }
            this.notes.push(replayNote);
        }
        // Process wall data
        for (let i = 0; i < replayJson["walls"].length; i++) {
            let wall = replayJson["walls"][i];
            let replayWall = {
                wallID: wall["wallID"],
                energy: wall["energy"],
                time: wall["time"],
                spawnTime: wall["spawnTime"],
            };
            this.walls.push(replayWall);
        }
        // Process pause data
        for (let i = 0; i < replayJson["pauses"].length; i++) {
            let pause = replayJson["pauses"][i];
            let replayPause = {
                duration: pause["duration"],
                time: pause["time"],
            };
            this.pauses.push(replayPause);
        }
        // Process height data
        for (let i = 0; i < replayJson["heights"].length; i++) {
            let height = replayJson["heights"][i];
            let replayHeight = {
                height: height["height"],
                time: height["time"],
            };
            this.heights.push(replayHeight);
        }
    }
    findFrame(time) {
        // Find the nearest frame to this time
        let nearestFrame;
        let nearestFrameTime = 0;
        for (let i = 0; i < this.frames.length; i++) {
            let frame = this.frames[i];
            if (frame.time > time) {
                break;
            }
            nearestFrame = frame;
            nearestFrameTime = frame.time;
        }
        // If we didn't find a frame, return the last frame
        if (nearestFrame === undefined) {
            return this.frames[this.frames.length - 1];
        }
        return nearestFrame;
    }
    getLeftSaber3DPosition(time) {
        let frame = this.findFrame(time);
        return new three_1.Vector3(-frame.leftHand.position.x, frame.leftHand.position.y, frame.leftHand.position.z - this.frames[0].headset.position.z);
    }
    getRightSaber3DPosition(time) {
        let frame = this.findFrame(time);
        return new three_1.Vector3(-frame.rightHand.position.x, frame.rightHand.position.y, frame.rightHand.position.z - this.frames[0].headset.position.z);
    }
    getHeadset3DPosition(time) {
        let frame = this.findFrame(time);
        return new three_1.Vector3(frame.headset.position.x, frame.headset.position.y, frame.headset.position.z - (this.frames[0].headset.position.z));
    }
    makeRotationVectorFromUnityQuat(x, y, z, w) {
        var q = new three_1.Quaternion(-x, y, z, -w);
        var v = new three_1.Euler();
        v.setFromQuaternion(q);
        v.y += Math.PI; // Y is 180 degrees off
        v.z *= -1; // flip Z
        return new three_1.Vector3(v.x, v.y, v.z);
    }
    getRightSaber3DRotation(time) {
        let frame = this.findFrame(time);
        let rotation = this.makeRotationVectorFromUnityQuat(frame.rightHand.rotation.x, frame.rightHand.rotation.y, frame.rightHand.rotation.z, frame.rightHand.rotation.w);
        return rotation;
    }
    getLeftSaber3DRotation(time) {
        let frame = this.findFrame(time);
        let rotation = this.makeRotationVectorFromUnityQuat(frame.leftHand.rotation.x, frame.leftHand.rotation.y, frame.leftHand.rotation.z, frame.leftHand.rotation.w);
        return rotation;
    }
    getHeadset3DRotation(time) {
        let frame = this.findFrame(time);
        let rotation = this.makeRotationVectorFromUnityQuat(frame.headset.rotation.x, frame.headset.rotation.y, frame.headset.rotation.z, frame.headset.rotation.w);
        return rotation;
    }
}
exports.default = ReplayHelper;
