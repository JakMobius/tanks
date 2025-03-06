import "./scene-components-view.scss"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMapEditorScene } from "src/client/map-editor/map-editor-scene";
import { Property, PropertyInspector, VectorProperty } from "src/entity/components/inspector/property-inspector";
import { SidebarSection } from "../sidebar-section/sidebar-section";
import { EntityEditorTreeNodeComponent } from "../scene-tree-view/components";

const useParameterValue = (property: Property) => {
    const [value, setValue] = useState(property?.getValue())

    useEffect(() => {
        if(!property) return undefined
        let handler = () => setValue(property.getValue())
        handler()

        property.on("change", handler)
        return () => property.off("change", handler)
    }, [property])

    return value
}



interface ParameterInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    prefix?: string
}

const ParameterInput = React.forwardRef<HTMLInputElement, ParameterInputProps>((props, ref) => {
    return (
        <div className="property-input">
            { props.prefix ? <span className="property-input-prefix">{props.prefix}</span> : null }
            <div className="input-wrapper">
                <input ref={ref} {...props}/>
            </div>
        </div>
    )
})

const VectorParameterView: React.FC<{property: VectorProperty}> = (props) => {
    let value = useParameterValue(props.property)

    let refs = useRef<HTMLInputElement[]>([])

    const commitChanges = useCallback(() => {
        props.property.setValue(refs.current.map(input => parseFloat(input.value)))
        resetValues()
    }, [props.property])

    const resetValues = useCallback(() => {
        let value = props.property.getValue()
        for(let i = 0; i < props.property.dim; i++) {
            refs.current[i].value = String(value[i])
        }
    }, [props.property])

    const onKeydown = useCallback((e: React.KeyboardEvent) => {
        if(e.key === "Enter") commitChanges()
        else if(e.key !== "Escape") return
        e.preventDefault()
        let target = e.target as HTMLInputElement
        target.blur()
    }, [props.property])

    useEffect(resetValues, [value])

    let callbacks = useMemo(() => {
        refs.current = Array(props.property.dim).fill(null)
        let result = []
        for(let i = 0; i < props.property.dim; i++) {
            result.push((e: HTMLInputElement) => {
                // When paramerer.dim is decreased, old removed inputs
                // reset the ref to null using old indices, which expands
                // the array
                if(i < refs.current.length) refs.current[i] = e
            })
        }
        return result
    }, [props.property.dim])

    const onFocus = useCallback((e: React.FocusEvent) => {
        let target = e.target as HTMLInputElement
        // setSelectionRange doesn't work on number inputs, this is a workaround
        target.type = "text"
        target.setSelectionRange(0, target.value.length)
        target.type = "number"
    }, [])

    return (
        <>
            <div className="property-header">{props.property.name}</div>
            <div className="property-inputs-container">
                {
                    props.property.value.map((_, i) => {
                        return <ParameterInput
                            key={i}
                            prefix={props.property.prefixes[i]}
                            type="number"
                            ref={callbacks[i]}
                            onFocus={onFocus}
                            onBlur={commitChanges}
                            onKeyDown={onKeydown}/>
                    })
                }
            </div>
        </>
    )
}

interface ComponentPropertyViewProps {
    property: Property
}

export const ComponentPropertyView: React.FC<ComponentPropertyViewProps> = (props) => {

    if(props.property instanceof VectorProperty)
        return <VectorParameterView property={props.property}/>

    return (
        <div>Неизвестный параметр "{props.property?.name}"</div>
    )
}

export const SceneComponentsView: React.FC = (props) => {
    let mapEditor = useMapEditorScene()

    let [inspector, setInspector] = useState<PropertyInspector | null>(null)

    useEffect(() => {
        if(!mapEditor.currentSelectedEntity) return undefined
        let onSet = () => mapEditor.update()

        let inspector = new PropertyInspector(mapEditor.currentSelectedEntity)
        inspector.on("set", onSet)
        setInspector(inspector)

        return () => {
            inspector.off("set", onSet)
            inspector.cleanup()
            setInspector(null)
        }
    }, [mapEditor.currentSelectedEntity])

    if(inspector && inspector.properties.length) return (
        <div className="properties-container">
            {inspector.properties.map((property, index) => {
                return <ComponentPropertyView key={index} property={property}/>   
            })}
        </div>
    )

    return (
        <div className="properties-container">
            <div className="no-properties-text">
                Нет настраиваемых параметров
            </div>
        </div>
    )
}

export const SceneComponentsSection: React.FC = (props) => {
    let mapEditor = useMapEditorScene()

    let entity = mapEditor.currentSelectedEntity
    let treeComponent = entity?.getComponent(EntityEditorTreeNodeComponent)
    let name = treeComponent?.name || "Свойства"

    return (
        <SidebarSection header={name}>
            <SceneComponentsView/>
        </SidebarSection>
    )
}