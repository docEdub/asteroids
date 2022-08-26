import {
    Engine,
    Texture as BabylonTexture
} from "@babylonjs/core"

export class Texture extends BabylonTexture {
    public static LoadFromSvgString = (svgString: string) => {
        // Setting a unique name is required otherwise the first texture created gets used all the time.
        // See https://forum.babylonjs.com/t/why-does-2nd-texture-use-first-svg/23975.
        Texture._svgTextureCount++
        const name = Texture._svgTextureCount.toString()
        const texture = Texture.LoadFromDataString(name, 'data:image/svg+xml;base64,' + window.btoa(svgString), Engine.LastCreatedScene!)
        texture.onLoadObservable.addOnce(() => {
            texture.updateSamplingMode(Texture.TRILINEAR_SAMPLINGMODE)
        })
        return texture
    }

    private static _svgTextureCount = 0
}
