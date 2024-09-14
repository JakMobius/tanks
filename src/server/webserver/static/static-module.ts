import WebserverModule from "../webserver-module";
import express from "express";
import path from "path";
import WebServer from "src/server/webserver/webserver";

export default class StaticModule extends WebserverModule {
    setServer(server: WebServer) {
        super.setServer(server)

        this.resourcesDirectory = this.webServer.server.getResourcePath("web")

        this.router.use("/styles/", express.static(this.resourcePath("styles")))
        this.router.use("/scripts/", express.static(this.resourcePath("scripts")))
        this.router.use("/assets/", express.static(this.resourcePath("assets")))
    }
}