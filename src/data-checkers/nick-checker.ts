
export enum NickCheckResult {
    NICK_EMPTY,
    TOO_LONG,
    TOO_SHORT,
    INVALID_CHARACTERS,
    NICK_USED
}

export function checkNick(nick: string): NickCheckResult[] {
    let result = []

    if(nick.length == 0) result.push(NickCheckResult.NICK_EMPTY);
    else {
        if(nick.length < 3) result.push(NickCheckResult.TOO_SHORT);
        if(nick.length > 16) result.push(NickCheckResult.TOO_LONG);
        if(!/^[0-9a-zA-Zа-яА-Я_]+$/.test(nick)) result.push(NickCheckResult.INVALID_CHARACTERS);
    }

    return result;
}

export function nickIsValid(nick: string) {
    return checkNick(nick).length == 0
}