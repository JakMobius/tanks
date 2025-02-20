
import './large-icon-event-view.scss'
import React from 'react'

interface LargeIconEventViewProps {
    icon?: React.ReactNode,
    children?: React.ReactNode,
}

const LargeIconEventView: React.FC<LargeIconEventViewProps> = (props) => {
    return (
        <div className="large-icon-event-view">
            <div className="event-icon">{props.icon}</div>
            <div className="event-text">
                {props.children}
            </div>
        </div>
    )
}

export default LargeIconEventView;
