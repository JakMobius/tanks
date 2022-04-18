// @ts-ignore
import Types from "./types/*"
import ServerBullet from "./server-bullet";

for(let Type of Types) {
    ServerBullet.associate(Type, Type.Model);
}