import TruckProgram from "src/client/graphics/programs/truck-program";
import BasicCameraProgramController from "src/client/graphics/programs/controllers/basic-camera-program-controller";
import ConvexShapeProgram from "src/client/graphics/programs/convex-shapes/convex-shape-program";
import TextureProgram from "src/client/graphics/programs/texture-program";
import ColoredTextureProgram from "src/client/graphics/programs/colored-texture-program";
import LightMaskTextureProgram from "src/client/graphics/programs/light-mask-texture/light-mask-texture-program";
import MaskTextureProgramController
    from "src/client/graphics/programs/light-mask-texture/light-mask-texture-program-controller";
import ProgramPool from "src/client/graphics/program-pool";
import Entity from "src/utils/ecs/entity";

export default class GameProgramPool extends ProgramPool {
    constructor(camera: Entity, ctx: WebGLRenderingContext) {
        super();

        this.registerFactory(TruckProgram, () => {
            const truckProgram = new TruckProgram(ctx)
            return new BasicCameraProgramController(truckProgram, camera)
        })

        this.registerFactory(ConvexShapeProgram, () => {
            const convexShapeProgram = new ConvexShapeProgram(ctx)
            return new BasicCameraProgramController(convexShapeProgram, camera)
        })

        this.registerFactory(TextureProgram, () => {
            const textureProgram = new TextureProgram(ctx)
            return new BasicCameraProgramController(textureProgram, camera)
        })

        this.registerFactory(ColoredTextureProgram, () => {
            const coloredTextureProgram = new ColoredTextureProgram(ctx)
            return new BasicCameraProgramController(coloredTextureProgram, camera)
        })

        this.registerFactory(LightMaskTextureProgram, () => {
            const maskTextureProgram = new LightMaskTextureProgram(ctx)
            return new MaskTextureProgramController(maskTextureProgram, camera)
        })
    }
}