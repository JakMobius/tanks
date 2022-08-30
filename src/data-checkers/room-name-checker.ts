
export enum RoomNameCheckResult {
    NAME_IS_EMPTY,
    NAME_IS_TOO_LONG
}

export function checkRoomName(name: string): RoomNameCheckResult[] {
    let result = []

    if(name.length == 0) result.push(RoomNameCheckResult.NAME_IS_EMPTY);
    else if(name.length > 32) result.push(RoomNameCheckResult.NAME_IS_TOO_LONG);

    return result;
}

export function roomNameIsValid(name: string) {
    return checkRoomName(name).length == 0
}