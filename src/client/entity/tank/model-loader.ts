// @ts-ignore
import Types from './types/*'
import ClientTank from "./client-tank";

for(let Model of Types) {
    ClientTank.register(Model)
}