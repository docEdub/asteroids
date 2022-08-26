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

const instanceXform1 = new Matrix
const instanceXform2 = new Matrix
const rotationXform1 = new Matrix
const rotationXform2 = new Matrix
const translationXform = new Matrix
const vector3 = new Vector3

export class PlayerShip extends TransformNode {
    private static readonly AngleIncrement = 0.015
    private static readonly ThrustIncrement = 0.01
    private static readonly MaxThrust = 5

    public static readonly AngleIncrementEpsilon = PlayerShip.AngleIncrement / 10
    public static readonly ThrustEpsilon = PlayerShip.ThrustIncrement / 10

    constructor () {
        const scene = Engine.LastCreatedScene!
        super("PlayerShip", scene);

        const hullMaterial = new StandardMaterial("PlayerShip.Hull")
        hullMaterial.backFaceCulling = false
        hullMaterial.diffuseColor.set(1, 1, 1)
        hullMaterial.emissiveColor.set(1, 1, 1)
        hullMaterial.wireframe = true

        const hull = MeshBuilder.CreateCylinder("PlayerShip.Hull", {
            diameterTop: 0,
            diameterBottom: 1,
            tessellation: 3
        })
        hull.material = hullMaterial
        hull.scaling.setAll(50)
        hull.rotation.x = Math.PI / 2
        hull.bakeCurrentTransformIntoVertices()
        hull.rotation.z = -Math.PI / 2
        hull.bakeCurrentTransformIntoVertices()
        // hull.position.y = -1.5
        hull.position.z = 10
        hull.setParent(this)
        this.hull = hull
        hull.clone()

        World.Sectorize(this.hull, true)
        this.updateInstances()
    }

    public pitch = 0
    public yaw = 0
    public roll = 0
    public thrust = 0

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

    public updateInstances() {
        let thinInstanceIndex = 0

        const scale = World.Size / this.hull.scaling.x
        for (let x = -World.SectorIndexMax; x <= World.SectorIndexMax ; x++) {
            for (let y = -World.SectorIndexMax; y <= World.SectorIndexMax; y++) {
                for (let z = -World.SectorIndexMax; z <= World.SectorIndexMax; z++) {
                    if (x + y + z == 0) {
                        continue
                    }

                    const worldXform = this.getWorldMatrix()
                    worldXform.getRotationMatrixToRef(rotationXform1)
                    this.rotationQuaternion?.toRotationMatrix(rotationXform1)
                    Matrix.TranslationToRef(x * scale, y * scale, z * scale, translationXform)
                    rotationXform1.multiplyToRef(translationXform, instanceXform1)
                    rotationXform1.invertToRef(rotationXform1)
                    instanceXform1.multiplyToRef(rotationXform1, instanceXform1)
                    this.hull.thinInstanceSetMatrixAt(thinInstanceIndex, instanceXform1, (x + y + z) == 3 * World.SectorIndexMax)
                    thinInstanceIndex++
                }
            }
        }
    }

    /**
     *  Keeps the world in the middle sector no matter how far the player ship moves.
     */
    public doSectorWrap() {
        const local = this.getPositionExpressedInLocalSpace()
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

    private hull = null
    private instanceTransforms = null
}
