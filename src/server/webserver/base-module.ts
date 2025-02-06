import WebserverModule from './webserver-module';
import * as path from 'path';
import * as express from 'express';
import WebServer from "src/server/webserver/webserver";

export default class BaseModule extends WebserverModule {
    setServer(server: WebServer) {
        super.setServer(server);

        this.resourcesDirectory = this.webServer.server.getResourcePath("web")
        this.priority = WebserverModule.PRIORITY_LOWEST

        this.router.use("/static/", express.static(this.resourcePath("static")))
        this.router.use((req, res, next) => this.onNotFound.apply(this, [req, res, next]))
    }

    onNotFound(req: express.Request, res: express.Response, next: express.NextFunction) {
        res.status(404);

        if (req.accepts('html')) {
            res.render('views/404.hbs', undefined, (err, html) => {
                if(err) next(err)
                res.send(html)
            });
        } else if (req.accepts('json')) {
            res.send({ error: 'Not found' });
        } else {
            res.type('txt').send('Not found');
        }
    }
}