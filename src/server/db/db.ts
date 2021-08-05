

import {Db, MongoClient} from 'mongodb';
import Preferences from '../preferences/preferences';

export default class DB {
	public url: string;
	public client: MongoClient;
    public db: string
    public dbHandle: Db;
    static instance: DB

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
            auth: auth
        })
    }

    async connect() {
        await this.client.connect()
        this.dbHandle = this.client.db(this.db)
    }

    async disconnect(force: boolean) {
        await this.client.close(force)
    }
}