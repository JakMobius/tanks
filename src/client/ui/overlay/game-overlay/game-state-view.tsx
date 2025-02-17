import './game-state-view.scss'

import React, { useEffect, useRef, useState } from 'react'

interface GameStateViewProps {
    header?: React.ReactNode
    children?: React.ReactNode
    visibility?: "show" | {}
}

const GameStateView: React.FC<GameStateViewProps> = (props) => {

    const [visible, setVisible] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if(!props.visibility) return undefined
        setVisible(true)

        if(props.visibility === "show") return undefined

        let timeout = setTimeout(() => {
            setVisible(false)
        }, 5000)
        return () => clearTimeout(timeout)
    }, [props.visibility])
    
    return (
        <div className={"overlay-menu " + (visible ? "shown" : "")} ref={ref}>
            <div className="overlay-header">{props.header}</div>
            <div className="overlay-text">{props.children}</div>
        </div>
    )
}

export default GameStateView