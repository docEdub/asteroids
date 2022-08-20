import {
    Engine,
    Scene,
    Space,
    UniversalCamera,
    Vector3,
} from "@babylonjs/core"
import "@babylonjs/core/Debug/debugLayer"
import "@babylonjs/inspector"

import { Constant } from "./constant"
import { KeyboardInput } from "./inputs/keyboardInput"
import { PlayerShip } from "./gameObjects/playerShip"
import { World } from "./gameObjects/world"

export class MainScene extends Scene {
    constructor (engine: Engine) {
        super(engine)

        this.clearColor.set(0, 0, 0, 1)
        new UniversalCamera("Camera", Vector3.ZeroReadOnly)

        const keyboardInput = new KeyboardInput(this)
        const playerShip = new PlayerShip(this)
        const world = new World(this)

        this.onBeforeRenderObservable.add((scene, state) => {
            playerShip.resetOrientation()

            if (keyboardInput.pitchNoseDownIsPressed) {
                playerShip.pitchDown()
            }
            if (keyboardInput.pitchNoseUpIsPressed) {
                playerShip.pitchUp()
            }

            if (keyboardInput.yawNoseRightIsPressed) {
                playerShip.yawRight()
            }
            if (keyboardInput.yawNoseLeftIsPressed) {
                playerShip.yawLeft()
            }

            if (keyboardInput.rollLeftIsPressed) {
                playerShip.rollLeft()
            }
            if (keyboardInput.rollRightIsPressed) {
                playerShip.rollRight()
            }

            if (keyboardInput.thrustIsPressed) {
                playerShip.increaseThrust()
            }
            else {
                playerShip.decreaseThrust()
            }

            if (keyboardInput.fireIsPressed) {
                playerShip.fire()
            }

            if (keyboardInput.warpIsPressed) {
                // TODO: Fade view out to a cool quantum graphic and delay updating the position and showing the player ship.
            }
        })

        this.onAfterRenderObservable.add((scene, state) => {
            if (playerShip.pitch < -PlayerShip.AngleIncrementEpsilon || PlayerShip.AngleIncrementEpsilon < playerShip.pitch) {
                world.rotateAround(Vector3.ZeroReadOnly, Constant.XAxis, playerShip.pitch)
            }
            if (playerShip.yaw < -PlayerShip.AngleIncrementEpsilon || PlayerShip.AngleIncrementEpsilon < playerShip.yaw) {
                world.rotateAround(Vector3.ZeroReadOnly, Constant.YAxis, playerShip.yaw)
            }
            if (playerShip.roll < -PlayerShip.AngleIncrementEpsilon || PlayerShip.AngleIncrementEpsilon < playerShip.roll) {
                world.rotateAround(Vector3.ZeroReadOnly, Constant.ZAxis, playerShip.roll)
            }
            if (PlayerShip.ThrustEpsilon < playerShip.thrust) {
                world.translate(Constant.ZAxis, -playerShip.thrust, Space.WORLD)
            }
        })

        // Get keyboard input working without clicking on screen.
        const focusCanvas = () => {
            document.getElementById("renderCanvas")!.focus()
        }

        // Show the UI for 4 seconds when the mouse moves; otherwise hide it.
        let showUiTimeoutId = 0

        const showUi = () => {
            clearTimeout(showUiTimeoutId)

            document.body.style.cursor = "auto"
            this.debugLayer.setAsActiveScene()
            this.debugLayer.show()
            focusCanvas()

            showUiTimeoutId = setTimeout(hideUi, 4000)
        }

        const hideUi = () => {
            document.body.style.cursor = "none"
            this.debugLayer.hide()
            focusCanvas()
        }

        showUi()
        document.onmousemove = () => {
            showUi()
        }
    }
}
