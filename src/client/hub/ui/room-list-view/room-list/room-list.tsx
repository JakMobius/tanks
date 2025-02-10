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
    return (
        <div className="room-list">
            <div className="room-list-box">
                <div className="room-list-container">
                    <div className="room-list-header">
                        <div className="room-list-title"></div>
                        <div className="room-list-action-button"></div>
                    </div>
                    <div className="room-list-scroll">
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
                    {props.rooms.length === 0 && props.placeholder?.()}
                </div>
            </div>
        </div>
    );
}

interface UserRoomListComponentProps extends RoomListProps {
    onCreateRoom: () => void
}

export const UserRoomListComponent: React.FC<UserRoomListComponentProps> = (props) => {
    return (
        <RoomListComponent {...props} placeholder={() => (
            <div>
                Этот список испытывает душевную пустоту.<br/>
                Срочно <a onClick={props.onCreateRoom}>создавайте комнату</a> и зовите в неё всех своих друзей!
            </div>
        )}/>
    )

    // this.title.text("Ваши комнаты")
    // this.actionButton.text("Создать новую").on("click", () => this.emit("room-create"))
}

export const GlobalRoomListComponent: React.FC<RoomListProps> = (props) => {
    return (
        <RoomListComponent {...props} placeholder={() => (
            <div>Этому танчику грустно, потому что больше никто не хочет играть</div>
        )}/>
    )

    // this.title.text("Комнаты других игроков")
    // this.actionButton.text("Поиск").on("click", () => this.emit("search"))
}