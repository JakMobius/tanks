
import WebserverModule from '../webserver-module';
import path from 'path';
import express from 'express';

class HubModule extends WebserverModule {
    constructor() {
        super();

        this.resourcesDirectory = path.resolve(__dirname, "resources/web/hub")
        
        this.router.get("/hub/", (req, res, next) => {
            res.render("hub/views/index")
        })

        this.router.use("/hub/styles/", express.static(this.resourcePath("styles")))
        this.router.use("/hub/scripts/", express.static(this.resourcePath("scripts")))
        this.router.use("/hub/assets/", express.static(this.resourcePath("assets")))
    }
}

export default HubModule;