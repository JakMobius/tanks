import {NickCheckResult} from "src/data-checkers/nick-checker";
import {RoomNameCheckResult} from "src/data-checkers/room-name-checker";
import { APIGenericError, APIGenericErrorType, APIHTTPError, APIServerError } from "../networking/api";

export function textFromNickCheckResult(reason: NickCheckResult) {
    switch (reason) {
        case NickCheckResult.INVALID_CHARACTERS: return "Недопустимые символы в позывном"
        case NickCheckResult.NICK_EMPTY: return "Позывной не может быть пустым"
        case NickCheckResult.TOO_SHORT: return "Придумай позывной подлиннее!"
        case NickCheckResult.TOO_LONG: return "Пожалей сослуживцев, им это произносить!"
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

export function localizeAjaxError(error: any): string | null {
    const badRequestMessage = (error: string) => {
        return "Не удалось выполнить запрос. Серверу он почему-то не понравился. Обратитесь за помощью к разработчикам. (Ошибка " + error + ")"
    }

    if(error instanceof APIHTTPError) {
        if(error.status >= 500 && error.status <= 599) {
            return 'Сервер прилёг отдохнуть. Пожалуйста, сообщите об этом разработчикам. Пусть разбудят. (Ошибка ' + error.status + ')';
        }
        return badRequestMessage(String(error.status))
    }
    if(error instanceof APIGenericError) {
        switch(error.type) {
            case APIGenericErrorType.connectionError:
                return 'Не удалось выполнить подключение к серверу. Убедитесь, что с вашим интернетом все в порядке.';
            case APIGenericErrorType.abortError:
                return 'Не удалось выполнить запрос, так как он был отменен';
            case APIGenericErrorType.timeoutError:
                return 'Не удалось выполнить запрос. Истекло время ожидания.';
            case APIGenericErrorType.notAllowedError:
                return 'Ваш браузер не разрешил нам выполнить наш запрос. Мы сами в шоке.';
            case APIGenericErrorType.invalidJSON:
                return 'Произошла ошибка разбора при выполнении запроса. Как это вообще могло произойти?...';
        }
    }
    if(error instanceof APIServerError) {
        switch(error.type) {
            case "forbidden":
                return 'Кажется, у вас недостаточно прав.';
            case "not-authenticated":
                return 'Кажется, сюда можно только авторизованным пользователям.';
            case "malformed-input-data":
            case "missing-field":
            case "unsupported-method":
                return badRequestMessage(error.type);
            case "not-found":
                return "Вас занесло в неизведанные дали. Такой страницы не существует.";
            
        }
    }
    return 'Не удалось выполнить запрос. Что-то сломалось, но мы не знаем, что.'
}