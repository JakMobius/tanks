
import React, { useContext } from "react";
import { useEffect, useImperativeHandle, useMemo, useState } from "react";

export interface KeyedComponentState {
    key: number
    fc: React.FC
    props: any
}

export interface KeyedComponentHandle {
    remove: () => void
}

interface EventContainerProps {
    children?: React.ReactNode
    componentCtx: React.Context<KeyedComponentHandle>
    componentsCtx: React.Context<KeyedComponentsHandle>
    componentKey: number
}

export const KeyedComponent: React.FC<EventContainerProps> = (props) => {
    const events = useContext(props.componentsCtx)

    const remove = () => {
        events.removeEvent(props.componentKey)
    }

    return (
        <props.componentCtx.Provider value={{ remove }}>
            {props.children}
        </props.componentCtx.Provider>
    )
}

class KeyedComponentStorage {
    private keyMap = new Map<React.FC, number>()
    private totalKeys = 0

    get(fc: React.FC) {
        let key = this.keyMap.get(fc)
        if (key === undefined) {
            key = this.totalKeys++
            this.keyMap.set(fc, key)
        }
        return key
    }

    remove(fc: React.FC) {
        this.keyMap.delete(fc)
    }
}

export interface KeyedComponentsHandle {
    addEvent: <T,>(fc: React.FC<T>, props?: T) => number
    removeEvent: (key: number) => void
    components: KeyedComponentState[]
}

export interface KeyedComponentsProps {
    ref?: React.Ref<KeyedComponentsHandle>
    componentsCtx?: React.Context<KeyedComponentsHandle>
    children?: React.ReactNode
}

export const KeyedComponents: React.FC<KeyedComponentsProps> = (props) => {
    const [keyedComponents, setKeyedComponents] = useState([] as KeyedComponentState[])

    const componentStorage = useMemo(() => new KeyedComponentStorage(), [])

    const addEvent = (fc: React.FC, props?: any) => {
        let key = componentStorage.get(fc)
        setKeyedComponents(keyedComponents => {
            let index = keyedComponents.findIndex(e => e.key === key);
            if (index !== -1) {
                let newEvents = [...keyedComponents];
                newEvents[index].props = props;
                return newEvents;
            }

            return [...keyedComponents, {
                fc: fc,
                props: props,
                key: key
            }]
        });
        return key;
    }

    const removeEvent = (key: number) => {
        setKeyedComponents(keyedComponents => {
            // Yea, that's O(n) but array copy is O(n) too.
            // There won't be that many events anyway.

            let index = keyedComponents.findIndex(e => e.key === key);
            if (index === -1) return keyedComponents
            componentStorage.remove(keyedComponents[index].fc)

            return keyedComponents.filter(e => e.key !== key)
        })
    }

    const [context, setContext] = useState({
        addEvent,
        removeEvent,
        components: [],
    })

    useEffect(() => setContext(context => ({
        ...context,
        components: keyedComponents
    })), [keyedComponents])

    useImperativeHandle(props.ref, () => context)

    return (
        <props.componentsCtx.Provider value={context}>
            {props.children}
        </props.componentsCtx.Provider>
    )
}