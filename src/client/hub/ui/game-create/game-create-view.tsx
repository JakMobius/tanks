import './game-create-view.scss'

import { checkRoomName } from "src/data-checkers/room-name-checker";
import { localizeAjaxError, textFromRoomNameCheckResult } from "src/client/hub/localizations";

import React, { useEffect, useState } from 'react';
import { PauseMenuButton, PauseNavigationItem } from 'src/client/ui/overlay/pause-overlay/pause-menu-view';
import { PauseInputRow } from 'src/client/ui/overlay/pause-overlay/elements/pause-input-row';
import PauseKeySelectRow, { SelectOption } from 'src/client/ui/overlay/pause-overlay/elements/pause-select-row';
import TipList, { Tip, TipStyle } from '../../tip-list/tip-list';
import PauseKeyValueRow from 'src/client/ui/overlay/pause-overlay/elements/pause-key-value-row';
import Cloud from 'src/client/game/ui/cloud/cloud';
import PageLocation from 'src/client/scenes/page-location';

const GameCreateViewComponent: React.FC = () => {

    const [state, setState] = useState({
        loading: true,
        maps: null as SelectOption[] | null,
        mapLoadingError: false,
        roomNameTips: [] as Tip[],
        roomName: "",
        roomValid: false,
        requests: new Set<JQuery.jqXHR>(),
        selectedMap: null as string | null,
        selectedMode: null as string | null,
        formValid: false
    })

    const addRequest = (request: JQuery.jqXHR) => {
        setState((state) => ({ ...state, requests: state.requests.add(request) }))
    }

    const removeRequest = (request: JQuery.jqXHR) => {
        setState((state) => {
            let requests = new Set(state.requests)
            requests.delete(request)
            return { ...state, requests: requests }
        })
    }

    const onMapFetchResult = (data: any) => {
        setState((state) => ({
            ...state,
            loading: false,
            maps: data.maps.map((map: any) => {
                return {
                    name: map.name,
                    data: map.value
                }
            })
        }))
    }

    const onMapFetchError = (data: JQuery.jqXHR, exception: string) => {
        setState((state) => ({ ...state, loading: false, mapLoadingError: true }))
    }

    const fetchMaps = () => {
        let request = $.ajax({
            url: "ajax/map-list",
            method: "get"
        })

        request.done((data) => {
            removeRequest(request)
            onMapFetchResult(data);
        }).fail((data, exception) => {
            removeRequest(request)
            onMapFetchError(data, exception)
        })

        addRequest(request)
        setState((state) => ({ ...state, error: null, loading: true }))
    }

    const createRoom = () => {
        if (!state.formValid) return

        let request = $.ajax({
            url: "ajax/room-create",
            method: "post",
            data: {
                name: state.roomName,
                map: state.selectedMap,
                mode: state.selectedMode
            }
        })

        request.done((data) => {
            removeRequest(request)
            onRoomCreateResponse(data)
        }).fail((data, exception) => {
            removeRequest(request)
            onRoomCreateError(data, exception)
        })

        addRequest(request)
    }

    const onRoomCreateError = (xhr: JQuery.jqXHR, exception: string) => {
        showError(localizeAjaxError(xhr, exception))
    }

    const showError = (text: string) => {
        setState((state) => ({
            ...state, roomNameTips: [{
                text: text,
                style: TipStyle.ERROR
            }]
        }))
    }

    const onRoomCreateResponse = (result: any) => {
        switch (result.result) {
            case "ok":
                PageLocation.navigateToScene("game", {
                    room: result.name
                })
                break;
            case "not-authenticated":
                window.location.reload()
                break;
            case "invalid-map":
                showError("Сервер запутался в картах. Попробуйте перезагрузить страницу.")
                break;
            case "invalid-mode":
                showError("Произошло что-то очень странное. Попробуйте перезагрузить страницу.")
                break;
            case "invalid-room-name":
                validateRoomName()
                setState((state) => {
                    if(state.roomValid) {
                        showError("Недопустимое название комнаты. Попробуйте другое.")
                    }
                    return {...state, roomValid: false}
                })
                
                break;
            case "room-name-used":
                showError("Комната с таким именем уже есть")
                break;
            default:
                showError("Что-то пошло не так, но что - непонятно.")
                break;
        }
    }

    const validateRoomName = () => {
        setState((state) => {
            let roomNameTips = checkRoomName(state.roomName).map(reason => ({
                text: textFromRoomNameCheckResult(reason),
                style: TipStyle.ERROR
            }))
            let roomValid = roomNameTips.length === 0

            return {...state, roomNameTips, roomValid }
        })
    }

    const handleNameChange = (value: string) => {
        setState((state) => ({ ...state, roomName: value }))
        validateRoomName()
    }

    const handleMapChange = (value: string) => {
        setState((state) => ({...state, selectedMap: value }))
    }

    const handleModeChange = (value: string) => {
        setState((state) => ({...state, selectedMode: value }))
    }

    useEffect(() => {
        fetchMaps()
        return () => {
            state.requests.forEach(request => request.abort())
        }
    }, [])

    useEffect(() => {
        setState((state) => ({
            ...state,
            formValid: state.roomValid && state.selectedMap !== null && state.selectedMode !== null
        }))
    }, [state.roomValid, state.selectedMap, state.selectedMode])

    const modes = [
        { name: "Битва команд (TDM)", data: "TDM", displayName: "TDM" },
        { name: "Каждый сам за себя (DM)", data: "DM", displayName: "DM" },
        { name: "Захват флага (CTF)", data: "CTF", displayName: "CTF" },
        { name: "Гонка (RACE)", data: "RACE", displayName: "RACE" },
    ] as SelectOption[]

    return (
        <PauseNavigationItem title="Создание комнаты">
            <PauseInputRow
                blue={state.roomValid}
                red={!state.roomValid}
                placeholder="Название комнаты"
                onChange={handleNameChange} />
            { state.maps !== null ? (
                <PauseKeySelectRow blue title="Карта" options={state.maps} onChange={handleMapChange} />
            ) : (
                <PauseKeyValueRow>
                    <Cloud blue>Карта</Cloud>
                    { state.mapLoadingError ? (
                        <Cloud red>Ошибка загрузки</Cloud>
                    ) : (
                        <Cloud>Загрузка...</Cloud>
                    )}
                </PauseKeyValueRow>
            )}
            <PauseKeySelectRow blue title="Режим" options={modes} onChange={handleModeChange} />
            <PauseMenuButton
                blue={state.formValid}
                disabled={!state.formValid}
                onClick={createRoom}>В бой!</PauseMenuButton>
            <TipList tips={state.roomNameTips} />
        </PauseNavigationItem>
    );
}

export default GameCreateViewComponent;