import './game-create-view.scss'


import HugeTitle from "../huge-title/huge-title";
import HugeTextInput from "../huge-text-input/huge-text-input";
import HugeSelect, { SelectOption } from "../huge-select/huge-select";
import Button from "src/client/ui/button/button";
import {checkRoomName} from "src/data-checkers/room-name-checker";
import {localizeAjaxError, textFromRoomNameCheckResult} from "src/client/hub/localizations";
import {Tip, TipStyle} from "../input-tip-list/input-tip-list-view";

import React, { useEffect, useState } from 'react';

const GameCreateViewComponent: React.FC = () => {

    const [state, setState] = useState({
        loading: true,
        error: null as string | null,
        maps: [] as SelectOption[],
        roomNameTips: [] as Tip[],
        roomName: "",
        requests: new Set<JQuery.jqXHR>()
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
        setState((state) => ({ ...state, loading: false, error: localizeAjaxError(data, exception) }))

        // TODO
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

    useEffect(() => {
        fetchMaps()
        return () => {
            state.requests.forEach(request => request.abort())
        }
    }, [])

    const createRoom = () => {
        if(state.roomNameTips.length !== 0) return
        
        let request = $.ajax({
            url: "ajax/room-create",
            method: "post",
            data: {
                name: state.roomName,
                map: state.maps.find(option => option.selected)?.data,
                mode: "TDM"
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
        // props.page.eventContainer.createEvent(localizeAjaxError(xhr, exception)) // TODO: Figure out a better way
    }

    const onRoomCreateResponse = (result: any) => {
        switch(result.result) {
            case "ok":
                window.location.href = result.url
                break;
            case "not-authenticated":
                window.location.reload()
                break;
            case "invalid-map":
                 // TODO: Figure out a better way
                // props.page.eventContainer.createEvent("Сервер запутался в картах. Попробуйте перезагрузить страницу.")
                break;
            case "invalid-mode":
                 // TODO: Figure out a better way
                // props.page.eventContainer.createEvent("Произошло что-то очень странное. Попробуйте перезагрузить страницу.")
                break;
            case "invalid-room-name":
                updateValidity()
                 // TODO: Figure out a better way
                // props.page.eventContainer.createEvent("Недопустимое название комнаты. Попробуйте другое.")
                break;
            case "room-name-taken":
                setState((state) => ({...state, roomNameTips: [{
                    text: "Имя комнаты занято",
                    style: TipStyle.ERROR
                }]}))
                break;
        }
    }

    const updateValidity = () => {
        let errors = checkRoomName(state.roomName).map(reason => {
            return {
                text: textFromRoomNameCheckResult(reason),
                style: TipStyle.ERROR
            }
        })

        setState((state) => ({...state, roomNameTips: errors}))
    }

    const handleNameChange = (value: string) => {
        setState((state) => ({...state, roomName: value}))
        updateValidity()
    }

    const modes = [
        { name: "Битва команд (TDM)", data: "TDM" },
        { name: "Каждый сам за себя (DM)", data: "DM" },
        { name: "Захват флага (FC)", data: "FC" }
    ]
    const defaultMode = modes[0].data

    return (
        <div className="game-create-view">
            <HugeTitle>Новая комната</HugeTitle>
            <HugeTextInput placeholder="Название комнаты" onChange={handleNameChange}/>
            <HugeSelect options={state.maps}/>
            <HugeSelect options={modes} defaultValue={defaultMode}/>
            <Button largeStyle onClick={createRoom}>В бой!</Button>
        </div>
    );
}

export default GameCreateViewComponent;