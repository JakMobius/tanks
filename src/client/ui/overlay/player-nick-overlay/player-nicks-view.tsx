import './player-nicks-view.scss'

import Entity from "src/utils/ecs/entity";
import PhysicalComponent from "src/entity/components/physics-component";
import Screen from "src/client/graphics/canvas-handler"
import EntityPilotReceiver from "src/entity/components/network/entity-player-list/entity-pilot-receiver";
import TeamColor from "src/utils/team-color";
import CameraComponent from "src/client/graphics/camera";
import Color from 'src/utils/color';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface PlayerNickViewProps {
    entity?: Entity
    world?: Entity
    camera?: CameraComponent
    screen?: Screen
}

const PlayerNickView: React.FC<PlayerNickViewProps> = (props) => {

    const nickVerticalOffset: number = -3.2

    const [state, setState] = useState({
        nick: null as string | null,
        color: null as Color | null,
        bounds: null as { width: number, height: number } | null
    })

    const ref = useRef<HTMLDivElement>(null)

    const onTick = () => {
        if (!state.bounds || !ref.current) return

        let physicalComponent = props.entity.getComponent(PhysicalComponent)
        let position = physicalComponent.getBody().GetPosition()

        let gameX = position.x
        let gameY = position.y + nickVerticalOffset

        let x = (props.camera.matrix.transformX(gameX, gameY) + 1) / 2 * props.screen.width
        let y = (-props.camera.matrix.transformY(gameX, gameY) + 1) / 2 * props.screen.height

        x -= state.bounds.width / 2
        y -= state.bounds.height

        ref.current.style.left = x + "px"
        ref.current.style.top = y + "px"
    }

    const updatePilot = useCallback(() => setState(state => {
        let playerList = props.entity?.getComponent(EntityPilotReceiver)
        return {
            ...state,
            nick: playerList?.pilot?.nick,
            color: playerList.pilot ? TeamColor.getColor(playerList.pilot.teamId) : null
        }
    }), [props.entity])

    useEffect(() => {
        updatePilot()
        if (!props.entity) return undefined
        props.entity.on("pilot-received", updatePilot)
        return () => props.entity.off("pilot-received", updatePilot)
    }, [props.entity])

    useEffect(() => {
        setState(prevState => ({
            ...prevState,
            bounds: ref.current ? {
                width: ref.current.offsetWidth,
                height: ref.current.offsetHeight
            } : null }
        ))
    }, [state.nick, ref.current])

    useEffect(() => {
        if (!props.world || !props.camera || !props.entity || !props.screen) return undefined
        props.world.on("tick", onTick)
        return () => props.world.off("tick", onTick)
    }, [onTick])

    useEffect(() => {
        if(ref.current) ref.current.style.color = state.color?.code()
    }, [state.color, ref.current])

    return state.nick && (
        <div ref={ref} className="nick-block">{state.nick}</div>
    )
}

interface PlayerNicksViewProps {
    world?: Entity
    screen?: Screen
    camera?: CameraComponent
}

const PlayerNicksView: React.FC<PlayerNicksViewProps> = (props) => {
    let [players, setPlayers] = useState([] as Entity[])

    const updateChildren = () => {
        setPlayers(props.world?.children?.slice() ?? [])
    }

    useEffect(() => {
        updateChildren()
        if(!props.world) return undefined
        props.world.on("child-added", updateChildren)
        props.world.on("did-remove-child", updateChildren)
        return () => {
            props.world.off("child-added", updateChildren)
            props.world.off("did-remove-child", updateChildren)
        }
    }, [props.world])

    return (
        <div className="player-nicks-overlay">
            {players.map((player, i) => {
                if(!player.getComponent(EntityPilotReceiver)) return null
                return <PlayerNickView {...props} entity={player} key={i} />
            })}
        </div>
    )
}

export default PlayerNicksView