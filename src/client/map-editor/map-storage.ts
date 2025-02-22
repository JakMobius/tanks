import { MapFile } from "src/map/map-serialization";
import { getHubMap } from "../hub/hub-map";
import TilemapComponent from "src/map/tilemap-component";

export default class MapStorage {

    static read(): MapFile[] {

        let editorMaps = window.localStorage.getItem("editor-maps")
        
        
        
        return [getHubMap()]
    }

    static write(maps: TilemapComponent[]) {
        window.localStorage.setItem("editor-maps", "TODO")
    }
}