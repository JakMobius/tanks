
//@ts-ignore
import Types from './types/*'
import ClientTankEffect from "./clienttankeffect";

for(let Type of Types) {
    ClientTankEffect.associate(Type.Model, Type)
}