
//@ts-ignore
import Types from './types/*'
import BlockState from "./blockstate";

for(let Type of Types) {
    BlockState.registerBlockStateClass(Type)
}