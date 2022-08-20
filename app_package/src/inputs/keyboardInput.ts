import {
    KeyboardEventTypes,
    Scene
} from "@babylonjs/core";

export class KeyboardInput {
    constructor(scene: Scene) {
        scene.onKeyboardObservable.add((keyboardInfo) => {
            const key = keyboardInfo.event.key
            const pressed = keyboardInfo.type == KeyboardEventTypes.KEYDOWN
            switch (key) {
                case " ":
                    this.fireIsPressed = pressed
                    break

                case "w":
                    this.thrustIsPressed = pressed
                    break

                case "s":
                    this.warpIsPressed = pressed
                    break

                case "ArrowLeft":
                    this.yawNoseLeftIsPressed = pressed
                    break
                case "ArrowRight":
                    this.yawNoseRightIsPressed = pressed
                    break

                case "ArrowUp":
                    this.pitchNoseUpIsPressed = pressed
                    break
                case "ArrowDown":
                    this.pitchNoseDownIsPressed = pressed
                    break

                case "a":
                    this.rollLeftIsPressed = pressed
                    break
                case "d":
                    this.rollRightIsPressed = pressed
                    break
            }
        })

        scene.onAfterRenderObservable.add((scene, state) => {
            this.fireIsPressed = false
            this.warpIsPressed = false
        })
    }

    public resetPressedKeys = () => {
        this.fireIsPressed = false
        this.thrustIsPressed = false
        this.warpIsPressed = false
        this.yawNoseLeftIsPressed = false
        this.yawNoseRightIsPressed = false
        this.pitchNoseUpIsPressed = false
        this.pitchNoseDownIsPressed = false
        this.rollRightIsPressed = false
        this.rollLeftIsPressed = false
    }

    public fireIsPressed: boolean = false
    public thrustIsPressed: boolean = false
    public warpIsPressed: boolean = false
    public yawNoseLeftIsPressed: boolean = false
    public yawNoseRightIsPressed: boolean = false
    public pitchNoseUpIsPressed: boolean = false
    public pitchNoseDownIsPressed: boolean = false
    public rollRightIsPressed: boolean = false
    public rollLeftIsPressed: boolean = false
}
