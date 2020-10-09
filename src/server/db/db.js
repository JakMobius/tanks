

const MongoClient = require("mongodb").MongoClient;
const Preferences = require("../preferences/preferences")

class DB {
    /**
     * @type DB
     */
    static instance

    /**
     * @type string
     */
    db

    constructor() {

        let auth = null

        const url = Preferences.value("database.url")
        const username = Preferences.value("database.user")
        const password = Preferences.value("database.password")
        const db = Preferences.value("database.db")

        if(typeof url != "string") throw new Error("database.url setting should be string")
        if(typeof db != "string") throw new Error("database.db setting should be string")

        if(username != null) {
            if(typeof username != "string") throw new Error("database.user setting should be string")
            if(typeof password != "string") throw new Error("database.password setting should be string")

            auth = {
                user: username,
                password: password
            }
        }

        this.url = url
        this.db = db

        this.client = new MongoClient(this.url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            auth: auth,
        });
    }
    async connect() {
        await this.client.connect()
        this.client.db(this.db)
    }

    async disconnect(force) {
        await this.client.close(force)
    }
}

module.exports = DB