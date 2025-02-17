import './event-overlay.scss'

import View from "src/client/ui/view";

import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client'

interface Event {
    key: number,
    fc: React.FC
}

interface EventsContext {
    events?: Event[]
    addEvent?: (event: React.FC) => number
    removeEvent?: (event: number) => void
}

interface EventContext {
    remove: () => void
}

const EventsContext = React.createContext<EventsContext | undefined>(undefined)
const EventContext = React.createContext<EventContext | undefined>(undefined)

interface EventsContextProviderProps {
    children: React.ReactNode
}

const EventsContextProvider: React.FC<EventsContextProviderProps> = (props) => {
    const [state, setState] = React.useState({
        eventCount: 0,
        events: [] as Event[]
    })

    const addEvent = (event: React.FC) => {
        let newEventCount;
        setState(state => {
            newEventCount = state.eventCount + 1;
            return {
                ...state,
                events: [...state.events, {
                    fc: event,
                    key: state.eventCount
                }],
                eventCount: newEventCount
            };
        });
        return newEventCount;
    }

    const removeEvent = (key: number) => {
        setState(state => ({
            ...state,
            events: state.events.filter(e => e.key !== key)
        }))
    }

    return (
        <EventsContext.Provider value={{ events: [], addEvent, removeEvent }}>
            {props.children}
        </EventsContext.Provider>
    )
}

interface EventContainerProps {
    children: React.ReactNode
    event: number
}

const EventContainer: React.FC<EventContainerProps> = (props) => {
    const events = useEvents()

    const remove = () => {
        events.removeEvent(props.event)
    }

    return (
        <EventContext.Provider value={{ remove }}>
            {props.children}
        </EventContext.Provider>
    )
}

export function useEvents() {
    const context = React.useContext(EventsContext)
    if (!context) {
        throw new Error("useEvents must be used within an EventsContextProvider")
    }
    return context
}

export function useEvent() {
    const context = React.useContext(EventContext)
    if (!context) {
        throw new Error("useEvent must be used within an EventContainer")
    }
    return context
}

const EventsContainer: React.FC = () => {
    const events = useEvents()
    const eventRefs = React.useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        let bottom = 10;
        eventRefs.current.forEach((eventView) => {
            if (eventView) {
                eventView.style.bottom = `${bottom}px`;
                bottom += eventView.clientHeight + 10;
            }
        });
    }, [events.events]);

    return (
        <div className="event-overlay">
            {events.events?.map((event, i) => (
                <div className="event-view" key={event.key} ref={el => { eventRefs.current[i] = el }}>
                    <EventContainer event={event.key}>
                        <event.fc />
                    </EventContainer>
                </div>
            ))}
        </div>
    )
}

export default class EventOverlay extends View {

    reactRoot: ReactDOM.Root

    constructor() {
        super()

        this.reactRoot = ReactDOM.createRoot(this.element[0])
        this.reactRoot.render(
            <EventsContextProvider>
                <EventsContainer />
            </EventsContextProvider>
        )
    }

    addEvent(event: React.FC) {
        // let events = useEvents()
        // events.addEvent(event)
        // oops, can't do this right now...
    }
}