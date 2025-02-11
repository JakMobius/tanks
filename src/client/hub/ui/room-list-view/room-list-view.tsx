import './room-list-view.scss'

import {localizeAjaxError} from "src/client/hub/localizations";
import HugeTitle from "../huge-title/huge-title";
import { getNonsenseErrorHeader } from 'src/client/scenes/loading/error-message-generator';
import React, { useEffect, useState } from 'react';
import { GlobalRoomListComponent, RoomConfig, UserRoomListComponent } from './room-list/room-list';
import { LoadingViewComponent } from '../loading-view/loading-view';
import { useNavigation } from 'src/client/ui/navigation/navigation-view';
import GameCreateViewComponent from '../game-create/game-create-view';

interface RoomListErrorProps {
    error: string
    onRetry: () => void
}

export const RoomListErrorComponent: React.FC<RoomListErrorProps> = (props) => {
    const [header] = useState(getNonsenseErrorHeader())

    return (
        <div className="room-loading-placeholder-menu">
            <LoadingViewComponent
                title={header}
                subtitle={
                    <span>
                        Может быть, стоит <a onClick={props.onRetry}>попробовать еще раз?</a>
                    </span>
                }
                shown={true} />
        </div>
    );
}

const RoomListView: React.FC = (props) => {

    const navigation = useNavigation()

    const [state, setState] = useState({
        loading: true,
        error: null as string | null,
        userRooms: [] as RoomConfig[],
        globalRooms: [] as RoomConfig[]
    })

    const setLoading = (loading: boolean) => {
        setState({...state, loading: loading})
    }

    const navigateToRoomCreation = () => {
        navigation.push(<GameCreateViewComponent/>)
    }

    const onLoaded = (data: any) => {
        setLoading(false)
        let result = data.result

        if(result === 'ok') {
            setState((state) => ({...state, globalRooms: data.rooms, userRooms: []}))
        } else if(result === "not-authenticated") {
            window.location.reload()
        } else {
            onFailure("Не удалось загрузить список комнат")
        }
    }

    const onFailure = (error: string) => {
        setState((state) => ({...state, error: error, loading: false}))
    }
    
    const onRetry = () => {
        setState((state) => ({...state, error: null, loading: true}))

        $.ajax({
            url: "ajax/room-list",
            method: "GET"
        }).done((data: any) => {
            onLoaded(data)
        }).fail((jqXHR: JQuery.jqXHR, exception: string) => {
            onFailure(localizeAjaxError(jqXHR, exception))
        })
    }

    useEffect(() => {
        onRetry()
    }, [])

    return (
        <div className="room-list-view">
            <HugeTitle>Игровые комнаты</HugeTitle>
            { state.loading ? (
                <div className="room-loading-placeholder-menu">
                    <LoadingViewComponent
                        title="Пожалуйста, подождите..."
                        subtitle="Я думаю"
                        shown={state.loading} />
                </div>
            ) : state.error ? (
                <RoomListErrorComponent error={state.error} onRetry={onRetry} />
            ) : (
                <React.Fragment>
                    <UserRoomListComponent rooms={state.userRooms} onCreateRoom={navigateToRoomCreation}/>
                    <GlobalRoomListComponent rooms={state.globalRooms}/>
                </React.Fragment>
            )}
        </div>
    );
}

export default RoomListView