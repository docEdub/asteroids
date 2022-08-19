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

        const boundary = MeshBuilder.CreateBox("World.Boundary")
        const boundaryMaterial = new StandardMaterial('World.Boundary')
        boundaryMaterial.emissiveColor.set(1, 1, 1)
        boundaryMaterial.wireframe = true
        boundary.material = boundaryMaterial
        boundary.scaling.setAll(World.HalfSize)
        boundary.setParent(this)
        this._boundary = boundary

        scene.onBeforeRenderObservable.runCoroutineAsync(this._onBeforeRender())
    }

    private _boundary = MeshBuilder.CreateBox("World.Boundary")

    private *_onBeforeRender() {
        yield
    }
}
