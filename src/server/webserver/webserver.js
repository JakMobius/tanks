const express = require('express')
const Logger = require("../log/logger")
const session = require('express-session')
const path = require("path")

const GameModule = require("./game/game-module")
const HubModule = require("./hub/hub-module")
const BaseModule = require("./base-module")

class WebServer {

    /**
     * @type {Map<Number, [WebserverModule]>}
     */
    modules = new Map()

    constructor() {
        this.app = express()
        this.setupApp()
        this.logger = Logger.global
        this.server = null

        this.hubModule = new HubModule()
        this.gameModule = new GameModule()
        this.baseModule = new BaseModule()

        this.addModule(this.hubModule)
        this.addModule(this.gameModule)
        this.addModule(this.baseModule)

        this.baseModule.enabled = true
    }

    addModule(module) {
        if(this.modules.has(module.priority)) {
            this.modules.get(module.priority).push(module)
        } else {
            this.modules.set(module.priority, [module])
        }
    }

    *getModules() {
        let valueListIterator = this.modules.values()
        let valueList = null

        /** @type {Iterator | null} */
        let valueIterator = null

        while(true) {
            /** @type {IteratorYieldResult} */
            let handle = null
            if (valueIterator) {
                handle = valueIterator.next()
            }

            while (!handle || handle.done) {
                valueList = valueListIterator.next()
                if (valueList.done) {
                    return
                }
                valueIterator = valueList.value.values()
                handle = valueIterator.next()
            }

            if (handle.value.enabled) {
                yield handle.value
            }
        }
    }

    setupApp() {
        this.app.set('view engine', 'hbs')
        this.app.set('views', path.resolve(__dirname, "../../client/"))

        this.app.use(function(err, req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });

        this.session = session({
            secret: "f1qbc248ecd09bdh0j5r7o8",
            resave: true,
            saveUninitialized: true
        })

        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(this.session)

        this.app.use((req, res, next) => {
            let iterator = this.getModules()

            const iterate = () => {
                let handle = iterator.next()
                if(handle.done) {
                    next()
                    return
                }

                handle.value.router(req, res, iterate)
            }

            iterate()
        })
    }

    /**
     *
     * @param server
     */

    listen(server) {
        this.server = server
        server.on("request", this.app)
    }

    disable() {
        this.server.off("request", this.app)
    }
}

module.exports = WebServer
