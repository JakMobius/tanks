
import './basic-event-view.scss'

import React, { useEffect } from 'react'
import { useEvent } from './events-hud'

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