import {URL} from "url";
import {PreferencesSection} from "./preferences/preferences";
import {ServerConfig, ServerClusterConfig, WebServerConfig} from "./server";
import ServerDatabase from "./db/server-database";
import MongoDatabase from "./db/mongo/mongo-database";
import FileDatabase from "./db/file/file-database";
import path from "path";

export function parseServerConfig(config: PreferencesSection): ServerConfig {

    const clusterSection = config.section("cluster")
    const webserverSection = config.section("webserver")
    const databaseSection = config.section("database")

    let clusterConfig: ServerClusterConfig = null

    if (clusterSection.boolean("enabled")) {
        clusterConfig = parseServerClusterConfig(clusterSection)
    }

    return {
        cluster: clusterConfig,
        database: createDatabaseFromConfig(databaseSection),
        webServer: parseWebserverConfig(webserverSection),
        port: config.port("port")
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

export function parseWebserverConfig(config: PreferencesSection): WebServerConfig {
    return {
        sessionKey: config.string("session-key")
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
    return new FileDatabase(path.resolve(__dirname, "database"))
}