import BasicCameraProgramController from "../controllers/basic-camera-program-controller";
import LightMaskTextureProgram from "./light-mask-texture-program";

export default class MaskTextureProgramController extends BasicCameraProgramController<LightMaskTextureProgram> {

    public lightAngle: number = 1.5

    reset() {
        super.reset();
        this.program.setLightAngle(this.lightAngle)
    }
}