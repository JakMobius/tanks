

const MongoClient = require("mongodb").MongoClient;

class DB {
    /**
     * @type DB
     */
    static instance

    constructor() {
        this.url = "mongodb://localhost:27017/"
        this.client = new MongoClient(this.url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    }
    async connect() {
        await this.client.connect()
    }

    async disconnect(force) {
        await this.client.close(force)
    }
}

module.exports = DB