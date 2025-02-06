
import session from "express-session";
import { UserDataRaw } from "src/client/utils/user-data-raw";

export default interface ServerDatabase {
    
    connect(): Promise<void>
    disconnect(force: boolean): Promise<void>

    authoriseUser(login: string, password: string): Promise<boolean>
    createUser(login: string, password: string): Promise<boolean>
    modifyUserInfo(nick: string, userInfo: UserDataRaw): Promise<void>;
    getUserInfo(login: string): Promise<UserDataRaw>
    getWebserverStore(): session.Store;
}