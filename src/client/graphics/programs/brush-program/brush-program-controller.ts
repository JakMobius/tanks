import BasicCameraProgramController from "../controllers/basic-camera-program-controller";
import BrushProgram from "./brush-program";
import GameMap from "src/map/game-map";
import {Quadrangle} from "src/utils/quadrangle";
import Color from "src/utils/color";

export default class BrushProgramController extends BasicCameraProgramController<BrushProgram> {

    public brushBounds: Quadrangle
    public blockSize = GameMap.BLOCK_SIZE
    public brushX: number
    public brushY: number
    public brushColor: Color
    public brushIsSquare: boolean;
    public brushDiameter: number;

    protected didBind() {
        super.didBind();
        this.program.setBrushBounds(this.brushBounds)
        this.program.setBrushCenter(this.brushX, this.brushY)
        this.program.setBlockSize(this.blockSize)
        this.program.setBrushColor(
            this.brushColor.getRed(),
            this.brushColor.getGreen(),
            this.brushColor.getBlue(),
            this.brushColor.getAlpha()
        )

        if(this.brushIsSquare) this.program.setBrushDiameter(0)
        else this.program.setBrushDiameter(this.brushDiameter)
    }
}