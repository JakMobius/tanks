
// @ts-ignore
import Models from "./models/*"
import ServerBullet from "./serverbullet";

for(let Model of Models) {
    ServerBullet.associate(Model.Model, Model);
}