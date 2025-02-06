import WebserverModule from "../webserver-module";
import express from "express";
import path from "path";
import WebServer from "src/server/webserver/webserver";

export default class StaticModule extends WebserverModule {
    setServer(server: WebServer) {
        super.setServer(server)

        this.resourcesDirectory = this.webServer.server.getResourcePath("web")
        
        this.router.use("/static/", express.static(this.resourcePath("static")))
    }
}