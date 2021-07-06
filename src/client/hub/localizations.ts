import {NickCheckResult} from "../../utils/nick-checker";

export function textFromNickCheckResult(reason: NickCheckResult) {
    switch (reason) {
        case NickCheckResult.INVALID_CHARACTERS: return "Недопустимые символы в позывном"
        case NickCheckResult.NICK_EMPTY: return "Позывной не может быть пустым"
        case NickCheckResult.TOO_SHORT: return "Придумай позывной подлиннее!"
        case NickCheckResult.TOO_LONG: return "Позывной должен быть коротким!"
        case NickCheckResult.NICK_USED: return "Позывной уже используется!"
    }
    return "Что-то пошло не так..."
}