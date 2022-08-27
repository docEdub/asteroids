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

const instanceXform = new Matrix
const rotationXform = new Matrix
const translationXform = new Matrix
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

    /**
     * Creates an instance of the given mesh in each sector.
     *
     * @param mesh
     * @param sectorizeCenter
     */
    public static Sectorize(mesh: Mesh) {
        const scale = World.Size / mesh.scaling.x
        for (let x = -World.SectorIndexMax; x <= World.SectorIndexMax ; x++) {
            for (let y = -World.SectorIndexMax; y <= World.SectorIndexMax; y++) {
                for (let z = -World.SectorIndexMax; z <= World.SectorIndexMax; z++) {
                    mesh.thinInstanceAdd(Matrix.Translation(x * scale, y * scale, z * scale), (x + y + z) == 3 * World.SectorIndexMax)
                }
            }
        }
    }

    public static UpdateSectorizedInstances(node: TransformNode, mesh: Mesh) {
        let thinInstanceIndex = 0
        const scale = World.Size / mesh.scaling.x
        for (let x = -World.SectorIndexMax; x <= World.SectorIndexMax ; x++) {
            for (let y = -World.SectorIndexMax; y <= World.SectorIndexMax; y++) {
                for (let z = -World.SectorIndexMax; z <= World.SectorIndexMax; z++) {
                    const worldXform = node.getWorldMatrix()
                    worldXform.getRotationMatrixToRef(rotationXform)
                    node.rotationQuaternion?.toRotationMatrix(rotationXform)
                    Matrix.TranslationToRef(x * scale, y * scale, z * scale, translationXform)
                    rotationXform.multiplyToRef(translationXform, instanceXform)
                    rotationXform.invertToRef(rotationXform)
                    instanceXform.multiplyToRef(rotationXform, instanceXform)
                    mesh.thinInstanceSetMatrixAt(thinInstanceIndex, instanceXform, (x + y + z) == 3 * World.SectorIndexMax)
                    thinInstanceIndex++
                }
            }
        }
    }

    /**
     *  Keeps the given node in the center sector no matter how far it moves.
     */
     public static WrapNode(node: TransformNode) {
        World.WrapNodePositionOnAxis(node, node.position.x, Constant.XAxis)
        World.WrapNodePositionOnAxis(node, node.position.y, Constant.YAxis)
        World.WrapNodePositionOnAxis(node, node.position.z, Constant.ZAxis)
    }

    private static WrapNodePositionOnAxis(node: TransformNode, position: Number, axis: Vector3) {
        if (position < -World.HalfSize) {
            node.translate(axis, World.Size, Space.WORLD)
        }
        else if (World.HalfSize < position) {
            node.translate(axis, -World.Size, Space.WORLD)
        }
    }

    constructor() {
        const scene = Engine.LastCreatedScene!
        super("World", scene)

        const boundaryTexture = Texture.LoadFromSvgString(`
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">
                <line x1="0" y1="0" x2="64" y2="0"/>
                <line x1="64" y1="0" x2="64" y2="64"/>
                <line x1="64" y1="64" x2="0" y2="64"/>
                <line x1="0" y1="64" x2="0" y2="0"/>
                <style>
                    line {
                        fill: none;
                        stroke: #fff;
                        stroke-width: 2;
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
        boundaryMaterial.alpha = 0.05

        const boundary = this._boundary
        boundary.isPickable = false
        boundary.material = boundaryMaterial
        boundary.scaling.setAll(World.Size)
        boundary.setParent(this)

        World.Sectorize(boundary)
    }

    private _boundary = MeshBuilder.CreateBox("World.Boundary")
}
