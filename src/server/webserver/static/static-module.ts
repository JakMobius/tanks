import WebserverModule from "../webserver-module";
import express from "express";
import path from "path";

export default class StaticModule extends WebserverModule {
    constructor() {
        super()
        this.resourcesDirectory = path.resolve(__dirname, "resources/web")

        this.router.use("/hub/styles/", express.static(this.resourcePath("hub/styles")))
        this.router.use("/hub/scripts/", express.static(this.resourcePath("hub/scripts")))
        this.router.use("/hub/assets/", express.static(this.resourcePath("hub/assets")))

        this.router.use("/tutorial/styles/", express.static(this.resourcePath("tutorial/styles")))
        this.router.use("/tutorial/scripts/", express.static(this.resourcePath("tutorial/scripts")))
        this.router.use("/tutorial/assets/", express.static(this.resourcePath("game/assets")))

        this.router.use("/game/styles/", express.static(this.resourcePath("game/styles")))
        this.router.use("/game/scripts/", express.static(this.resourcePath("game/scripts")))
        this.router.use("/game/assets/", express.static(this.resourcePath("game/assets")))
    }
}