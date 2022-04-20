// @ts-ignore
import Types from './types/*'
import ClientEffect from "./client-effect";

for(let Type of Types) {
    ClientEffect.associate(Type.Model, Type)
}