import { KeyedComponent, KeyedComponentHandle, KeyedComponents, KeyedComponentsHandle } from 'src/client/utils/keyed-component';
import React, { Ref, useContext } from 'react';
import EntityContextProvider from 'src/utils/ecs/entity-context-provider';
import { Component } from 'src/utils/ecs/component';
import Entity from 'src/utils/ecs/entity';

const GameHUDContext = React.createContext<KeyedComponentsHandle | null>(null)
const GameHUDComponentContext = React.createContext<KeyedComponentHandle | null>(null)

export function useHudComponent() {
    let component = useContext(GameHUDComponentContext)
    if (!component) {
        throw new Error("useHudComponent must be used within a GameHUD component")
    }
    return component
}

export class GameHudListenerComponent implements Component {
    entity?: Entity;
    handle?: KeyedComponentsHandle
    contextProvider = new EntityContextProvider()
        .setAddHandler(entity => entity.emit("hud-attach", this))
        .setRemoveHandler(entity => entity.emit("hud-detach", this))

    private entityEventListener = <T,>(fc: React.FC<T>, state: T) => {
        this.handle.addEvent(fc, state)
    }

    addListener(entity: Entity, event: string) {
        entity.on(event, this.entityEventListener)
    }

    removeListener(entity: Entity, event: string) {
        entity.off(event, this.entityEventListener)
    }

    setHud(handle: KeyedComponentsHandle) {
        if(handle === this.handle) return
        // When handle changes, context should re-attach
        this.contextProvider.setEntity(null)
        this.handle = handle
        this.update()
    }

    onAttach(entity: Entity): void {
        this.entity = entity
        this.update()
    }

    onDetach(): void {
        this.entity = null
        this.update()
    }

    update() {
        if(this.entity && this.handle) {
            this.contextProvider.setEntity(this.entity)
        } else {
            this.contextProvider.setEntity(null)
        }
    }
}

const GameHUDInner: React.FC = React.memo(() => {
    const keyedComponents = useContext(GameHUDContext)

    return (<>
        {keyedComponents.components?.map((event, i) => (
            <KeyedComponent
                key={event.key}
                componentKey={event.key}
                componentCtx={GameHUDComponentContext}
                componentsCtx={GameHUDContext}
            >
                <event.fc {...event.props ?? {}}/>
            </KeyedComponent>
        ))}
    </>)
})

interface GameHUDProps {
    keyedComponentsRef?: Ref<KeyedComponentsHandle>
}

const GameHUD: React.FC<GameHUDProps> = React.memo((props: GameHUDProps) => {
    return (
        <KeyedComponents ref={props.keyedComponentsRef} componentsCtx={GameHUDContext}>
            <GameHUDInner/>
        </KeyedComponents>
    )
})

export default GameHUD;