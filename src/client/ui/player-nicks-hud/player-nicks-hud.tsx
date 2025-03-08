import './player-nicks-hud.scss'

import Entity from "src/utils/ecs/entity";
import PhysicalComponent from "src/entity/components/physics-component";
import Screen from "src/client/graphics/canvas-handler"
import EntityPilotReceiver from "src/entity/components/network/entity-player-list/entity-pilot-receiver";
import TeamColor from "src/utils/team-color";
import CameraComponent from "src/client/graphics/camera";
import Color from 'src/utils/color';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import TransformComponent from 'src/entity/components/transform-component';

interface PlayerNickViewProps {
    entity?: Entity
    world?: Entity
    camera?: Entity
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

        let cameraTransform = props.camera.getComponent(TransformComponent).getGlobalTransform()
        let physicalComponent = props.entity.getComponent(PhysicalComponent)
        let position = physicalComponent.getBody().GetPosition()

        let gameX = position.x
        let gameY = position.y + nickVerticalOffset

        let x = (cameraTransform.transformX(gameX, gameY) + 1) / 2 * props.screen.width
        let y = (-cameraTransform.transformY(gameX, gameY) + 1) / 2 * props.screen.height

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

interface PlayerNicksHUDProps {
    world?: Entity
    screen?: Screen
    camera?: Entity
}

const PlayerNicksHUD: React.FC<PlayerNicksHUDProps> = React.memo((props) => {
    let [players, setPlayers] = useState([] as Entity[])

    const childFilter = (child: Entity) => !!child.getComponent(EntityPilotReceiver)

    const updateChildren = () => {
        setPlayers(props.world?.children?.filter(childFilter) ?? [])
    }

    const onChildAdded = (child: Entity) => {
        if(childFilter(child)) updateChildren()
    }

    const onChildRemoved = (child: Entity) => {
        if(childFilter(child)) updateChildren()
    }

    useEffect(() => {
        updateChildren()
        if(!props.world) return undefined
        props.world.on("child-added", onChildAdded)
        props.world.on("did-remove-child", onChildRemoved)
        return () => {
            props.world.off("child-added", onChildAdded)
            props.world.off("did-remove-child", onChildRemoved)
        }
    }, [props.world])

    return (
        <div className="player-nicks-overlay">
            {players.map((player, i) => <PlayerNickView {...props} entity={player} key={i} />)}
        </div>
    )
})

export default PlayerNicksHUD