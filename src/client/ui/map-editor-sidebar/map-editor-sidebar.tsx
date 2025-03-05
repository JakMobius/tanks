import "./map-editor-sidebar.scss"

import SceneEntityLibrary from "../scene-entity-library/scene-entity-library"
import SceneTreeView from "../scene-tree-view/scene-tree-view"
import { SidebarSections } from "../sidebar-sections/sidebar-sections"

import React from "react"
import { SidebarSection } from "../sidebar-section/sidebar-section"
import { SceneComponentsSection } from "../scene-components-view/scene-components-view"

const MapEditorSidebarHeader: React.FC = (props) => {
    return (
        <div className="map-editor-sidebar-header">
            <div className="map-editor-sidebar-header-side">
                <div className="map-editor-sidebar-header-icon"/>
                <div className="map-editor-sidebar-header-text">
                    Редактор карт
                </div>
            </div>
            <div className="map-editor-sidebar-header-side">
                <div className="map-editor-sidebar-close-button"/>
            </div>
        </div>
    )
}

interface MapEditorSidebarProps {
    
}

const MapEditorSidebar: React.FC<MapEditorSidebarProps> = (props) => {

    return (
        <div className="map-editor-sidebar">
            <MapEditorSidebarHeader/>
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
            }}>
            </SidebarSections>
        </div>
    )
}

export default MapEditorSidebar;