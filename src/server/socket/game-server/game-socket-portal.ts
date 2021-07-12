import SocketPortalClient from '../socket-portal-client';
import SocketPortal from '../socket-portal';
import RoomListRequestPacket from '../../../networking/packets/game-packets/roomlistrequestpacket';
import RoomListPacket from '../../../networking/packets/game-packets/roomlistpacket';
import PlayerRoomRequestPacket from '../../../networking/packets/game-packets/playerroomrequestpacket';
import PlayerRoomChangePacket from '../../../networking/packets/game-packets/playerroomchangepacket';
import pako from 'pako';
import Room from "../../room/room";
import * as Websocket from "websocket";
import BinaryPacket from "../../../networking/binarypacket";
import * as fs from "fs"
import RoomConfig from "../../room/room-config";
import BinaryDecoder from "../../../serialization/binary/binarydecoder";
import GameMap from "../../../utils/map/gamemap";
import Game from "../../room/game";

class GameSocketPortal extends SocketPortal {
	public roomsInterval: any;
	public server: any;
    public games = new Map<string, Room>()

    constructor() {
        super()
        this.setupRoomsUpdate()
    }

    setupRoomsUpdate() {
        this.roomsInterval = setInterval(() => this.updateRooms(), 1000)
    }

    stopRoomUpdate() {
        clearInterval(this.roomsInterval)
    }

    handleRequest(request: Websocket.request) {

        // Only handling /game-socket requests

        if(request.resourceURL.path === "/game-socket") {
            super.handleRequest(request);
        }
    }

    updateRooms() {
        if(this.clients.size === 0) {
            return
        }

        let packet = new RoomListPacket(Array.from(this.games.values()))

        for(let client of this.clients.values()) {
            if(client.data["listeningForRooms"]) {
                packet.sendTo(client.connection)
            }
        }
    }

    terminate() {
        this.logger.log("Closing server...")
        this.stopRoomUpdate()
        super.terminate()
    }

    configureClient(client: SocketPortalClient, game: Room) {
        if(client.game) {
            this.logger.log("Клиент " + client.id + " отключен от игры " + client.game.name)
            client.game.clientDisconnected(client)
        }

        this.logger.log("Клиент " + client.id + " подключен к игре " + game.name)

        game.portal.clientConnected(client)
        client.game = game
    }

    clientDisconnected(client: SocketPortalClient) {
        super.clientDisconnected(client);
        if(client.game) {
            this.logger.log("Клиент " + client.id + " отключен от игры " + client.game.name)
            client.game.clientDisconnected(client)
        }
    }

    handlePacket(packet: BinaryPacket, client: SocketPortalClient) {
        super.handlePacket(packet, client)

        if(packet instanceof RoomListRequestPacket) {
            client.data["listeningForRooms"] = packet.request;
        } else if(packet instanceof PlayerRoomRequestPacket) {
            const room = this.games.get(packet.room);

            if (room) {
                if(room.portal.clients.size >= room.maxOnline) {
                    PlayerRoomChangePacket.deny(
                        packet.room,
                        "Эта комната переполнена"
                    ).sendTo(client.connection)
                } else {
                    PlayerRoomChangePacket.allow(room.name).sendTo(client.connection)
                    this.configureClient(client, room)
                }
            } else {
                PlayerRoomChangePacket.deny(
                    packet.room,
                    "Такой комнаты не существует. Возможно, она была закрыта"
                ).sendTo(client.connection)
            }
        }
        if(packet) client.game.clientMessage(client, packet)
    }

    getFreeGame() {
        let game, online = -1

        for(let eachGame of this.games.values()) {
            const eachOnline = eachGame.portal.clients.size

            if(eachOnline < eachGame.maxOnline) {
                if(eachOnline > online) {
                    game = eachGame
                    online = eachOnline
                }
            }
        }

        return game
    }

    clientConnected(client: SocketPortalClient) {
        let connection = client.connection

        // if(this.banned.indexOf(connection.remoteAddress) !== -1) {
        //     connection.close("Администратор внёс Ваш ip в бан-лист")
        //     return
        // }

        if(this.games.size === 0) {
            connection.close("Нет запущенных игр, попробуйте позже")
            return
        }

        let game = this.getFreeGame();

        if(!game) {
            connection.close("Сервер переполнен, попробуйте позже")
            return
        }

        this.configureClient(client, game)
    }

    async createRoom(config: RoomConfig) {
        const gzip = await fs.promises.readFile(config.map)
        const data = pako.inflate(gzip)
        const decoder = new BinaryDecoder({ largeIndices: true })
        decoder.reset()
        decoder.readData(data.buffer)

        const map = GameMap.fromBinary(decoder)

        const game = new Game({
            name: config.name,
            server: this.server,
            map: map
        })

        this.games.set(config.name, game)
    }
}

export default GameSocketPortal;
