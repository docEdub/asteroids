import {
    Engine,
    MeshBuilder,
    Scene,
    StandardMaterial,
    TransformNode,
} from "@babylonjs/core";
import { World } from "./world"

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

        const hull = this._hull
        hull.material = hullMaterial
        hull.position.set(0, 0, 100)
        hull.scaling.setAll(10)
        hull.setParent(this)

        World.Sectorize(hull)
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

    private _hull = MeshBuilder.CreateCylinder("PlayerShip.Hull", {
        diameterTop: 0,
        diameterBottom: 1,
        tessellation: 3
    })
}
