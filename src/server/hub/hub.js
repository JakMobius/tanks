const express = require('express')
const fs = require('fs')
const chalk = require("chalk")
const DB = require("../db/")
const Logger = require("../log/logger")
const session = require('express-session')
const path = require("path")

class Hub {
    constructor() {
        this.app = express()
        this.resourcesDirectory = path.resolve(__dirname, "../../client/hub/")
        this.setupApp()
        this.logger = Logger.global
    }

    resourcePath(resource) {
        return path.resolve(this.resourcesDirectory, resource)
    }

    log(text) {
        this.logger.log(text)
    }

    onerror(err, res, req) {
        res.status(500);
        if (req.accepts('html')) {
            res.render('500');
            return;
        }

        if (req.accepts('json')) {
            res.send({ error: 'Internal server error' });
            return;
        }

        res.type('txt').send('Internal server error');
    }

    shouldAuthenticateForURL(url) {

        function isDir(path) {
            return path === url || url.startsWith(path + "/")
        }

        if(url === "/") return true
        if(isDir("/monitoring")) return true
        if(isDir("/overview")) return true
        if(isDir("/archive")) return true
        if(isDir("/scripts")) return true
        if(isDir("/ajax")) return true
        if(isDir("/meta")) return true

        return false
    }

    checkAuth(req, res, next) {

        next();
    }

    setupApp() {

        const self = this

        this.app.set('view engine', 'hbs')
        this.app.set('views', this.resourcePath("views"));

        this.app.use(function(err, req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });

        this.session = session({
            secret: "cbdc1ce2211d70126154a3e51e350",
            resave: true,
            saveUninitialized: true
        })

        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(this.session)
        this.app.use(function() {
            self.checkAuth.apply(self, arguments)
        })

        this.app.get('/', (request, response) => {
            response.render('home')
        })

        const ajaxHandler = (request, response) => {

            const p = request.path.substr(6)
            const path = "./ajax/" + p

            try {
                if(fs.lstatSync(path).isDirectory()) {
                    //require(path + "/index.js").request(request, response, self.postServer)
                }
            } catch(error) {
                if(!fs.existsSync(path + ".js")) {
                    response.status(422).send({
                        message: 'No such ajax handler: ' + p + ''
                    })
                }// else require(path).request(request, response, self.postServer)
            }
        }

        this.app.get(/(ajax)\/.*/, ajaxHandler)
        this.app.post(/(ajax)\/.*/, ajaxHandler)

        this.app.set('static', this.resourcePath("static"))
        this.app.use('/img', express.static(this.resourcePath('img')));
        this.app.use('/scripts', express.static(this.resourcePath('scripts')));
        this.app.use('/styles', express.static(this.resourcePath('styles')));


        this.app.use(function(req, res, next){
            res.status(404);

            if (req.accepts('html')) {
                res.render('404');
            } else if (req.accepts('json')) {
                res.send({ error: 'Not found' });
            } else {
                res.type('txt').send('Not found');
            }
        });

        this.app.use(function(err, req, res) {
            self.onerror(err, res, req)
        });
    }

    /**
     *
     * @param server
     */

    listen(server) {
        server.on("request", this.app)
    }
}

module.exports = Hub
