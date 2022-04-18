//@ts-ignore
import Types from './types/*'
import BlockState from "./block-state";

for(let Type of Types) {
    BlockState.registerBlockStateClass(Type)
}