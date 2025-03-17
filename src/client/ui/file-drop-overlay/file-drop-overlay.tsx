import "./file-drop-overlay.scss"

import React, { useCallback, useEffect } from "react"
import { DropTargetMonitor, useDrop } from "react-dnd"
import { NativeTypes } from "react-dnd-html5-backend"
import { useScene } from "../../scenes/scene-controller"
import { useEvents } from "../events-hud/events-hud"
import { BasicEvent } from "../events-hud/basic-event-view"
import { useMapEditorScene } from "src/client/map-editor/map-editor-scene"
import { readMapFromFile } from "src/client/map-editor/read-map-from-file"

export const FileDropOverlay: React.FC = () => {
    const scene = useScene()
    const events = useEvents()
    const mapEditorScene = useMapEditorScene()

    const handleError = () => {
        events.addEvent(() => {
            return <BasicEvent text="Не удалось загрузить карту."/>
        })
    }

    const loadFile = useCallback((file: File) => {
        readMapFromFile(file).then((packedEntity) => {
            mapEditorScene.loadMap(packedEntity.name, packedEntity.createEntity())
        }).catch((e) => {
            handleError()
        })
    }, [])

    const onFileDrop = useCallback((props: { files: any }) => {
        if(props.files instanceof File) loadFile(props.files)
        else if(Array.isArray(props.files)) {
            let file = props.files[0]
            if(file instanceof File) loadFile(file)
        } else {
            handleError()
        }
    }, [loadFile])

    const [{ canDrop, isOver }, drop] = useDrop(() => ({
        accept: [NativeTypes.FILE],
        drop(item: { files: any[] }) {
            onFileDrop(item)
        },
        collect: (monitor: DropTargetMonitor) => {
            return {
                isOver: monitor.isOver(),
                canDrop: monitor.canDrop(),
            }
        },
    }),
    [onFileDrop])

    useEffect(() => {
        drop(scene.root)
        return () => { drop(null) }
    }, [scene.root, drop])

    if(canDrop && isOver) {
        return <div className="drop-release-overlay">Отпустите, чтобы загрузить файл</div>
    }
    return <></>
}