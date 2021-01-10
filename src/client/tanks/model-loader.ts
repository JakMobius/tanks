
// @ts-ignore
import Models from './models/*'
import ClientTank from "../../../src/client/tanks/clienttank";

for(let Model of Models) {
    ClientTank.register(Model)
}