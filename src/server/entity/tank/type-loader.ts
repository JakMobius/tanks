
// @ts-ignore
import Types from "./types/*"
import ServerTank from "./servertank";

for(let Type of Types) {
    ServerTank.register(Type)
}