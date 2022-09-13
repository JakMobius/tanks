import {NickCheckResult} from "src/data-checkers/nick-checker";
import {RoomNameCheckResult} from "src/data-checkers/room-name-checker";

export function textFromNickCheckResult(reason: NickCheckResult) {
    switch (reason) {
        case NickCheckResult.INVALID_CHARACTERS: return "Недопустимые символы в позывном"
        case NickCheckResult.NICK_EMPTY: return "Позывной не может быть пустым"
        case NickCheckResult.TOO_SHORT: return "Придумай позывной подлиннее!"
        case NickCheckResult.TOO_LONG: return "Позывной должен быть коротким!"
        case NickCheckResult.NICK_USED: return "Позывной уже используется!"
    }
    return null
}

export function textFromRoomNameCheckResult(reason: RoomNameCheckResult) {
    switch (reason) {
        case RoomNameCheckResult.NAME_IS_EMPTY: return "Ну назови уж её как-нибудь"
        case RoomNameCheckResult.NAME_IS_TOO_LONG: return "Такое название не влезет в список"
    }
    return null
}

export function localizeAjaxError(xhr: JQuery.jqXHR, exception: string): string | null {
    if (xhr.status === 0) {
        return 'Не удалось выполнить подключение к серверу. Убедитесь, что с вашим интернетом все в порядке.';
    } else if (xhr.status >= 500 && xhr.status <= 599) {
        return 'Сервер прилёг отдохнуть. Пожалуйста, сообщите об этом разработчикам. Пусть разбудят. (Ошибка ' + xhr.status + ')';
    } else if (xhr.status >= 400 && xhr.status <= 499) {
        return 'Не удалось выполнить запрос. Серверу он почему-то не понравился. Обратитесь за помощью к разработчикам. (Ошибка ' + xhr.status + ')'
    } else if (exception === 'parsererror') {
        return 'Произошла ошибка разбора при выполнении запроса. Как это вообще могло произойти?...';
    } else if (exception === 'timeout') {
        return 'Не удалось выполнить запрос. Истекло время ожидания.';
    } else if (exception === 'abort') {
        return 'Не удалось выполнить запрос, так как он был отменен';
    } else {
        return 'Не удалось выполнить запрос: ' + xhr.responseText;
    }
    return null
}