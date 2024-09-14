// @ts-ignore
import Models from './types/*'
import MapDrawerComponent from 'src/client/graphics/drawers/map-drawer-component';

for(let Model of Models) {
    let drawer = new Model()
    MapDrawerComponent.registerBlockLoader(drawer.id, drawer)
}