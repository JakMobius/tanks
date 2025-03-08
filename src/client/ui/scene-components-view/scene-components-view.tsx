import "./scene-components-view.scss"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMapEditorScene } from "src/client/map-editor/map-editor-scene";
import { EntityProperty, Property, PropertyInspector, SelectProperty, VectorProperty } from "src/entity/components/inspector/property-inspector";
import { SidebarSection } from "../sidebar-section/sidebar-section";
import { EntityEditorTreeNodeComponent } from "../scene-tree-view/components";
import { useDrop } from "react-dnd";
import { SceneTreeViewDropItem } from "../scene-tree-view/scene-tree-view";
import { DragItem } from "../react-arborist/src/types/dnd";

function useParameterValue<T>(property: Property<T>): T {
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

interface ParameterSelectProps extends React.InputHTMLAttributes<HTMLSelectElement> {
    prefix?: string
}

const ParameterSelect = React.forwardRef<HTMLSelectElement, ParameterSelectProps>((props, ref) => {
    return (
        <div className="property-input">
            { props.prefix ? <span className="property-input-prefix">{props.prefix}</span> : null }
            <div className="input-wrapper">
                <select ref={ref} {...props}/>
            </div>
        </div>
    )
})

const VectorPropertyView: React.FC<{property: VectorProperty}> = (props) => {
    let value = useParameterValue(props.property)

    let refs = useRef<HTMLInputElement[]>([])

    const commitChanges = useCallback(() => {
        props.property.setValue(refs.current.map(input => parseFloat(input.value)))
        resetValues()
    }, [props.property])

    const resetValues = useCallback(() => {
        let value = props.property.getValue()
        for(let i = 0; i < props.property.dim; i++) {
            refs.current[i].value = value[i].toLocaleString("en-US", { maximumFractionDigits: 3 })
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

    return (<>
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
    </>)
}

const SelectPropertyView: React.FC<{property: SelectProperty}> = (props) => {
    let value = useParameterValue(props.property)
    let ref = useRef<HTMLSelectElement>(null)

    const commitChanges = useCallback(() => {
        props.property.setValue(ref.current.value)
        resetValues()
    }, [props.property])

    const resetValues = useCallback(() => {
        let value = props.property.getValue()
        ref.current.value = value
    }, [props.property])

    useEffect(resetValues, [value])

    return (<>
        <div className="property-header">{props.property.name}</div>
        <div className="property-inputs-container">
            <ParameterSelect ref={ref} onChange={commitChanges}>
                {props.property.options.map((option, id) => {
                    return <option key={id} value={option.id}>{option.name}</option>
                })}
            </ParameterSelect>
        </div>
    </>)
}

const EntityPropertyView: React.FC<{property: EntityProperty}> = (props) => {
    let value = useParameterValue(props.property)
    let divRef = useRef<HTMLDivElement>(null)

    const getName = () => {
        let entity = props.property.getValue()
        if(!value) return "Не выбрано"
        let treeComponent = entity?.getComponent(EntityEditorTreeNodeComponent)
        return treeComponent?.name || "Сущность"
    }

    let [name, setState] = useState(getName())

    const [{ isOver }, drop] = useDrop<DragItem, unknown, { isOver: boolean }>(() => ({
        accept: "NODE",
        drop(item, monitor) {
            if(item?.userData instanceof SceneTreeViewDropItem) {
                if(item.userData.entities.length === 0) return
                props.property.setValue(item.userData.entities[0])
            }
        },
        collect: monitor => ({
            isOver: monitor.isOver({ shallow: true }),
        })
    }), [])

    useEffect(() => { drop(divRef.current) }, [divRef])
    useEffect(() => {
        let entity = props.property.getValue()
        let handler = () => setState(getName())
        handler()
        if(!entity) return undefined
        entity.on("name-set", handler)
        return () => entity.off("name-set", handler)
    }, [value])

    const remove = useCallback(() => {
        props.property.setValue(null)
    }, [])

    return (<>
        <div className="property-header">{props.property.name}</div>
        <div className="property-inputs-container" ref={divRef}>
            <div className={"property-entity " + (isOver ? "over" : "")}>
                <span>{name}</span>
                <div className="remove-button" onClick={remove}></div>
            </div>
        </div>
    </>)
}

interface ComponentPropertyViewProps {
    property: Property
}

export const ComponentPropertyView: React.FC<ComponentPropertyViewProps> = (props) => {
    if(props.property.hidden)
        return <></>

    if(props.property instanceof VectorProperty)
        return <VectorPropertyView property={props.property}/>

    if(props.property instanceof SelectProperty)
        return <SelectPropertyView property={props.property}/>

    if(props.property instanceof EntityProperty)
        return <EntityPropertyView property={props.property}/>

    return (
        <div>Неизвестный параметр "{props.property?.name}"</div>
    )
}

export const SceneComponentsView: React.FC = (props) => {
    let mapEditor = useMapEditorScene()

    let [_, rerender] = useState({})
    let [inspector, setInspector] = useState<PropertyInspector | null>(null)

    useEffect(() => {
        if(!mapEditor.currentSelectedEntity) return undefined
        let onSet = () => mapEditor.update()
        let onRefresh = () => rerender({})

        let inspector = new PropertyInspector(mapEditor.currentSelectedEntity)
        inspector.on("set", onSet)
        inspector.on("refresh", onRefresh)
        setInspector(inspector)

        return () => {
            inspector.off("set", onSet)
            inspector.on("refresh", onRefresh)
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

    const getName = () => {
        let entity = mapEditor.currentSelectedEntity
        let treeComponent = entity?.getComponent(EntityEditorTreeNodeComponent)
        return treeComponent?.name || "Свойства"
    }

    let [name, setName] = useState(useMemo(() => getName(), []))

    useEffect(() => {
        let entity = mapEditor.currentSelectedEntity
        if(!entity) return undefined
        setName(getName())
        let handler = () => setName(getName())
        entity.on("name-set", handler)
        return () => entity.off("name-set", handler)
    }, [mapEditor.currentSelectedEntity])

    return (
        <SidebarSection header={name}>
            <SceneComponentsView/>
        </SidebarSection>
    )
}