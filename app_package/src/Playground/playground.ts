import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";

class Playground {
    public static CreateScene(engine: BABYLON.Engine, canvas: HTMLCanvasElement): BABYLON.Scene {
        const scene = new BABYLON.Scene(engine);
        const sphere = BABYLON.Mesh.CreateSphere("sphere", 16, 2, scene);
        sphere.position.y = 1;
        BABYLON.Mesh.CreateGround("ground1", 6, 6, 2, scene);
        scene.createDefaultCameraOrLight();

        scene.onBeforeRenderObservable.runCoroutineAsync(function* () {
            for (let frameCount = 0; true; ++frameCount) {
                sphere.position.y = 1 + 2 * Math.abs(Math.sin(frameCount / 16));
                yield;
            }
        }());

        return scene;
    }
}

export function CreatePlaygroundScene(engine: BABYLON.Engine, canvas: HTMLCanvasElement): BABYLON.Scene {
    return Playground.CreateScene(engine, canvas);
}
