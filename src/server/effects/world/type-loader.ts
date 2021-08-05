
// @ts-ignore
import Types from './types/*'
import ServerWorldEffect from "./server-world-effect";

for(let Type of Types) {
    ServerWorldEffect.associate(Type.Model, Type)
}