import {
    Engine,
    Matrix,
    MeshBuilder,
    Quaternion,
    Scene,
    Space,
    StandardMaterial,
    TransformNode,
    Vector3,
} from "@babylonjs/core";
import { Constant } from "../constant"
import { World } from "./world"

const matrix = new Matrix
const instanceXform = new Matrix
const rotationXform = new Matrix
const translationXform = new Matrix
const vector3 = new Vector3

export class Shot extends TransformNode {
    private static readonly Speed = 7.5
    private static readonly MaxDistance = World.Size * 0.75

    private static readonly MaxDistanceSquared = Shot.MaxDistance * Shot.MaxDistance

    private mesh = MeshBuilder.CreateCapsule('', {
        orientation: Constant.ZAxis,
        radius: 1.5,
        height: 20
    })
    private distanceTraveled = 0

    constructor() {
        const scene = Engine.LastCreatedScene!
        super("Shot", scene);

        this.deactivate()
        this.rotationQuaternion = new Quaternion

        const material = new StandardMaterial("PlayerShip.Shot")
        material.emissiveColor.set(1, 1, 1)
        const mesh = this.mesh
        mesh.material = material
        mesh.parent = this
        World.Sectorize(mesh)

        scene.onAfterRenderObservable.add((scene, state) => {
            this.onAfterRender()
        })
    }

    public activate(position: Vector3, rotationQuaternion: Quaternion) {
        if (rotationQuaternion) {
            this.rotationQuaternion!.copyFrom(rotationQuaternion)
        }
        this.position.copyFrom(position)
        this.distanceTraveled = 0
        World.UpdateSectorizedInstances(this, this.mesh)
        this.mesh.isVisible = true
    }

    public deactivate() {
        this.mesh.isVisible = false
    }

    public get isActive() {
        return this.mesh.isVisible
    }

    private onAfterRender() {
        if (this.isActive) {
            this.distanceTraveled += Shot.Speed
            if (Shot.MaxDistance < this.distanceTraveled) {
                this.deactivate()
                return
            }
            this.mesh.forward.scaleToRef(Shot.Speed, vector3)
            this.position.addInPlace(vector3)
            World.WrapNode(this)
        }
    }
}
