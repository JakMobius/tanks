
//@ts-ignore
import Types from './types/*'
import ClientTankEffect from "./client-tank-effect";

for(let Type of Types) {
    ClientTankEffect.associate(Type.Model, Type)
}