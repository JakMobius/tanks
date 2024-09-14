import session from "express-session";
import FileDatabase from "./file-database";
import fs from "fs";
import path from "path";

export interface FileSessionStorageConfig {
    db: FileDatabase
}

export default class FileSessionStorage extends session.Store {
    private config: FileSessionStorageConfig;

    constructor(config: FileSessionStorageConfig) {
        super()

        this.config = config

        fs.promises.mkdir(path.join(this.config.db.path, "sessions"), { recursive: true }).then()
    }

    destroy(sid: string, callback?: (err?: any) => void): void {
        this.config.db.destroyStorageAtPath("sessions/" + sid).then(() => callback()).catch(callback)
    }

    get(sid: string, callback: (err: any, session?: (session.SessionData | null)) => void): void {
        this.config.db.getStorageAtPath("sessions/" + sid).then((data) => {
            callback(null, data)
        }).catch((err) => {
            callback(err, null)
        })
    }

    set(sid: string, session: session.SessionData, callback?: (err?: any) => void): void {
        this.config.db.writeStorageAtPath("sessions/" + sid, session).then(() => callback()).catch(callback)
    }
}