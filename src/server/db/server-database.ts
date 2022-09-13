import {UserDataRaw} from "src/client/user-data-raw";
import session from "express-session";

export default interface ServerDatabase {
    connect(): Promise<void>
    disconnect(force: boolean): Promise<void>

    authoriseUser(login: string, password: string): Promise<boolean>
    createUser(login: string, password: string): Promise<boolean>
    getUserInfo(login: string): Promise<UserDataRaw>
    getWebserverStore(): session.Store;
}