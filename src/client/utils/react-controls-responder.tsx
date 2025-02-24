import { createContext, Ref, useContext, useEffect, useImperativeHandle, useMemo, useState } from "react"
import RootControlsResponder, { ControlsResponder } from "../controls/root-controls-responder"
import React from "react"

interface ControlsContextProps {
    responder: ControlsResponder
    overriden: boolean
    enabled: boolean
    override: (flag: boolean) => void
}

export const ControlsContext = createContext<ControlsContextProps | null>(null)

interface ControlsProviderProps {
    children?: React.ReactNode
    enabled?: boolean
    ref?: Ref<ControlsResponder>
}

export const ControlsProvider: React.FC<ControlsProviderProps> = (props) => {
    let controlsContext = useContext(ControlsContext)
    
    let newResponder = useMemo(() => new ControlsResponder(), [])
    let isEnabled = props.enabled === undefined ? true : props.enabled
    let parentEnabled = controlsContext ? controlsContext.enabled : true

    const [state, setState] = useState({
        responder: newResponder,
        overriden: false,
        enabled: false,
        current: false,
        override: (flag: boolean) => setState((state) => {
            if(flag && state.overriden) {
                throw new Error("Current controls context have already been overriden")
            }
            return {
                ...state,
                overriden: flag
            }
        })
    })

    useImperativeHandle(props.ref, () => {
        return newResponder
    }, [])

    useEffect(() => {
        setState(state => {
            let enabled = isEnabled && parentEnabled 
            let current = enabled && !state.overriden
            if(state.enabled === enabled && state.current === current) return state
            return { ...state, enabled, current }
        })
    }, [isEnabled, parentEnabled, state.overriden])

    useEffect(() => {
        if(!state.enabled || !controlsContext) return undefined
        controlsContext?.override(true)
        return () => {
            controlsContext?.override(false)
        }
    }, [state.enabled])

    useEffect(() => {
        if(!state.current) return undefined
        RootControlsResponder.getInstance().setMainResponderDelayed(newResponder)
        return () => newResponder.setParentResponder(null)
    }, [state.current])
    
    return (
        <ControlsContext.Provider value={state}>
            {props.children}
        </ControlsContext.Provider>
    )
}

export function useControls() {
    let context = useContext(ControlsContext)
    if(context === null) {
        throw new Error("useControls must be used within ControlsProvider")
    }
    return context.responder
}