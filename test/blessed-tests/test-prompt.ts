
import * as blessed from '../../src/library/blessed-fork/lib/blessed'

class HistoryEntry {
    public text: any;
    public cursorPos: any;

    constructor(text: string, cursorPos: number) {
        this.text = text
        this.cursorPos = cursorPos
    }

    storeState(console: ConsoleWindow) {
        this.text = console.layout.consoleTextbox.value
        this.cursorPos = console.layout.consoleTextbox.cursorPosition
    }

    restoreState(console: ConsoleWindow) {
        console.layout.consoleTextbox.setValue(this.text)
        console.layout.consoleTextbox.setCursorPosition(this.cursorPos)
    }
}

class ConsoleWindowLayout extends blessed.Element {
    public consoleTextbox: blessed.Prompt;
    public scrollView: blessed.ScrollableText;
    public promptLabel: blessed.Text;

    constructor(options: blessed.ElementConfig) {
        super(options)

        this.scrollView = new blessed.ScrollableText({
            position: {
                x: 0,
                y: 0
            },
            scrollable: true,
            style: {
                fg: new blessed.TTYColor('white'),
                bg: new blessed.TTYColor('black')
            },
            mouse: true
        })

        this.consoleTextbox = new blessed.Prompt({
            position: {
                height: 1,
            },
            style: {
                fg: new blessed.TTYColor('white'),
                bg: new blessed.TTYColor('black')
            }
        });

        this.promptLabel = new blessed.Text({
            position: {
                x: 0,
                width: 0,
                height: 1,
            },
            style: {
                fg: new blessed.TTYColor('white'),
                bg: new blessed.TTYColor('black')
            }
        })

        this.append(this.consoleTextbox);
        this.append(this.scrollView);
        this.append(this.promptLabel)
    }

    onResize() {
        super.onResize();
        this.layout()
    }

    onAttach() {
        super.onAttach();
        this.layout()
    }

    layout() {
        if(!this.parent) return

        this.position.width = this.parent.position.width
        this.position.height = this.parent.position.height
        this.scrollView.position.width = this.position.width
        this.scrollView.position.height = this.position.height - 1
        this.consoleTextbox.position.width = this.position.width - this.promptLabel.position.width
        this.consoleTextbox.position.y = this.position.height - 1
        this.promptLabel.position.y = this.position.height - 1

        this.screen.render()
    }
}

class ConsoleWindow {
    public history: HistoryEntry[];
    public historyIndex: number;
    public currentHistoryEntry: HistoryEntry;
    public lines: number;
    public screen: blessed.Screen;

    public prompt: string
    private waitsForRender: boolean;
    layout: ConsoleWindowLayout;

    constructor() {

        this.screen = new blessed.Screen({
            smartCSR: true,
            cursor: {
                //artificial: true,
                blink: true,
                shape: "line"
            },
            fullUnicode: true
        })

        this.screen.program.on("keypress", (_: any, data: any) => {
            if(data.name === "tab") {
                this.onTab(data.shift)
            }
        })

        this.layout = new ConsoleWindowLayout(this.screen)
        this.screen.append(this.layout)

        this.history = []
        this.historyIndex = null
        this.waitsForRender = false

        this.currentHistoryEntry = new HistoryEntry(null, 0)
        this.lines = 0

        this.layout.consoleTextbox.key(["C-c"], () => this.onExit())

        this.layout.consoleTextbox.key(["enter"], () => {
            const command = this.layout.consoleTextbox.value
            this.addHistoryEntry(command)
            this.onCommand(command)
            this.layout.consoleTextbox.setValue("")
            this.render()
        })

        this.layout.consoleTextbox.key(["up"], () => this.historyGoUp())
        this.layout.consoleTextbox.key(["down"], () => this.historyGoDown())

        this.setPrompt("")
        this.refocus()
        this.render()
    }

    onTab(shift: boolean) {
        if(shift) {
            this.write("Shift-tab detected!")
        } else {
            this.write("Tab detected!")
        }
    }

    onExit() {
        this.screen.destroy()
    }

    onCommand(text: string) {
        if(text.startsWith("prompt ")) {
            this.write("You've changed your prompt!")
            this.setPrompt(text.substring(7))
        } else {
            this.write("You've entered a command: " + text)
        }
    }

    addHistoryEntry(command: string) {

        let pushHistoryEntry = true

        if (this.history.length > 0) {
            if (this.historyIndex === null) {
                const index = this.history.length - 1
                if (this.history[index].text === command) {
                    this.history[index].cursorPos = this.layout.consoleTextbox.cursorPosition
                    pushHistoryEntry = false
                }
            }
        }

        if(pushHistoryEntry) {
            this.history.push(new HistoryEntry(command, this.layout.consoleTextbox.cursorPosition))
        }

        this.historyIndex = null
    }

    historyGoUp() {
        if(this.historyIndex === null) {
            if(this.history.length > 0) {
                this.currentHistoryEntry.storeState(this)
                this.historyIndex = this.history.length - 1;
            } else {
                return
            }
        } else {
            this.history[this.historyIndex].storeState(this)
            this.historyIndex--;
        }

        if(this.historyIndex < 0) this.historyIndex = 0

        this.history[this.historyIndex].restoreState(this)
        this.render()
    }

    historyGoDown() {
        if (this.historyIndex === null) return

        this.history[this.historyIndex].storeState(this)

        this.historyIndex++

        if (this.historyIndex >= this.history.length) {
            this.historyIndex = null
            this.currentHistoryEntry.restoreState(this)
        } else {
            this.history[this.historyIndex].restoreState(this)
        }

        this.render()
    }

    write(text: string) {
        let lines = text.split("\n")
        this.layout.scrollView.insertLine(this.lines, lines);
        this.layout.scrollView.setScrollPerc(100)
        this.lines += lines.length
        this.render();
    }

    setPrompt(prompt: string) {
        this.prompt = prompt

        prompt += "> "
        this.layout.promptLabel.content = prompt
        this.layout.promptLabel.position.width = prompt.length
        this.layout.consoleTextbox.position.x = prompt.length
    }

    render() {
        if(this.waitsForRender) return
        this.waitsForRender = true

        setImmediate(() => {
            this.screen.render();
            this.waitsForRender = false
        })
    }

    refocus() {
        let focused = this.screen.getfocused()
        if (!focused || !(focused instanceof blessed.Prompt))
            this.layout.consoleTextbox.focus()
    }

    setLine(text: string) {
        this.layout.consoleTextbox.setValue(text)
        this.render()
    }
}

// Test code:

let window = new ConsoleWindow()
window.write((
    "  -----------------------------------------------\n" +
    "  |             Console prompt test             |\n" +
    "  |---------------------------------------------|\n" +
    "  | 1) Ensure that commands are properly        |\n" +
    "  |    entered and prompted                     |\n" +
    "  | 2) Check arrow keys: left and right keys    |\n" +
    "  |    should navigate the cursor, up and down  |\n" +
    "  |    keys should list command history         |\n" +
    "  | 3) alt+left and alt+right keys should move  |\n" +
    "  |    cursor by word                           |\n" +
    "  | 4) Ensure tab and shift+tab combinations    |\n" +
    "  |    are handled and not written to prompt    |\n" +
    "  | 5) Mouse wheel should scroll the internal   |\n" +
    "  |    terminal screen, not the native one      |\n" +
    "  | 6) Long commands should enable horizontal   |\n" +
    "  |    scroll mode in the prompt                |\n" +
    "  | 7) You should be able to change prompt      |\n" +
    "  |    by typing 'prompt %text%'                |\n" +
    "  -----------------------------------------------"
))

