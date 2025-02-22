// @ts-ignore
import MapDrawerComponent from 'src/entity/types/tilemap/client-side/map-drawer-component'
import Models from './types/%'

for(let Model of Models) {
    let drawer = new Model()
    MapDrawerComponent.registerBlockLoader(drawer.id, drawer)
}