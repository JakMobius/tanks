// @ts-ignore
import Models from "./models/*"
import EffectModel from "../effect-model";

for(let Model of Models) {
    EffectModel.register(Model)
}