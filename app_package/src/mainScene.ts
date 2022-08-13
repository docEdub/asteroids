import {
    Engine,
    MeshBuilder,
    Scene,
    Space,
    StandardMaterial,
    TransformNode,
    UniversalCamera,
    Vector3,
} from "@babylonjs/core"

import { PlayerShip } from "./gameObjects/playerShip"
import { KeyboardInput } from "./inputs/keyboardInput"

const XAxis = new Vector3(1, 0, 0)
const YAxis = new Vector3(0, 1, 0)
const ZAxis = new Vector3(0, 0, 1)

const PlayAreaSize = 10000
const HalfPlayAreaSize = PlayAreaSize / 2

const AngleIncrement = 0.01
const AngleIncrementEpsilon = AngleIncrement / 10
const ThrustIncrement = 0.01
const ThrustEpsilon = ThrustIncrement / 10
const MaxThrust = 10

export class MainScene extends Scene {
    constructor (engine: Engine) {
        super(engine)

        const keyboardInput = new KeyboardInput(this)
        let thrust = 0
        let yaw = 0
        let pitch = 0
        let roll = 0

        new UniversalCamera("PlayerShipCamera", Vector3.ZeroReadOnly)
        const worldTransform = new TransformNode("WorldTransform")
        const playerShip = new PlayerShip(this)

        const boundary = MeshBuilder.CreateBox("SceneBoundary")
        const boundaryMaterial = new StandardMaterial('SceneBoundary')
        boundaryMaterial.emissiveColor.set(1, 1, 1)
        boundaryMaterial.wireframe = true
        boundary.material = boundaryMaterial
        boundary.scaling.setAll(HalfPlayAreaSize)
        boundary.setParent(worldTransform)

        this.onBeforeRenderObservable.add((scene, state) => {
            if (keyboardInput.fireIsPressed) {
                playerShip.fire()
            }

            if (keyboardInput.thrustIsPressed) {
                if (thrust < MaxThrust) {
                    thrust = Math.min(thrust + ThrustIncrement, MaxThrust)
                }
            }
            else {
                if (0 < thrust) {
                    thrust = Math.max(0, thrust - ThrustIncrement)
                }
            }

            if (keyboardInput.warpIsPressed) {
                // TODO: Fade view out to a cool quantum graphic and delay updating the position and showing the player ship.
                // playerShip.hide()
                // worldTransform.position.set(HalfPlayAreaSize * Math.random() - PlayAreaSize, HalfPlayAreaSize * Math.random() - PlayAreaSize, HalfPlayAreaSize * Math.random() - PlayAreaSize)
                // playerShip.show()
            }

            yaw = 0
            if (keyboardInput.yawNoseRightIsPressed) {
                yaw = -AngleIncrement
            }
            if (keyboardInput.yawNoseLeftIsPressed) {
                yaw = AngleIncrement
            }

            pitch = 0
            if (keyboardInput.pitchNoseDownIsPressed) {
                pitch = -AngleIncrement
            }
            if (keyboardInput.pitchNoseUpIsPressed) {
                pitch = AngleIncrement
            }

            roll = 0
            if (keyboardInput.rollCounterClockwiseIsPressed) {
                roll = -AngleIncrement
            }
            if (keyboardInput.rollClockwiseIsPressed) {
                roll = AngleIncrement
            }
        })

        this.onAfterRenderObservable.add((scene, state) => {
            if (ThrustEpsilon < thrust) {
                worldTransform.translate(ZAxis, -thrust, Space.WORLD)
            }
            if (yaw < -AngleIncrementEpsilon || AngleIncrementEpsilon < yaw) {
                worldTransform.rotateAround(Vector3.ZeroReadOnly, YAxis, yaw)
            }
            if (pitch < -AngleIncrementEpsilon || AngleIncrementEpsilon < pitch) {
                worldTransform.rotateAround(Vector3.ZeroReadOnly, XAxis, pitch)
            }
            if (roll < -AngleIncrementEpsilon || AngleIncrementEpsilon < roll) {
                worldTransform.rotateAround(Vector3.ZeroReadOnly, ZAxis, roll)
            }
        })
    }
}
