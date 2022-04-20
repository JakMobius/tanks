// @ts-ignore
import Types from './types/*'
import ServerEffect from "./server-effect";

for(let Type of Types) {
    ServerEffect.associate(Type.Model, Type)
}