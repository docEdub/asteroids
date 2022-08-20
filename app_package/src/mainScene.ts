import {
    Engine,
    Matrix,
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
    constructor() {
        const engine = Engine.LastCreatedEngine!
        super(engine)

        this.clearColor.set(0, 0, 0, 1)
        new UniversalCamera("Camera", Vector3.ZeroReadOnly)

        const keyboardInput = new KeyboardInput
        const playerShip = new PlayerShip
        const world = new World

        this.onBeforeRenderObservable.add((scene, state) => {
            playerShip.resetOrientationIncrements()

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
            if (PlayerShip.ThrustEpsilon < playerShip.thrust) {
                world.translate(Constant.ZAxis, -playerShip.thrust, Space.WORLD)
            }

            world.doSectorWrap()

            if (playerShip.pitch < -PlayerShip.AngleIncrementEpsilon || PlayerShip.AngleIncrementEpsilon < playerShip.pitch) {
                world.rotateAround(Vector3.ZeroReadOnly, Constant.XAxis, playerShip.pitch)
            }
            if (playerShip.yaw < -PlayerShip.AngleIncrementEpsilon || PlayerShip.AngleIncrementEpsilon < playerShip.yaw) {
                world.rotateAround(Vector3.ZeroReadOnly, Constant.YAxis, playerShip.yaw)
            }
            if (playerShip.roll < -PlayerShip.AngleIncrementEpsilon || PlayerShip.AngleIncrementEpsilon < playerShip.roll) {
                world.rotateAround(Vector3.ZeroReadOnly, Constant.ZAxis, playerShip.roll)
            }
        })

        const canvas = document.getElementById("renderCanvas")!
        canvas.style.outline = "none"

        // Show the UI for 4 seconds when the mouse moves; otherwise hide it.
        let showUiTimeoutId = 0
        let debugLayerSelection: any = null

        this.debugLayer.onSelectionChangedObservable.add((entity: any) => {
            debugLayerSelection = entity
        })

        const showUi = () => {
            document.body.style.cursor = "auto"
            clearTimeout(showUiTimeoutId)
            showUiTimeoutId = setTimeout(hideUi, 4000)
        }

        const hideUi = () => {
            document.body.style.cursor = "none"
        }

        const disableHideUi = () => {
            clearTimeout(showUiTimeoutId)
        }

        const showInspector = () => {
            this.debugLayer.select(debugLayerSelection)
            this.debugLayer.show()
            canvas.focus()
        }

        const hideInspector = () => {
            this.debugLayer.hide()
            canvas.focus()
        }

        showUi()
        canvas.focus()

        canvas.onmousemove = () => {
            showUi()
        }
        canvas.onmouseenter = () => {
            showUi()
            canvas.focus()
        }
        canvas.onmouseleave = () => {
            disableHideUi()
            keyboardInput.resetPressedKeys()
        }
        canvas.onblur = () => {
            keyboardInput.resetPressedKeys()
        }

        document.onkeydown = (event: KeyboardEvent) => {
            switch (event.key) {
                case "Escape":
                    if (!document.fullscreenElement) {
                        hideUi()
                        if (!this.debugLayer.isVisible()) {
                            showInspector()
                        }
                        else {
                            hideInspector()
                        }
                    }
                    break
                case "Enter":
                    if (!document.fullscreenElement) {
                        document.documentElement.requestFullscreen()
                    } else if (document.exitFullscreen) {
                        document.exitFullscreen()
                    }
                    break
            }
        }
    }
}
