
import * as blessed from "src/library/blessed-fork/lib/blessed";

export default class ConsoleBox extends blessed.Element {
    public readonly consoleTextbox: blessed.Prompt;
    public readonly scrollView: blessed.ScrollableText;
    public readonly promptLabel: blessed.Text;
    public readonly suggestionLabel: blessed.Text;

    constructor(options: blessed.ElementConfig) {
        super(options)

        this.position.x = 0
        this.position.y = 0

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

        this.suggestionLabel = new blessed.Text({
            position: {
                x: 0,
                y: 0,
                height: 1
            },
            hidden: true,
            style: {
                fg: new blessed.TTYColor('gray')
            }
        })

        this.append(this.consoleTextbox);
        this.append(this.scrollView);
        this.append(this.promptLabel)
        this.consoleTextbox.append(this.suggestionLabel)
    }

    onResize() {
        super.onResize();
        this.handleResize()
    }

    onAttach() {
        super.onAttach();
        this.handleResize()
    }

    handleResize() {
        let pos = this.position

        pos.width = this.parent.position.width
        pos.height = this.parent.position.height

        this.scrollView.position.width = pos.width
        this.scrollView.position.height = pos.height - 1
        this.scrollView.onResize()

        this.consoleTextbox.position.x = this.promptLabel.position.width
        this.consoleTextbox.position.y = pos.height - 1
        this.consoleTextbox.position.width = pos.width - this.promptLabel.position.width
        this.consoleTextbox.onResize()

        this.promptLabel.position.y = pos.height - 1
        this.promptLabel.onMove()
    }

    render() {
        if(!this.parent) return

        this.suggestionLabel.position.x = this.consoleTextbox.getValue().length
        this.suggestionLabel.position.width = this.consoleTextbox.position.width - this.suggestionLabel.position.x

        super.render()
    }
}