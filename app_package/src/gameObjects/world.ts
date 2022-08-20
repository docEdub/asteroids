import {
    Engine,
    Matrix,
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

    constructor() {
        const scene = Engine.LastCreatedScene!
        super("World", scene)

        console.log(`SectorCount = ${World.SectorCount}`)

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

        for (let x = -World.SectorIndexMax; x <= World.SectorIndexMax ; x++) {
            for (let y = -World.SectorIndexMax; y <= World.SectorIndexMax; y++) {
                for (let z = -World.SectorIndexMax; z <= World.SectorIndexMax; z++) {
                    boundary.thinInstanceAdd(Matrix.Translation(x, y, z), (x + y + z) == 3 * World.SectorIndexMax)
                }
            }
        }

        scene.onAfterRenderObservable.add((scene, event) => { this._onAfterRender() })
    }

    /**
     *  Keeps the world in the middle sector no matter how far the player ship moves.
     */
    public doSectorWrap = () => {
        const local = this.getPositionExpressedInLocalSpace()
        if (local.z <= -World.HalfSize) {
            vector3.copyFrom(Constant.ZAxis)
            vector3.scaleInPlace(World.Size)
            this.locallyTranslate(vector3)
        }
        else if (World.HalfSize <= local.z) {
            vector3.copyFrom(Constant.ZAxis)
            vector3.scaleInPlace(-World.Size)
            this.locallyTranslate(vector3)
        }
        else if (local.y <= -World.HalfSize) {
            vector3.copyFrom(Constant.YAxis)
            vector3.scaleInPlace(World.Size)
            this.locallyTranslate(vector3)
        }
        else if (World.HalfSize <= local.y) {
            vector3.copyFrom(Constant.YAxis)
            vector3.scaleInPlace(-World.Size)
            this.locallyTranslate(vector3)
        }
        else if (local.x <= -World.HalfSize) {
            vector3.copyFrom(Constant.XAxis)
            vector3.scaleInPlace(World.Size)
            this.locallyTranslate(vector3)
        }
        else if (World.HalfSize <= local.x) {
            vector3.copyFrom(Constant.XAxis)
            vector3.scaleInPlace(-World.Size)
            this.locallyTranslate(vector3)
        }
    }

    private _boundary = MeshBuilder.CreateBox("World.Boundary")

    private _onAfterRender() {
    }
}
