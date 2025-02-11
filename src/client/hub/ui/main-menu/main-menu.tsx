import PageLocation from 'src/client/scenes/page-location';
import './main-menu.scss'

import React from 'react';
import { NavigationItem, useNavigation } from 'src/client/ui/navigation/navigation-view';
import SettingsView from 'src/client/ui/overlay/pause-overlay/controllers/settings-view';
import RoomListView from '../room-list-view/room-list-view';

interface MenuItemProps {
    title?: string
    subtitle?: string
    icon?: string
    onClick?: () => void
}

const MenuItem: React.FC<MenuItemProps> = (props) => {
    return (
        <div
            className="card vstack-right-item"
            onClick={props.onClick}
        >
            <div
                className="card-icon"
                style={props.icon ? {backgroundImage: `url("${props.icon}")`} : {}}
            ></div>
            <div className="card-contents">
                {props.title && <div className="card-title">{props.title}</div>}
                {props.subtitle && <div className="card-subtitle">{props.subtitle}</div>}
            </div>
        </div>
    )
}

const MainMenuView: React.FC = () => {

    const navigation = useNavigation()

    const navigateToProfile = () => {
        // TODO: profile
    }

    const navigateToTutorial = () => PageLocation.navigateToScene("tutorial", {})
    const navigateToMapEditor = () => PageLocation.navigateToScene("map-editor", {})
    const navigateToSettings = () => navigation.push(<SettingsView/>)
    const navigateToRooms = () => navigation.push(<RoomListView/>)

    return (
        <NavigationItem title="Главное меню">
            <div className="main-menu">
                <div className="vstack">
                    <div className="card blue play-button">
                        <div className="card-icon"></div>
                        <div className="card-title">Играть</div>
                        <div className="card-subtitle">случайная игра</div>
                    </div>
                    <div
                        className="card blue rooms-button"
                        onClick={navigateToRooms}
                    >
                        <div className="card-icon"></div>
                        <div className="card-title">Игровые комнаты</div>
                    </div>
                </div> 
                <div className="vstack">
                    <MenuItem
                        title="Личная карточка"
                        subtitle="Кто ты, воин?"
                        icon="static/hub/profile@3x.png"
                        onClick={navigateToProfile}/>
                    <MenuItem
                        title="Как играть?"
                        subtitle="Новобранец? Научим!"
                        icon="static/hub/tutorial@3x.png"
                        onClick={navigateToTutorial}/>
                    <MenuItem
                        title="Редактор карт"
                        icon="static/hub/map-editor@3x.png"
                        onClick={navigateToMapEditor}/>
                    <MenuItem
                        title="Настройки"
                        icon="static/hub/settings@3x.png"
                        onClick={navigateToSettings}/>
                </div>
            </div>
        </NavigationItem>
    );
}

export default MainMenuView;