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
import { Shot } from "./shot"
import { World } from "./world"

const instanceXform = new Matrix
const rotationXform = new Matrix
const translationXform = new Matrix
const vector3 = new Vector3

export class PlayerShip extends TransformNode {
    private static readonly AngleIncrement = 0.03
    private static readonly ThrustIncrement = 0.03
    private static readonly MaxThrust = 5
    private static readonly CoastFactor = 0.0025
    private static readonly FireDelay = 100 // ms

    private static readonly AngleIncrementEpsilon = PlayerShip.AngleIncrement / 10
    private static readonly ThrustEpsilon = PlayerShip.ThrustIncrement / 10
    private static readonly ThrustEpsilonSquared = PlayerShip.ThrustEpsilon * PlayerShip.ThrustEpsilon
    private static readonly MaxThrustSquared = PlayerShip.MaxThrust * PlayerShip.MaxThrust

    private pitch = 0
    private yaw = 0
    private roll = 0
    private thrustVector = new Vector3
    private hull = MeshBuilder.CreateCylinder("PlayerShip.Hull", {
        diameterTop: 0,
        diameterBottom: 1,
        tessellation: 3
    })
    private shots = [ new Shot, new Shot, new Shot, new Shot, new Shot ]
    private shotCount = 0
    private maxShotCount = this.shots.length
    private lastFireTime = 0

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
        World.Sectorize(this.hull)

        for (let i = 0; i < this.maxShotCount; i++) {
            const shot = this.shots[i]
            shot.position.z = 50 * i
        }

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

    public thrust() {
        this.forward.scaleToRef(PlayerShip.ThrustIncrement, vector3)
        this.thrustVector.addInPlace(vector3)
        if (PlayerShip.MaxThrustSquared < this.thrustVector.lengthSquared()) {
            this.thrustVector.scaleInPlace(PlayerShip.MaxThrust / this.thrustVector.length())
        }
    }

    public coast() {
        this.thrustVector.scaleInPlace(1 - PlayerShip.CoastFactor)
    }

    public fire() {
        const now = Date.now()
        if (PlayerShip.FireDelay < now - this.lastFireTime) {
            for (let i = 0; i < this.maxShotCount; i++) {
                const shot = this.shots[i]
                if (!shot.isActive) {
                    vector3.copyFrom(this.position)
                    this.forward.scaleAndAddToRef(60, vector3)
                    shot.activate(vector3, this.rotationQuaternion)
                    this.lastFireTime = now
                    return
                }
            }
        }
    }

    public hide() {

    }

    public show() {

    }

    private onAfterRender() {
        if (PlayerShip.ThrustEpsilonSquared < this.thrustVector.lengthSquared()) {
            this.position.addInPlace(this.thrustVector)
        }

        World.WrapNode(this)

        if (this.pitch < -PlayerShip.AngleIncrementEpsilon || PlayerShip.AngleIncrementEpsilon < this.pitch) {
            this.rotateAround(this.position, this.right, -this.pitch)
        }
        if (this.yaw < -PlayerShip.AngleIncrementEpsilon || PlayerShip.AngleIncrementEpsilon < this.yaw) {
            this.rotateAround(this.position, this.up, -this.yaw)
        }
        if (this.roll < -PlayerShip.AngleIncrementEpsilon || PlayerShip.AngleIncrementEpsilon < this.roll) {
            this.rotateAround(this.position, this.forward, -this.roll)
        }

        World.UpdateSectorizedInstances(this, this.hull)
    }
}
