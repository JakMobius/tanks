
// @ts-ignore
import Models from './models/*'
import ClientBullet from "./client-bullet";

for(let Model of Models) {
    ClientBullet.associate(Model, Model.Model)
}