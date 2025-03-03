import SceneEntityLibrary from "../scene-entity-library/scene-entity-library"
import SceneTreeView from "../scene-tree-view/scene-tree-view"
import Dragger from "../sidebar-drag-edge/sidebar-drag-edge"
import { SidebarSectionContext, SidebarSections } from "../sidebar-sections/sidebar-sections"
import "./map-editor-sidebar.scss"

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"

interface SidebarSectionHeaderProps {
    text: string
    open: boolean
    onToggle?: () => void
}

const SidebarSectionHeader: React.FC<SidebarSectionHeaderProps> = (props) => {
    return (
        <div className="map-editor-sidebar-section-header">
            <div className={"expand-arrow " + (props.open ? "open" : "")} onClick={props.onToggle}/>
            <div className="map-editor-sidebar-section-header">{props.text}</div>
        </div>
    )
}

interface SidebarSectionProps {
    header: string
    children?: React.ReactNode
}

const SidebarSection: React.FC<SidebarSectionProps> = (props) => {

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
        <div className="map-editor-sidebar-section" style={{height: section.height}}>
            <SidebarSectionHeader text={props.header} onToggle={onToggle} open={open}/>
            {open && props.children}
            <Dragger onDrag={onDrag} contents={(ref) => (
                <div className="drag-edge" ref={(elt) => { ref.current = elt }}></div>
            )}/>
        </div>
    )
}

interface MapEditorSidebarProps {
    
}

const MapEditorSidebar: React.FC<MapEditorSidebarProps> = (props) => {

    return (
        <div className="map-editor-sidebar">
            <SidebarSections
                sections={3}
                minSectionHeight={150}
                collapsedSectionHeight={40}
                sectionContent={(index) => {
                switch(index) {
                    case 0: return (
                        <SidebarSection key={index} header="Слои">
                            <SceneTreeView/>
                        </SidebarSection>
                    )
                    case 1: return (
                        <SidebarSection key={index} header="Библиотека слоёв">
                            <SceneEntityLibrary/>
                        </SidebarSection>
                    )
                    case 2: return (
                        <SidebarSection key={index} header="Компоненты">
                            
                        </SidebarSection>
                    )
                    default: return <></>
                }
            }}>
            </SidebarSections>
        </div>
    )
}

export default MapEditorSidebar;