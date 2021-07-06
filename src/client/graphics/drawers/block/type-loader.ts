// @ts-ignore
import Models from './types/*'
import MapDrawer from 'src/client/graphics/drawers/map-drawer';

for(let Model of Models) {
    let drawer = new Model()
    MapDrawer.registerBlockLoader(drawer.id, drawer)
}