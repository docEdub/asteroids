import { Mesh, Scene, TransformNode } from "@babylonjs/core";

export class PlayerShip extends TransformNode {
    constructor (scene: Scene) {
        super("PlayerShip", scene);
        const sphere = Mesh.CreateSphere("sphere", 16, 2, scene);
        sphere.setParent(this);
        this.sphere = sphere

        this.position.y = 1;

        scene.onBeforeRenderObservable.runCoroutineAsync(this._bounceCoroutine());
    }

    private *_bounceCoroutine() {
        for (let frameCount = 0; true; ++frameCount) {
            this.sphere.position.y = 1 + 2 * Math.abs(Math.sin(frameCount / 16));
            yield;
        }
    }
}
