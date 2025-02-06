
const Server = require("../src/server/server.js")
const fs = require("fs")
const Command = require("../src/server/commands/command.js")
const mocha = require("mocha")
const chai = require("chai")
const path = require("path")

const assert = chai.assert
const describe = mocha.describe
const it = mocha.it
const before = mocha.before
const after = mocha.after

const serverPath = path.join(import.meta.dirname, "../src/server");

describe('Server', function() {

    let logs = []
    let server = null

    before('Fire Up', function() {
        server = new Server({
            silent: true
        })
        server.terminate()
        server.console.logger.addDestination({
            log: function(text) {
                text.split("\n").forEach((line) => {
                    logs.push(line);
                })
            }
        })
    })

    function latestLog() {
        if(logs.length === 0) {
            return null
        }
        return logs[logs.length - 1]
    }

    it("should have been initialized", function() {
        assert.isNotNull(server)
    })

    describe('Console', function () {
        let list = fs.readdirSync(path.join(serverPath, "commands"))
        let commands = new Map()

        it("should have all command fs compiling", function() {
            for(let file of list) {
                let command = require(path.join(serverPath, "commands", file))

                if (command instanceof Command) {
                    // Checking all getters

                    command.getName();
                    command.getDescription();
                    command.getUsage();
                    command.requiresRoom();

                    commands.set(command.getName(), command)
                }
            }
        })

        it('should ignore commented lines', function () {
            logs = []
            server.console.evaluate("#this is a comment line")
            assert.strictEqual(logs.length, 1, "Console tried to interpret commented line")
        });

        it('should ignore empty lines', function() {
            logs = []
            server.console.evaluate("  ")
            assert.strictEqual(logs.length, 1, "Console tried to interpret line of whitespaces")
        })

        describe('"help" command', function () {
            it("should have each command listed", function() {
                logs = []
                server.console.evaluate("help")
                assert.isNotEmpty(logs, "Room command did not print any text");

                let list = fs.readdirSync(path.join(serverPath, "commands"))
                let log = logs.join("\n")

                for(let entry of commands.entries()) {
                    assert.include(log, entry[1].getName(), "'" + entry[1].getName() + '" command not listed in "help"')
                }
            })
        });

        describe('"room" command', function() {
            it("should print out usage when used without arguments", function() {
                logs = []
                server.console.evaluate("room")
                assert.isNotEmpty(logs, "Room command did not print any text");
                assert.include(latestLog(), commands.get("room").getUsage(), "Room command does not print usage when used without arguments.")
            })

            it('should print out maps on "room create"', function() {
                logs = []
                server.console.evaluate("room create")
                assert.isNotEmpty(logs, "Room command did not print any text");

                let log = logs.join("\n")
                let maps = fs.readdirSync(path.join(serverPath, "maps")).map((name) => {
                    let parts = name.split(".")
                    if(parts.length > 1) parts.pop() // Removing extension
                    return parts.join(".")
                })

                for(let map of maps) {
                    assert.include(log, map, "'" + map + '" map not listed in "room create"')
                }
            })

            it('should be able to create rooms and connect to them', function() {
                logs = []

                server.console.evaluate("room create empty empty")
                server.console.evaluate("room view empty")
                assert.strictEqual(server.console.prompt, "empty", "Console failed to connect to the room") // Check if we have entered the room
                server.console.evaluate("exit") // returning back to main screen
            })
        })

        describe('"ai command"', function() {
            it('should create bots', function() {
                server.console.evaluate("room create empty empty")
                server.console.evaluate("room view empty")
                server.console.evaluate("ai create test_bot")
            })

            it('should remove bots', function() {
                server.console.evaluate("ai remove 0")
            })
        })
    });

    after('should terminate', function() {
        server.terminate()
    })
});
