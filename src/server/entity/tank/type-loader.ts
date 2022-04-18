// @ts-ignore
import Types from "./types/*"
import ServerTank from "./server-tank";

for(let Type of Types) {
    ServerTank.register(Type)
}