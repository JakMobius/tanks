import './game-create-view.scss'

import { checkRoomName } from "src/data-checkers/room-name-checker";
import { localizeAjaxError, textFromRoomNameCheckResult } from "src/client/hub/localizations";

import React, { useEffect, useMemo, useState } from 'react';
import { PauseMenuButton, PauseNavigationItem } from 'src/client/ui/pause-overlay/pause-menu-view';
import { PauseInputRow } from 'src/client/ui/pause-overlay/elements/pause-input-row';
import PauseKeySelectRow, { SelectOption } from 'src/client/ui/pause-overlay/elements/pause-select-row';
import TipList, { Tip, TipStyle } from '../../tip-list/tip-list';
import PauseKeyValueRow from 'src/client/ui/pause-overlay/elements/pause-key-value-row';
import Cloud from 'src/client/game/ui/cloud/cloud';
import PageLocation from 'src/client/scenes/page-location';
import { api } from 'src/client/networking/api';
import { useAbortControllerCleanup } from 'src/client/utils/abort-controller-cleanup';

const GameCreateViewComponent: React.FC = () => {

    const [state, setState] = useState({
        loading: true,
        maps: null as SelectOption[] | null,
        mapLoadingError: false,
        roomNameTips: [] as Tip[],
        roomName: "",
        roomValid: false,
        selectedMap: null as string | null,
        selectedMode: null as string | null,
        formValid: false
    })

    const { addCleanup, removeCleanup } = useAbortControllerCleanup()

    const onMapFetchError = (error: any) => {
        setState((state) => ({ ...state, loading: false, mapLoadingError: true }))
    }

    const onMapFetchResult = (response: any) => {
        if(response.result !== "ok") {
            onMapFetchError(response.result)
            return
        }
        setState((state) => ({
            ...state,
            loading: false,
            maps: response.maps.map((map: any) => {
                return {
                    name: map.name,
                    data: map.value
                }
            })
        }))
    }

    const fetchMaps = () => {
        let controller = new AbortController()

        api('/ajax/map-list', {
            method: 'GET',
            signal: controller.signal
        })
        .then(onMapFetchResult)
        .catch(onMapFetchError)
        .finally(() => removeCleanup(controller))

        addCleanup(controller)
        setState((state) => ({ ...state, error: null, loading: true }))
    }

    const createRoom = () => {
        if (!state.formValid) return

        let controller = new AbortController()

        api("ajax/room-create", {
            method: "POST",
            body: JSON.stringify({
                name: state.roomName,
                map: state.selectedMap,
                mode: state.selectedMode
            }),
            signal: controller.signal
        })
        .then(onRoomCreateResponse)
        .catch(onRoomCreateError)
        .finally(() => removeCleanup(controller))

        addCleanup(controller)
    }

    const onRoomCreateError = (error: any) => {
        showError(localizeAjaxError(error))
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