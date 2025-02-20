import './events-hud.scss'

import { KeyedComponent, KeyedComponentHandle, KeyedComponents, KeyedComponentsHandle } from 'src/client/utils/keyed-component';
import React, { useContext, useEffect } from 'react';

export const EventsContext = React.createContext<KeyedComponentsHandle | null>(null)
const EventContext = React.createContext<KeyedComponentHandle | null>(null)

export function useEvents() {
    let component = useContext(EventsContext)
    if (!component) {
        throw new Error("useEvents must be used within a EventsProvider component")
    }
    return component
}

export function useEvent() {
    let component = useContext(EventContext)
    if (!component) {
        throw new Error("useEvent must be used within EventsHUD event component")
    }
    return component
}

interface EventsProviderProps {
    ref?: React.Ref<KeyedComponentsHandle>
    children?: React.ReactNode
}

export const EventsProvider: React.FC<EventsProviderProps> = React.memo((props) => {
    return (
        <KeyedComponents ref={props.ref} componentsCtx={EventsContext}>
            {props.children}
        </KeyedComponents>
    )
})

const EventsHUD: React.FC = React.memo(() => {
    const components = useEvents()
    const eventRefs = React.useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        let bottom = 0;
        eventRefs.current.forEach((eventView) => {
            if (eventView) {
                eventView.style.bottom = `${bottom}px`;
                bottom += eventView.clientHeight + 10;
            }
        });
    }, [components.components]);

    return (
        <div className="events-hud">
            {components.components?.map((event, i) => (
                <div className="event-view" key={event.key} ref={el => { eventRefs.current[i] = el }}>
                    <KeyedComponent
                        key={event.key}
                        componentKey={event.key}
                        componentCtx={EventContext}
                        componentsCtx={EventsContext}>
                        <event.fc {...event.props ?? {}}/>
                    </KeyedComponent>
                </div>
            ))}
        </div>
    )
})

export default EventsHUD;