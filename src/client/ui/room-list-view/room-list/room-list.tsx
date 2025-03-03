import './room-list.scss'

import RoomCell from "../room-cell/room-cell";
import PageLocation from "src/client/scenes/page-location";
import React from 'react';

export interface RoomConfig {
    name: string
    map: string
    mode: string
    players: number
    maxPlayers: number
}

export interface RoomListProps {
    rooms: RoomConfig[]
    placeholder?: () => React.ReactNode
}

export const RoomListComponent: React.FC<RoomListProps> = (props) => {
    return <></>
}

interface UserRoomListComponentProps extends RoomListProps {
    onCreateRoom: () => void
}

export const UserRoomListComponent: React.FC<UserRoomListComponentProps> = (props) => {
    return (
        <div className="room-list">
            <div className="room-list-header">
                <div className="room-list-title">Ваши комнаты</div>
                <div className="room-list-action-button"></div>
            </div>
            <div className="room-list-contents">
                {props.rooms.map((room, i) => (
                    <React.Fragment key={i}>
                        {i > 0 && <div className="room-list-separator"></div>}
                        <RoomCell
                            callback={() => {
                                PageLocation.navigateToScene("game", {
                                    room: room.name
                                })
                            }}
                            {...room}></RoomCell>
                    </React.Fragment>
                ))}
            </div>
            {props.rooms.length === 0 && (
                <div className="room-list-empty-message">
                    <div className="text">
                        Этот список испытывает душевную пустоту.<br />
                        Срочно <a onClick={props.onCreateRoom}>создавайте комнату</a> и зовите в неё всех своих друзей!
                    </div>
                </div>
            )}
        </div>
    )
}

export const GlobalRoomListComponent: React.FC<RoomListProps> = (props) => {
    return (
        <div className="room-list">
            <div className="room-list-header">
                <div className="room-list-title">Комнаты других игроков</div>
                <div className="room-list-action-button"></div>
            </div>
            <div className="room-list-contents">
                {props.rooms.map((room, i) => (
                    <React.Fragment key={i}>
                        {i > 0 && <div className="room-list-separator"></div>}
                        <RoomCell
                            callback={() => {
                                PageLocation.navigateToScene("game", {
                                    room: room.name
                                })
                            }}
                            {...room}></RoomCell>
                    </React.Fragment>
                ))}
            </div>
            {props.rooms.length === 0 && (
                <div className="room-list-empty-message">
                    <div className="tank-icon"></div>
                    <div className="text">
                        Этому танчику грустно, потому что никто не хочет играть
                    </div>
                </div>
            )}
        </div>
    )
}