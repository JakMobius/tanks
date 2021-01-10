
// @ts-ignore
import Models from './models/*'
import ClientBullet from "./clientbullet";

for(let Model of Models) {
    ClientBullet.associate(Model, Model.Model)
}