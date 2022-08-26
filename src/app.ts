import { Engine } from "@babylonjs/core"
import { MainScene } from "./mainScene"

const createScene = async () => {

    const canvas = <HTMLCanvasElement>document.getElementById('BabylonCanvas')

    // This creates a Babylon engine object
    const engine = new Engine(canvas, true, {
        // preserveDrawingBuffer: true,
        // stencil: true
    })

    // This resizes the BabylonJS window when the browser window is resized
    window.addEventListener('resize', function() {
        engine.resize()
    })

    // This creates the scene
    var scene = new MainScene

    // This renders each frame of the scene
    engine.runRenderLoop(() => {
        scene.render()
    })
}

createScene()
