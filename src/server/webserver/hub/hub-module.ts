
import WebserverModule from '../webserver-module';
import path from 'path';
import express from 'express';

class HubModule extends WebserverModule {
    constructor() {
        super();

        this.resourcesDirectory = path.resolve(__dirname, "../../../client/hub/page/")

        this.router.get("/hub/", (req, res, next) => {
            res.render("hub-page/page/index")
        })

        this.router.use("/hub/styles/", express.static(this.resourcePath("styles")))
        this.router.use("/hub/scripts/", express.static(this.resourcePath("scripts")))
    }
}

export default HubModule;