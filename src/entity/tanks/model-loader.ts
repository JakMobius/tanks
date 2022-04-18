// @ts-ignore
import Models from './models/*'
import {BinarySerializer} from "../../serialization/binary/serializable";
import TankModel from "./tank-model";

for(let Model of Models) {
    BinarySerializer.register(Model)
    TankModel.Types.set(Model.getId(), Model)
}