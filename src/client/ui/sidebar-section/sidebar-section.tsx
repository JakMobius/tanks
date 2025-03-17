import "./sidebar-section.scss"

import React from "react"
import { useCallback, useContext, useEffect, useState } from "react"
import { SidebarSectionContext } from "../sidebar-sections/sidebar-sections"
import Dragger from "../dragger/dragger"

interface SidebarSectionHeaderProps {
    text: string
    open: boolean
    onToggle?: () => void
}

const SidebarSectionHeader: React.FC<SidebarSectionHeaderProps> = (props) => {
    return (
        <div className="sidebar-section-header">
            <div className={"expand-arrow " + (props.open ? "open" : "")} onClick={props.onToggle}/>
            <div className="sidebar-section-header-text">{props.text}</div>
        </div>
    )
}

interface SidebarSectionProps {
    header: string
    children?: React.ReactNode
}

export const SidebarSection: React.FC<SidebarSectionProps> = (props) => {

    const [open, setOpen] = useState(true)
    const section = useContext(SidebarSectionContext)

    const onToggle = useCallback(() => setOpen(!open), [open])

    useEffect(() => {
        if(open) section.expand()
        else section.collapse()
    }, [open])

    
    const onDrag = useCallback((dx: number, dy: number) => {
        section.dragEdge(dy)
    }, [])

    return (
        <div className="sidebar-section" style={{height: section.height}}>
            <SidebarSectionHeader text={props.header} onToggle={onToggle} open={open}/>
            {open && props.children}
            <Dragger onDrag={onDrag} contents={(ref) => (
                <div className="drag-edge" ref={(elt) => { ref.current = elt }}></div>
            )}/>
        </div>
    )
}