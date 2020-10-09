
const WebserverModule = require("./webserver-module")
const path = require("path")
const express = require("express")

class BaseModule extends WebserverModule {
    constructor(options) {
        super(options);

        this.resourcesDirectory = path.resolve(__dirname, "../../client/html/")
        this.priority = WebserverModule.PRIORITY_LOWEST

        this.router.use("/assets/", express.static(this.resourcePath("assets")))
        this.router.use((req, res, next) => this.onNotFound.apply(this, [req, res, next]))
        this.router.use((err, req, res, next) => this.onError.apply(this, [err, req, res, next]))
    }

    onNotFound(req, res, next) {
        res.status(404);

        if (req.accepts('html')) {
            res.render('html/views/404.hbs');
        } else if (req.accepts('json')) {
            res.send({ error: 'Not found' });
        } else {
            res.type('txt').send('Not found');
        }
    }

    onError(err, res, req) {
        res.status(500);

        if (req.accepts('html')) {
            res.render('500');
        } else if (req.accepts('json')) {
            res.send({ error: 'Internal server error' });
        } else {
            res.type('txt').send('Internal server error');
        }
    }
}

module.exports = BaseModule