import ServerDatabase from "../server-database";
import {UserDataRaw} from "src/client/utils/user-data-raw";
import hashToString from "src/utils/hash-to-string";
import murmurhash3_32_gc from "src/utils/murmurhash";
import * as fs from "fs";
import session from "express-session";
import FileSessionStorage from "./file-session-storage";
import * as path from "path"

export interface FileDatabaseStorage {
    password: string,
    data: UserDataRaw
}

/**
 * Simple file-based database
 */
export default class FileDatabase implements ServerDatabase {
    private hashSeed = 0xd207cec50e90514f
    path: string;

    constructor(databasePath: string) {
        this.path = databasePath
    }

    destroyStorageAtPath(storagePath: string): Promise<any> {
        return fs.promises.rm(path.join(this.path, storagePath))
    }

    async getStorageAtPath(storagePath: string): Promise<any> {
        const file = await fs.promises.readFile(path.join(this.path, storagePath), "utf-8").catch((error): null => {
            if(error.code == "ENOENT") return null
            throw error
        })
        if(!file) return null
        return JSON.parse(file)
    }

    writeStorageAtPath(storagePath: string, data: any): Promise<any> {
        return fs.promises.writeFile(path.join(this.path, storagePath), JSON.stringify(data))
    }

    async getUserStorage(login: string): Promise<FileDatabaseStorage | null> {
        const hash = this.getUsernameHash(login)
        const hashStorage = await this.getStorageAtPath("users/" + hash)
        if(!hashStorage) return null
        return hashStorage[login]
    }

    getUsernameHash(login: string): string {
        return hashToString(murmurhash3_32_gc(login, this.hashSeed))
    }

    async authoriseUser(login: string, password: string): Promise<boolean> {
        let data = await this.getUserStorage(login)
        if(!data) return false
        return data.password == password;
    }

    async createUser(login: string, password: string): Promise<boolean> {
        const hash = this.getUsernameHash(login)
        let hashStorage = await this.getStorageAtPath(login)
        if(!hashStorage) hashStorage = {}
        if(hashStorage[login]) return false
        hashStorage[login] = { password: password, data: {} }
        await this.writeStorageAtPath("users/" + hash, hashStorage)
        return true
    }


    async getUserInfo(login: string): Promise<UserDataRaw> {
        const storage = await this.getUserStorage(login)
        return storage.data
    }

    async modifyUserInfo(login: string, data: UserDataRaw): Promise<void> {
        const hash = this.getUsernameHash(login)
        const hashStorage = await this.getStorageAtPath("users/" + hash)
        hashStorage[login].data = data
        await this.writeStorageAtPath("users/" + hash, hashStorage)
    }

    getWebserverStore(): session.Store {
        return new FileSessionStorage({
            db: this
        })
    }

    connect(): Promise<void> {
        return fs.promises.mkdir(path.join(this.path, "users"), { recursive: true }).then()
    }

    async disconnect(force: boolean): Promise<void> {
        return Promise.resolve()
    }
}