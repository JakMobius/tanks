import Logger from "./logger";

export default class StdinCatchLogger extends Logger {
    private stdoutHandler: { (buffer: (Uint8Array | string)): boolean; };
    private stderrHandler: { (buffer: (Uint8Array | string)): boolean; };


    constructor() {
        super();
    }

    public catchStd() {
        if(this.stdoutHandler) return

        this.stdoutHandler = process.stdout.write
        this.stderrHandler = process.stderr.write

        process.stdout.write = (buffer: string) => this.handleBuffer(buffer, false)
        process.stderr.write = (buffer: string) => this.handleBuffer(buffer, true)
    }

    private handleBuffer(buffer: string, error: boolean): boolean {
        this.log(buffer)

        return true
    }

    public releaseStd() {
        if(!this.stdoutHandler) return

        process.stdout.write = this.stdoutHandler
        process.stderr.write = this.stderrHandler

        this.stdoutHandler = null
        this.stderrHandler = null
    }
}