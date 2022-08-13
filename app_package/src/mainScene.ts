import { Engine, Mesh, Scene } from "@babylonjs/core";
import { PlayerShip } from "./ships/playerShip";

export class MainScene extends Scene {
    constructor (engine: Engine) {
        super(engine);
        new PlayerShip(this)
        Mesh.CreateGround("ground1", 6, 6, 2, this);
        this.createDefaultCameraOrLight();
    }
}
