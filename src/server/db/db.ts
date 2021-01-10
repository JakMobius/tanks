

import { MongoClient } from 'mongodb';
import Preferences from '../preferences/preferences';

class DB {
	public url: string;
	public client: MongoClient;
    static instance: DB

    db: string

    constructor() {

        let auth = null

        const url = Preferences.string("database.url")
        const username = Preferences.stringOptional("database.user")
        const db = Preferences.string("database.db")

        if(username !== null) {
            const password = Preferences.string("database.password")

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
        })
    }

    async connect() {
        await this.client.connect()
        this.client.db(this.db)
    }

    async disconnect(force: boolean) {
        await this.client.close(force)
    }
}

export default DB;