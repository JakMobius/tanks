import express from "express";
import path from "path";
import fs from "fs";
import MapSerialization from "src/map/map-serialization";
import pako from "pako";
import AjaxHandler, {AjaxFields} from "src/server/webserver/ajax/ajax-handler";

export interface AvailableMap {
    name: string
    value: string
}

export default class MapListAjaxHandler extends AjaxHandler {
    static url = '/ajax/map-list/'
    static method = 'GET'
    static requiresAuthentication = true

    maps: AvailableMap[] | null = null

    private async getMaps(): Promise<AvailableMap[]> {
        let mapsDirectory = this.module.webServer.server.config.general.mapsDirectory

        let maps: AvailableMap[] = []
        await this.walkMapsRecursively(mapsDirectory, async (fullPath, name) => {
            if(!name.endsWith(".map")) return

            try {
                const gzip = await fs.promises.readFile(fullPath)
                const map = MapSerialization.fromBuffer(pako.inflate(gzip))

                // todo: fetch map name from the file

                maps.push({
                    name: path.relative(mapsDirectory, fullPath),
                    value: name
                })
            } catch (e) {
                // Bad map file
            }
        })
        return maps
    }

    // Callback for each file in folder
    private async walkMapsRecursively(directory: string, callback: (fullPath: string, name: string) => Promise<void>) {
        let files = await fs.promises.readdir(directory, {
            withFileTypes: true
        })

        for (const file of files) {
            let subPath = path.join(directory, file.name)
            if(file.isDirectory()) {
                await this.walkMapsRecursively(subPath, callback)
            } else {
                await callback(subPath, file.name)
            }
        }
    }

    private async asyncHandle(req: express.Request, res: express.Response, next: express.NextFunction) {
        if(!this.maps) {
            this.maps = await this.getMaps()
        }

        res.status(200).send({
            result: "ok",
            maps: this.maps
        })
    }

    handle(req: express.Request, res: express.Response, fields: AjaxFields, next: express.NextFunction) {
        this.asyncHandle(req, res, next).catch(e => {
            next(e)
        })
    }
}