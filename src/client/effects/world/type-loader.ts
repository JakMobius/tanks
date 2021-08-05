
// @ts-ignore
import Types from './types/*'
import ClientWorldEffect from "./client-world-effect";

for(let Type of Types) {
    ClientWorldEffect.associate(Type.Model, Type)
}