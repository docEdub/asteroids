import {
    Engine,
    Matrix,
    Mesh,
    MeshBuilder,
    Scene,
    Space,
    StandardMaterial,
    TransformNode,
    Vector3,
} from "@babylonjs/core"
import { Constant } from "../constant"
import { Texture } from "../Materials/Textures/texture"

const vector3 = new Vector3

export class World extends TransformNode {
    public static readonly Size = 1000
    public static readonly HalfSize = World.Size / 2

    /**
     * The depth of sector stack surrounding the middle sector in all directions.
     */
    public static readonly SectorIndexMax = 2
    private static readonly SectorCount = Math.pow(World.SectorIndexMax * 2 + 1, 3)
    private static readonly BoundaryGridScale = 20

    public static Sectorize = (mesh: Mesh) => {
        const scale = World.Size / mesh.scaling.x
        for (let x = -World.SectorIndexMax; x <= World.SectorIndexMax ; x++) {
            for (let y = -World.SectorIndexMax; y <= World.SectorIndexMax; y++) {
                for (let z = -World.SectorIndexMax; z <= World.SectorIndexMax; z++) {
                    mesh.thinInstanceAdd(Matrix.Translation(x * scale, y * scale, z * scale), (x + y + z) == 3 * World.SectorIndexMax)
                }
            }
        }
    }

    constructor() {
        const scene = Engine.LastCreatedScene!
        super("World", scene)

        const boundaryTexture = Texture.LoadFromSvgString(`
            <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
                <line x1="0%" y1="0%" x2="100%" y2="0%"/>
                <line x1="100%" y1="0%" x2="100%" y2="100%"/>
                <line x1="100%" y1="100%" x2="0%" y2="100%"/>
                <line x1="0%" y1="1000%" x2="0%" y2="0%"/>
                <style>
                    line {
                        fill: none;
                        stroke: #222;
                        stroke-opacity: "10%";
                        stroke-width: 16;
                    }
                </style>
            </svg>
        `);

        boundaryTexture.uScale = boundaryTexture.vScale = World.BoundaryGridScale
        const boundaryMaterial = new StandardMaterial('World.Boundary')
        boundaryMaterial.ambientTexture = boundaryTexture
        boundaryMaterial.backFaceCulling = false
        boundaryMaterial.disableLighting = true
        boundaryMaterial.emissiveColor.set(1, 1, 1)
        boundaryMaterial.opacityTexture = boundaryTexture

        const boundary = this._boundary
        boundary.isPickable = false
        boundary.material = boundaryMaterial
        boundary.scaling.setAll(World.Size)
        boundary.setParent(this)

        World.Sectorize(boundary)
    }

    /**
     *  Keeps the world in the middle sector no matter how far the player ship moves.
     */
    public doSectorWrap = () => {
        const local = this.getPositionExpressedInLocalSpace()
        this.doSectorWrapOnLocalAxis(local.x, Constant.XAxis)
        this.doSectorWrapOnLocalAxis(local.y, Constant.YAxis)
        this.doSectorWrapOnLocalAxis(local.z, Constant.ZAxis)
    }

    private doSectorWrapOnLocalAxis = (pointOnAxis: Number, axis: Vector3) => {
        if (pointOnAxis <= -World.HalfSize) {
            this.locallyTranslate(vector3.copyFrom(axis).scaleInPlace(World.Size))
        }
        else if (World.HalfSize <= pointOnAxis) {
            this.locallyTranslate(vector3.copyFrom(axis).scaleInPlace(-World.Size))
        }
    }

    private _boundary = MeshBuilder.CreateBox("World.Boundary")
}
