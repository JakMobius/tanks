import "./map-editor-sidebar.scss"

import SceneEntityLibrary from "../scene-entity-library/scene-entity-library"
import SceneTreeView from "../scene-tree-view/scene-tree-view"
import { SidebarSections } from "../sidebar-sections/sidebar-sections"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { SidebarSection } from "../sidebar-section/sidebar-section"
import { SceneComponentsSection } from "../scene-components-view/scene-components-view"
import { useMapEditor } from "src/client/map-editor/map-editor-scene"
import Dragger from "../dragger/dragger"
import { Modification } from "src/client/map-editor/history/history-manager"

interface MapEditorSidebarHeaderProps {
    onHide?: () => void
}

const MapEditorSidebarHeader: React.FC<MapEditorSidebarHeaderProps> = (props) => {

    const [isEditing, setIsEditing] = useState(false)
    const inputRef = useRef<HTMLInputElement | null>(null);
    const editor = useMapEditor()
    const mapName = editor.useMapName()

    const startEditing = useCallback(() => {
        setIsEditing(true)
    }, [])

    const commitChanges = () => {
        if(!inputRef.current) return
        let oldName = editor.getMapName()
        let newName = inputRef.current.value
        let modification = {
            actionName: "Переименование карты",
            perform: () => editor.setMapName(newName),
            revert: () => editor.setMapName(oldName)
        } as Modification
        modification.perform()
        editor.getHistoryManager().registerModification(modification)
        setIsEditing(false)
    }

    const resetChanges = () => {
        setIsEditing(false)
    }

    useEffect(() => {
        let input = inputRef.current
        if(!input) return undefined

        const onKeypress = (e: KeyboardEvent) => {
            if(e.key === "Enter") commitChanges()
            else if(e.key !== "Escape") return
            e.preventDefault()
            resetChanges()
        }

        const onBlur = (e: FocusEvent) => {
            commitChanges()
        }

        input.focus()
        input.addEventListener("keypress", onKeypress)
        input.addEventListener("blur", onBlur)
        return () => {
            input.removeEventListener("keypress", onKeypress)
            input.removeEventListener("blur", onBlur)
        }
    }, [isEditing])
    
    useEffect(() => {
        let input = inputRef.current
        if(!input) return undefined
        input.value = mapName
    }, [isEditing, mapName])

    return (
        <div className="map-editor-sidebar-header">
            <div className="map-editor-sidebar-header-icon"/>
            {
                isEditing ?
                <input className="map-editor-sidebar-header-text" ref={inputRef}/> :
                <div onClick={startEditing} className="map-editor-sidebar-header-text">
                    {mapName}
                </div>
            }
            <div className="map-editor-sidebar-close-button" onClick={props.onHide}/>
        </div>
    )
}

interface MapEditorSidebarProps {
    
}

const MapEditorSidebar: React.FC<MapEditorSidebarProps> = (props) => {

    const minSidebarWidth = 150

    const [state, setState] = useState({
        width: 320,
        hidden: false
    })
    
    const onDrag = useCallback((dx: number, dy: number) => {
        setState(state => {
            let newHidden = state.hidden
            let oldWidth = state.hidden ? 0 : state.width
            let newWidth = oldWidth + dx

            if(newWidth < minSidebarWidth) {
                newHidden = true
                newWidth = minSidebarWidth
            }

            if(newWidth > minSidebarWidth && newHidden) {
                newHidden = false
            }

            return {
                width: newWidth,
                hidden: newHidden
            }
        })
    }, [])

    const show = useCallback(() => {
        setState(state => ({ 
            ...state,
            hidden: false
        }))
    }, [])

    const hide = useCallback(() => {
        setState(state => ({ 
            ...state,
            hidden: true
        }))
    }, [])

    return (<>
        <div className="map-editor-sidebar" style={{ width: state.hidden ? 0 : state.width }}>
            { state.hidden ? null : <>
                <MapEditorSidebarHeader onHide={hide}/>
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
                        case 2: return <SceneComponentsSection key={index}/>
                        default: return <></>
                    }
                }}/>
            </> }
            <Dragger onDrag={onDrag} contents={(ref) => (
                <div className="sidebar-drag-edge" ref={(elt) => { ref.current = elt }}></div>
            )}/>
        </div>
        { state.hidden ? (
            <div className="map-editor-sidebar-show-button" onClick={show}/>
        ): null }
    </>)
}

export default MapEditorSidebar;