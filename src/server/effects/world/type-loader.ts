
// @ts-ignore
import Types from './types/*'
import ServerWorldEffect from "./serverworldeffect";

for(let Type of Types) {
    ServerWorldEffect.associate(Type.Model, Type)
}