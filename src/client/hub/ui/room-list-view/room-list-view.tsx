import './room-list-view.scss'

import { localizeAjaxError } from "src/client/hub/localizations";
import { getNonsenseErrorHeader } from 'src/client/scenes/loading/error-message-generator';
import React, { useEffect, useState } from 'react';
import { GlobalRoomListComponent, RoomConfig, UserRoomListComponent } from './room-list/room-list';
import LoadingView from '../loading-view/loading-view';
import { NavigationItem, useNavigation } from 'src/client/ui/navigation/navigation-view';
import GameCreateViewComponent from '../game-create/game-create-view';
import { CloudyNavigationHeader } from 'src/client/ui/overlay/pause-overlay/pause-menu-view';

interface RoomListErrorProps {
    error: string
    onRetry: () => void
}

export const RoomListErrorComponent: React.FC<RoomListErrorProps> = (props) => {
    const [header] = useState(getNonsenseErrorHeader())

    return (
        <LoadingView
            title={header}
            subtitle={
                <span>
                    {props.error && <>
                        {props.error}
                        <br />
                    </>}
                    Может быть, стоит <a onClick={props.onRetry}>попробовать еще раз?</a>
                </span>
            }
            shown={true} />
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
        setState((state) => ({ ...state, loading: loading }))
    }

    const navigateToRoomCreation = () => {
        navigation.push(<GameCreateViewComponent />)
    }

    const onLoaded = (data: any) => {
        setLoading(false)
        let result = data.result

        if (result === 'ok') {
            setState((state) => ({ ...state, globalRooms: data.rooms, userRooms: [] }))
        } else if (result === "not-authenticated") {
            window.location.reload()
        } else {
            onFailure("Не удалось загрузить список комнат")
        }
    }

    const onFailure = (error: string) => {
        setState((state) => ({ ...state, error: error, loading: false }))
    }

    const onRetry = () => {
        setState((state) => ({ ...state, error: null, loading: true }))
        
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

    const title = "Игровые комнаты"

    return (
        <NavigationItem title={title}>
            <div className="room-list-view">
                <CloudyNavigationHeader title={title} />
                <div className="room-list-view-contents">
                    {state.loading ? (
                        <div className="room-list">
                            <LoadingView
                                title="Пожалуйста, подождите..."
                                subtitle="Я думаю"
                                shown={state.loading} />
                        </div>
                    ) : state.error ? (
                        <div className="room-list">
                            <RoomListErrorComponent error={state.error} onRetry={onRetry} />
                        </div>
                    ) : (
                        <>
                            <UserRoomListComponent rooms={state.userRooms} onCreateRoom={navigateToRoomCreation} />
                            <GlobalRoomListComponent rooms={state.globalRooms} />
                        </>
                    )}
                </div>
            </div>
        </NavigationItem>
    );
}

export default RoomListView