import './basic-event-view.scss'

import { useEvent } from './event-overlay'
import React, { useEffect } from 'react'

interface BasicEventProps {
    text: string
}

export const BasicEvent: React.FC<BasicEventProps> = (props) => {
    const event = useEvent()

    useEffect(() => {
        let timeout = setTimeout(() => {
            event.remove()
        }, 2000)

        return () => {
            clearTimeout(timeout)
        }
    }, [])

    return (
        <div className="basic-event-view">
            {props.text}
        </div>
    )
}