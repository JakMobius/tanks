import DB from "./db";

class UserInfo {
    nick: string

    constructor(schema: any) {

    }

    static async fetchUserInfo(nick: string) {
        let result = await DB.instance.dbHandle.collection('users').findOne({
            nick: nick
        })
        console.log(result)
    }
}