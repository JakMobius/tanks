import express from 'express';
import Logger from '../log/logger';
import session from 'express-session';
import GameModule from './game/game-module';
import BaseModule from './base-module';
import WebserverModule from "./webserver-module";
import * as HTTP from "http";
import StaticModule from "./static/static-module";
import Server from "../server";
import {WebserverSession} from "./webserver-session";
import bodyParser from "body-parser"

// TODO: Figure out another way
// @ts-ignore
import { init } from 'express/lib/middleware/init.js';
import { getLocalIPAddresses } from './network-interfaces';


export default class WebServer {
	public app: express.Application;
	public logger: Logger;
	public httpServer: HTTP.Server;
	public session: express.RequestHandler;
    public server: Server;

    modules = new Map<Number, [WebserverModule]>()

    gameModule = new GameModule()
    baseModule = new BaseModule()
    staticModule = new StaticModule()

    private requestInit: (req: HTTP.IncomingMessage, res: any, next: () => void) => void

    constructor(server: Server) {
        this.server = server
        this.app = express()
        this.setupApp()
        this.logger = Logger.global
        this.httpServer = null

        this.addModule(this.gameModule)
        this.addModule(this.baseModule)
        this.addModule(this.staticModule)

        this.baseModule.enabled = true
        this.staticModule.enabled = true
    }

    checkAllowedOrigin(req: express.Request, res: express.Response) {
        const allowedOrigins = this.server.config.webServer.allowedOrigins

        if(allowedOrigins === "*") return true

        const requestOrigin = req.get('origin')

        if(!requestOrigin) {
            if(this.server.config.webServer.allowNoOrigin) {
                return true;
            } else {
                res.status(403).send({
                    error: 'forbidden',
                    description: 'no origin header'
                });
                return false;
            }
        }
        
        let requestOriginHostname
        try {
            requestOriginHostname = new URL(requestOrigin).hostname
        } catch(e) {
            if(this.server.config.webServer.allowNoOrigin) {
                return true
            }

            res.status(403).send({
                error: 'forbidden',
                description: 'invalid origin header'
            });
            return false;
        }

        for(let allowedOrigin of allowedOrigins) {
            if(allowedOrigin instanceof RegExp) {
                if(allowedOrigin.test(requestOriginHostname)) {
                    return true;
                }
            } else if(allowedOrigin === requestOriginHostname) {
                return true;
            }
        }

        if(this.server.config.webServer.allowLocalInterfaceOrigins) {
            if(getLocalIPAddresses().indexOf(requestOriginHostname) !== -1) {
                return true
            }
        }

        res.status(403).send({
            error: 'forbidden',
            description: 'origin ' + requestOrigin + ' is not allowed'
        });
        return false;
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
        this.app.set('views', this.server.getResourcePath("web"))
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
            saveUninitialized: false,
            cookie: {
                maxAge: 24 * 60 * 60 * 1000,
                httpOnly: true, 
                secure: false,
                sameSite: 'strict',
            }
        })

        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(bodyParser.json());
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
            res.render('views/500.hbs');
        } else if (req.accepts('json')) {
            res.send({ error: 'internal-server-error' });
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

    getSessionFor(httpRequest: HTTP.IncomingMessage, callback: (session: WebserverSession) => void) {
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
