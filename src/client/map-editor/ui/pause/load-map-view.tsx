import './load-map-view.scss'

import {PauseMenuSubtitle, PauseNavigationItem} from "src/client/ui/pause-overlay/pause-menu-view";
import MapStorage from "src/client/map-editor/map-storage";
import GameMap from "src/map/game-map";
import GameMapNameComponent from "src/client/map-editor/map-name-component";
import GameMapSizeComponent from "src/client/map-editor/map-size-component";
import React, { useState } from 'react';
import { useMapEditorScene } from '../../scenes/map-editor-scene';
import { useNavigation } from 'src/client/ui/navigation/navigation-view';

interface MapPreviewRowProps {
    map: GameMap
    onClick?: () => void
}

const MapPreviewRow: React.FC<MapPreviewRowProps> = (props) => {
    let name = props.map.getComponent(GameMapNameComponent)?.name ?? "Карта"
    let size = props.map.getComponent(GameMapSizeComponent)?.size ?? -1

    const mapEditor = useMapEditorScene()
    const navigation = useNavigation()

    const onMapSelect = () => {
        mapEditor.loadMap(props.map)
        navigation.popAll()
    }

    return (
        <div className="map-preview-row">
            <div className="map-preview-container">
                <canvas></canvas>
            </div>
            <div className="map-description">
                <div className="map-description-title">{name}</div>
                <div className="map-description-subtitle">{size} байт • изм. 10.02.2024 14:23</div>
            </div>
            <div className="map-buttons-container">
                <div className="open-button" onClick={onMapSelect}>Открыть</div>
            </div>
        </div>
    )
}

const LoadMapView: React.FC = () => {
    const [maps] = useState(MapStorage.read())
    
    return (
        <PauseNavigationItem title="Загрузить карту">
            <PauseMenuSubtitle>
                Чтобы загрузить карту из файла, просто перетащите его в окно с редактором.
            </PauseMenuSubtitle>
            {maps.map((map, index) => (
                <MapPreviewRow map={map} key={index}/>
            ))}
        </PauseNavigationItem>
    )
}

export default LoadMapView;