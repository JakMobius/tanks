import ToolManager from "./toolmanager";
import BasicEventHandlerSet from "src/utils/basic-event-handler-set";
import RootControlsResponder from "src/client/controls/root-controls-responder";


class Tool {
	public dragging: boolean;
	public cursor: string;
	public locksDragging: boolean;
	public settingsView: any;
    public controlsEventHandler = new BasicEventHandlerSet()

    /**
     * Path to tool icon
     */
    image: string | null = null

    /**
     * Localized tool name
     */
    name: string | null = null

    /**
     * Tool manager associated with this tool
     */
    manager: ToolManager = null

    constructor(manager: ToolManager) {
        this.image = null
        this.manager = manager
        this.name = null
        this.dragging = false
        this.cursor = null
        this.locksDragging = true
        this.settingsView = null
    }

    setCursor(cursor: string): void {
        this.cursor = cursor
        this.manager.updateCursor()
    }

    mouseDown(x: number, y: number): void {
        this.dragging = true
    }

    mouseMove(x: number, y: number): void {

    }

    mouseUp(x: number, y: number): void {
        this.dragging = false
    }

    becomeActive(): void {
        this.controlsEventHandler.setTarget(RootControlsResponder.getInstance())
    }

    resignActive(): void {
        this.controlsEventHandler.setTarget(null)
    }

    trace(x1: number, y1: number, x2: number, y2: number, callback: (x: number, y: number) => void) {
        let dx = x2 - x1
        let dy = y2 - y1

        callback(x1, y1)

        if(dx === 0 && dy === 0) {
            return
        }

        let adx = Math.abs(dx);
        let ady = Math.abs(dy);

        let sx = dx > 0
        let sy = dy > 0

        if(adx > ady) {
            dx /= adx;
            dy /= adx;
        } else {
            dx /= ady;
            dy /= ady;
        }

        let x = x1
        let y = y1

        while(true) {
            callback(Math.floor(x), Math.floor(y))
            x += dx
            y += dy
            if((dx !== 0 && x !== x2 && (x > x2) === sx) || (dy !== 0 && y !== y2 && (y > y2) === sy)) break;
        }
    }
}

export default Tool;