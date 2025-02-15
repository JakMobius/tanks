import {URL} from "url";
import {PreferencesSection} from "./preferences/preferences";
import {GeneralServerConfig, ServerClusterConfig, ServerConfig, WebServerConfig} from "./server";
import ServerDatabase from "./db/server-database";
import MongoDatabase from "./db/mongo/mongo-database";
import FileDatabase from "./db/file/file-database";
import path from "path";
import { dirname } from "src/utils/dirname";

export function parseServerConfig(config: PreferencesSection): ServerConfig {

    const clusterSection = config.section("cluster")
    const webserverSection = config.section("webserver")
    const databaseSection = config.section("database")
    const generalSection = config.section("general")

    let clusterConfig: ServerClusterConfig = null

    if (clusterSection.boolean("enabled")) {
        clusterConfig = parseServerClusterConfig(clusterSection)
    }

    return {
        cluster: clusterConfig,
        database: createDatabaseFromConfig(databaseSection),
        webServer: parseWebserverConfig(webserverSection),
        general: parseGeneralConfig(generalSection)
    }
}

export function parseGeneralConfig(config: PreferencesSection): GeneralServerConfig {
    return {
        port: config.port("port"),
        mapsDirectory: path.join(dirname, config.string("maps-directory")),
        resourcesDirectory: path.join(dirname, config.string("resources-directory"))
    }
}

export function parseServerClusterConfig(config: PreferencesSection): ServerClusterConfig {

    let clusterPort
    let clusterPortSetting = config.value("hub-port")

    if (clusterPortSetting === "inherit-game-port") {
        clusterPort = this.clientPort
    } else {
        config.validatePort(clusterPortSetting, "hub-port")
        clusterPort = Number(clusterPortSetting)
    }

    let hubUrl = new URL(config.string("hub-address"))

    if(hubUrl.port !== "") hubUrl.port = ""
    hubUrl.pathname = "/cluster-link"

    return {
        url: hubUrl.href,
        port: clusterPort,
        password: config.string("hub-access-key")
    }
}

function verifyOrigin(origin: any, configPath: string): string | RegExp {
    if(typeof origin === "string") {
        return origin
    } else if(origin instanceof Object) {
        // TODO: generalize this

        let regex: any = null
        let flags: any = null

        for(let key in origin) {
            if(key === "regex") {
                regex = origin[key]
            } else if(key === "flags") {
                flags = origin[key]
            } else {
                throw new Error(configPath + "has an invalid key '" + key + "'. Only 'regex' and 'flags' are allowed.")
            }
        }

        if(regex === null) {
            throw new Error(configPath + " is missing the 'regex' key.")
        }

        if(typeof regex !== "string") {
            throw new Error(configPath + ".regex must be a string.")
        }

        if(flags !== null && typeof flags !== "string") {
            throw new Error(configPath + ".flags must be a string.")
        }

        return new RegExp(regex, flags)
    }

    throw new Error(configPath + " must be a string or an object of type { regex: string, flags?: string }.")
}

export function parseWebserverConfig(config: PreferencesSection): WebServerConfig {
    const allowedOriginsConfigPath = "allowed-origins"
    const allowedOriginsConfigItem = config.value(allowedOriginsConfigPath)
    let allowedOrigins: (string | RegExp)[] | "*" = "*"
    
    if(Array.isArray(allowedOriginsConfigItem)) {
        allowedOrigins = allowedOriginsConfigItem.map((origin, index) => {
            return verifyOrigin(origin, config.nestedPath(allowedOriginsConfigPath) + "[" + index + "]")
        })
    } else if(allowedOriginsConfigItem !== "*") {
        throw new Error(config.nestedPath(allowedOriginsConfigPath) + " must be '*' or an array of allowed origins.")
    }

    return {
        allowLocalInterfaceOrigins: config.boolean("allow-local-interface-origins"),
        allowedOrigins: allowedOrigins,
        sessionKey: config.string("session-key"),
        allowNoOrigin: config.boolean("allow-no-origin")
    }
}

export function createDatabaseFromConfig(config: PreferencesSection): ServerDatabase {
    const type = config.string("type")

    if(type == "mongodb") {
        return createMongodb(config)
    } else if(type == "file") {
        return createFileDb(config)
    }
    throw new Error("'" + config.nestedPath("type") + "' may either be 'mongodb' or 'file'")
}

function createMongodb(config: PreferencesSection) {
    const url = config.string("url")
    const username = config.stringOptional("user")
    const db = config.string("db")
    let auth = null

    if(username !== null) {
        auth = {
            user: username,
            password: config.string("password")
        }
    }

    return new MongoDatabase({
        url: url,
        db: db,
        auth: auth
    })
}

function createFileDb(config: PreferencesSection) {
    return new FileDatabase(path.resolve(dirname, "database"))
}