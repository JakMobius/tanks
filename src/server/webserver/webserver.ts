import express from 'express';
import Logger from '../log/logger';
import session from 'express-session';
import * as path from 'path';
import GameModule from './game/game-module';
import HubModule from './hub/hub-module';
import BaseModule from './base-module';
import WebserverModule from "./webserver-module";
import * as HTTP from "http";
import * as http from "http";
import StaticModule from "./static/static-module";
import Server from "../server";
import {WebserverSession} from "./webserver-session";

const init = require('express/lib/middleware/init').init

export default class WebServer {
	public app: express.Application;
	public logger: Logger;
	public httpServer: HTTP.Server;
	public session: express.RequestHandler;
    public server: Server;

    modules = new Map<Number, [WebserverModule]>()

    hubModule = new HubModule()
    gameModule = new GameModule()
    baseModule = new BaseModule()
    staticModule = new StaticModule()

    private requestInit: (req: http.IncomingMessage, res: any, next: () => void) => void

    constructor(server: Server) {
        this.server = server
        this.app = express()
        this.setupApp()
        this.logger = Logger.global
        this.httpServer = null

        this.addModule(this.hubModule)
        this.addModule(this.gameModule)
        this.addModule(this.baseModule)
        this.addModule(this.staticModule)

        this.baseModule.enabled = true
        this.staticModule.enabled = true
    }

    addModule(module: WebserverModule) {
        module.setServer(this)
        if(this.modules.has(module.priority)) {
            this.modules.get(module.priority).push(module)
        } else {
            this.modules.set(module.priority, [module])
        }
    }

    *getModules(): Generator<WebserverModule, WebserverModule> {
        let valueListIterator: Iterator<[WebserverModule]> = this.modules.values()
        let valueList: IteratorResult<[WebserverModule], [WebserverModule]> = null
        let valueIterator: Iterator<WebserverModule> | null = null

        while(true) {
            let handle: IteratorResult<WebserverModule, WebserverModule>
            if (valueIterator) handle = valueIterator.next()

            while (!handle || handle.done) {
                valueList = valueListIterator.next()
                if (valueList.done) {
                    break;
                }
                valueIterator = valueList.value.values()
                handle = valueIterator.next()
            }

            if(!handle || !handle.value) break;

            if (handle.value.enabled) yield handle.value
        }

        return null
    }

    setupApp() {
        this.app.set('view engine', 'hbs')
        this.app.set('views', path.resolve(__dirname, "resources/web"))
        this.app.disable("x-powered-by")

        this.app.use(function(req, res, next) {
            //res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });

        this.requestInit = init(this.app)

        this.session = session({
            secret: this.server.config.webServer.sessionKey,
            store: this.server.db.getWebserverStore(),
            resave: true,
            saveUninitialized: false
        })

        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(this.session)

        this.app.use((req, res, next) => {
            let iterator = this.getModules()

            const iterate = (err: any = null) => {
                if(err) {
                    next(err)
                    return
                }
                let handle = iterator.next()
                if(handle.done) {
                    next()
                    return
                }

                handle.value.router(req, res, iterate)
            }

            iterate()
        })


        this.app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
            this.onError(err, req, res, next)
        })
    }

    onError(err: Error, req: express.Request, res: express.Response, next: express.NextFunction) {
        res.status(500);

        console.error("An error occurred in the webserver while handling a request: " + req.method + " " + req.url + " with body: ", req.body, err)

        if (req.accepts('html')) {
            res.render('default/views/500.hbs');
        } else if (req.accepts('json')) {
            res.send({ error: 'Internal server error' });
        } else {
            res.type('txt').send('Internal server error');
        }
    }

    listen(server: HTTP.Server) {
        this.httpServer = server
        server.on("request", this.app)
    }

    disable() {
        this.httpServer.off("request", this.app)
    }

    getSessionFor(httpRequest: http.IncomingMessage, callback: (session: WebserverSession) => void) {
        // Hacky way to get the session from the express session middleware
        let httpResult = {}
        this.requestInit(httpRequest, httpResult, () => {
            let req = httpRequest as express.Request
            let res = httpResult as express.Response

            this.session(req, res, () => {
                callback(req.session as WebserverSession)
            })
        })
    }
}
