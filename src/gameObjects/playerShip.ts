import {
    Engine,
    Matrix,
    MeshBuilder,
    Scene,
    Space,
    StandardMaterial,
    TransformNode,
    Vector3,
} from "@babylonjs/core";
import { Constant } from "../constant"
import { World } from "./world"

const instanceXform = new Matrix
const rotationXform = new Matrix
const translationXform = new Matrix
const vector3 = new Vector3

export class PlayerShip extends TransformNode {
    private static readonly AngleIncrement = 0.015
    private static readonly ThrustIncrement = 0.01
    private static readonly MaxThrust = 5

    private static readonly AngleIncrementEpsilon = PlayerShip.AngleIncrement / 10
    private static readonly ThrustEpsilon = PlayerShip.ThrustIncrement / 10

    private pitch = 0
    private yaw = 0
    private roll = 0
    private thrust = 0
    private hull = MeshBuilder.CreateCylinder("PlayerShip.Hull", {
        diameterTop: 0,
        diameterBottom: 1,
        tessellation: 3
    })

    constructor () {
        const scene = Engine.LastCreatedScene!
        super("PlayerShip", scene);

        const hullMaterial = new StandardMaterial("PlayerShip.Hull")
        hullMaterial.backFaceCulling = false
        hullMaterial.diffuseColor.set(1, 1, 1)
        hullMaterial.emissiveColor.set(1, 1, 1)
        hullMaterial.wireframe = true

        const hull = this.hull
        hull.material = hullMaterial
        hull.scaling.setAll(50)
        hull.rotation.x = Math.PI / 2
        hull.bakeCurrentTransformIntoVertices()
        hull.rotation.z = -Math.PI / 2
        hull.bakeCurrentTransformIntoVertices()
        hull.position.z = 10
        hull.setParent(this)
        hull.clone() // Makes hull for sector 0.
        World.Sectorize(this.hull, false)

        scene.onAfterRenderObservable.add((scene, eventState) => {
            this.onAfterRender()
        })
    }

    public resetOrientationIncrements() {
        this.yaw = 0
        this.pitch = 0
        this.roll = 0
    }

    public pitchUp() {
        this.pitch = PlayerShip.AngleIncrement
    }

    public pitchDown() {
        this.pitch = -PlayerShip.AngleIncrement
    }

    public yawRight() {
        this.yaw = -PlayerShip.AngleIncrement
    }

    public yawLeft() {
        this.yaw = PlayerShip.AngleIncrement
    }

    public rollLeft() {
        this.roll = -PlayerShip.AngleIncrement
    }

    public rollRight() {
        this.roll = PlayerShip.AngleIncrement
    }

    public increaseThrust() {
        if (this.thrust < PlayerShip.MaxThrust) {
            this.thrust = Math.min(this.thrust + PlayerShip.ThrustIncrement, PlayerShip.MaxThrust)
        }
    }

    public decreaseThrust() {
        if (0 < this.thrust) {
            this.thrust = Math.max(0, this.thrust - PlayerShip.ThrustIncrement)
        }
    }

    public fire() {

    }

    public hide() {

    }

    public show() {

    }

    private updateInstances() {
        let thinInstanceIndex = 0

        const scale = World.Size / this.hull.scaling.x
        for (let x = -World.SectorIndexMax; x <= World.SectorIndexMax ; x++) {
            for (let y = -World.SectorIndexMax; y <= World.SectorIndexMax; y++) {
                for (let z = -World.SectorIndexMax; z <= World.SectorIndexMax; z++) {
                    if (x + y + z == 0) { // Skip sector 0.
                        continue
                    }

                    const worldXform = this.getWorldMatrix()
                    worldXform.getRotationMatrixToRef(rotationXform)
                    this.rotationQuaternion?.toRotationMatrix(rotationXform)
                    Matrix.TranslationToRef(x * scale, y * scale, z * scale, translationXform)
                    rotationXform.multiplyToRef(translationXform, instanceXform)
                    rotationXform.invertToRef(rotationXform)
                    instanceXform.multiplyToRef(rotationXform, instanceXform)
                    this.hull.thinInstanceSetMatrixAt(thinInstanceIndex, instanceXform, (x + y + z) == 3 * World.SectorIndexMax)
                    thinInstanceIndex++
                }
            }
        }
    }

    /**
     *  Keeps the world in the center sector no matter how far the player ship moves.
     */
    private doSectorWrap() {
        this.wrapPositionOnAxis(this.position.x, Constant.XAxis)
        this.wrapPositionOnAxis(this.position.y, Constant.YAxis)
        this.wrapPositionOnAxis(this.position.z, Constant.ZAxis)
    }

    private wrapPositionOnAxis(position: Number, axis: Vector3) {
        if (position <= -World.HalfSize) {
            this.translate(axis, World.Size, Space.WORLD)
        }
        else if (World.HalfSize <= position) {
            this.translate(axis, -World.Size, Space.WORLD)
        }
    }

    private onAfterRender() {
        if (PlayerShip.ThrustEpsilon < this.thrust) {
            this.translate(Constant.ZAxis, this.thrust)
        }

        this.doSectorWrap()

        if (this.pitch < -PlayerShip.AngleIncrementEpsilon || PlayerShip.AngleIncrementEpsilon < this.pitch) {
            this.rotateAround(this.position, this.right, -this.pitch)
        }
        if (this.yaw < -PlayerShip.AngleIncrementEpsilon || PlayerShip.AngleIncrementEpsilon < this.yaw) {
            this.rotateAround(this.position, this.up, -this.yaw)
        }
        if (this.roll < -PlayerShip.AngleIncrementEpsilon || PlayerShip.AngleIncrementEpsilon < this.roll) {
            this.rotateAround(this.position, this.forward, -this.roll)
        }

        this.updateInstances()
    }
}
