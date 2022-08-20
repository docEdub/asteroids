import {
    Mesh,
    MeshBuilder,
    Scene,
    StandardMaterial,
    TransformNode,
    Vector3
} from "@babylonjs/core"

export class World extends TransformNode {
    private static readonly Size = 10000

    private static readonly HalfSize = World.Size / 2

    constructor (scene: Scene) {
        super("World", scene)

        const boundaryMaterial = new StandardMaterial('World.Boundary')
        boundaryMaterial.emissiveColor.set(1, 1, 1)
        boundaryMaterial.wireframe = true

        const boundary = this._boundary
        boundary.isPickable = false
        boundary.material = boundaryMaterial
        boundary.scaling.setAll(World.HalfSize)
        boundary.setParent(this)

        scene.onBeforeRenderObservable.runCoroutineAsync(this._onBeforeRender())
    }

    private _boundary = MeshBuilder.CreateBox("World.Boundary")

    private *_onBeforeRender() {
        yield
    }
}
