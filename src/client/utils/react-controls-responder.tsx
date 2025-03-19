import { createContext, Ref, useContext, useEffect, useImperativeHandle, useMemo, useState } from "react"
import RootControlsResponder, { ControlsResponder } from "../controls/root-controls-responder"
import React from "react"

export const ControlsContext = createContext<ControlsResponder | null>(null)

interface ControlsProviderProps {
    children?: React.ReactNode
    ref?: Ref<ControlsResponder>
    default?: boolean
    flat?: boolean
    autofocus?: boolean
}

export const ControlsProvider: React.FC<ControlsProviderProps> = (props) => {
    let controlsContext = useContext(ControlsContext)
    
    let newResponder = useMemo(() => {
        let responder = new ControlsResponder()
            .setFlat(props.flat ?? false)
            .setDefault(props.default ?? false)
        return responder
    }, [])

    useImperativeHandle(props.ref, () => {
        return newResponder
    }, [])

    useEffect(() => {
        let parent = controlsContext ?? RootControlsResponder.getInstance()
        newResponder.setParentResponder(parent)
        if(props.autofocus) newResponder.focus()
        return () => newResponder.setParentResponder(null)
    }, [])
    
    return (
        <ControlsContext.Provider value={newResponder}>
            {props.children}
        </ControlsContext.Provider>
    )
}

export function useControls() {
    let context = useContext(ControlsContext)
    if(context === null) {
        throw new Error("useControls must be used within ControlsProvider")
    }
    return context
}