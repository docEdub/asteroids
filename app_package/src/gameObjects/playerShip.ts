import {
    Mesh,
    Scene,
    TransformNode,
    Vector3
} from "@babylonjs/core";

export class PlayerShip extends TransformNode {
    constructor (scene: Scene) {
        super("PlayerShip", scene);

        scene.onBeforeRenderObservable.runCoroutineAsync(this._bounceCoroutine());

    }

    public fire() {

    }

    public hide() {

    }

    public show() {

    }

    private *_bounceCoroutine() {
        yield;
    }
}
