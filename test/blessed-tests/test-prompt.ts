
import ConsoleWindow from "../../src/server/console/console-window";

class TestConsoleWindow extends ConsoleWindow {

    onTab(shift: boolean) {
        super.onTab(shift)
        if(shift) {
            this.write("Shift-tab detected!")
        } else {
            this.write("Tab detected!")
        }
    }

    onCommand(text: string) {
        super.onCommand(text)
        if(text.startsWith("prompt ")) {
            this.write("You've changed your prompt!")
            this.setPrompt(text.substring(7))
        } else {
            this.write("You've entered a command: " + text)
        }
    }
}

// Test code:

let window = new TestConsoleWindow()
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
    "  | 8) Command line should suggest you when you |\n" +
    "  |    start typing 'prompt' command            |\n" +
    "  -----------------------------------------------"
))

