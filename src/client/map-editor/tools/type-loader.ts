//@ts-ignore
import Tools from './types/*'
import {Constructor} from "../../../serialization/binary/serializable";
import Tool from "./tool";

export default Tools as Constructor<Tool>[]