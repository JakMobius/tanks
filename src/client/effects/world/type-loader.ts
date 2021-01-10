
// @ts-ignore
import Types from './types/*'
import ClientWorldEffect from "./clientworldeffect";

for(let Type of Types) {
    ClientWorldEffect.associate(Type.Model, Type)
}