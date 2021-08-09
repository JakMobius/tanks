
import {Db, MongoClient} from 'mongodb';
import {PreferencesSection} from '../../preferences/preferences';
import ServerDatabase from "../server-database";
import {UserDataRaw} from "../../../client/user-data-raw";
import MongoStore from "connect-mongo";
import session from "express-session";

export interface MongoDatabaseConfig {
    url: string,
    db: string,
    auth?: {
        user: string,
        password: string
    }
}

export default class MongoDatabase implements ServerDatabase {
	public url: string;
	public client: MongoClient;
    public db: string
    public dbHandle: Db;
    static instance: MongoDatabase

    constructor(config: MongoDatabaseConfig) {
        this.url = config.url
        this.db = config.db

        this.client = new MongoClient(this.url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            auth: config.auth
        })
    }

    async connect() {
        await this.client.connect()
        this.dbHandle = this.client.db(this.db)
    }

    async disconnect(force: boolean) {
        await this.client.close(force)
    }

    authoriseUser(login: string, password: string): Promise<boolean> {
        return this.dbHandle.collection('users').findOne({
            login: login,
            password: password
        }).then((result) => {
            return result !== null
        })
    }

    createUser(login: string, password: string): Promise<boolean> {
        return this.dbHandle.collection('users').updateOne({
            login: login
        }, { $set: {
                login: login,
                password: password
            }}, {
            upsert: true
        }).then((result) => {
            return result.upsertedCount > 0;
        })
    }

    getUserInfo(login: string): Promise<UserDataRaw> {
        return this.dbHandle.collection('users').findOne({
            login: login
        })
    }

    getWebserverStore(): session.Store {
        return MongoStore.create({
            client: this.client,
            dbName: this.db
        })
    }
}