import { KeyedComponent, KeyedComponentHandle, KeyedComponents, KeyedComponentsHandle } from 'src/client/utils/keyed-component';
import React, { Ref, useContext } from 'react';

const GameHUDContext = React.createContext<KeyedComponentsHandle | null>(null)
const GameHUDComponentContext = React.createContext<KeyedComponentHandle | null>(null)

export function useHudComponent() {
    let component = useContext(GameHUDComponentContext)
    if (!component) {
        throw new Error("useHudComponent must be used within a GameHUD component")
    }
    return component
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