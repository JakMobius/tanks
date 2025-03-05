import "./scene-components-view.scss"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMapEditorScene } from "src/client/map-editor/map-editor-scene";
import { Parameter, ParameterInspector, VectorParameter } from "src/entity/components/inspector/entity-inspector";
import { SidebarSection } from "../sidebar-section/sidebar-section";
import { EntityEditorTreeNodeComponent } from "../scene-tree-view/components";

const useParameterValue = (parameter: Parameter) => {
    const [value, setValue] = useState(parameter?.getValue())

    useEffect(() => {
        if(!parameter) return undefined
        let handler = () => setValue(parameter.getValue())
        handler()

        parameter.on("change", handler)
        return () => parameter.off("change", handler)
    }, [parameter])

    return value
}



interface ParameterInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    prefix?: string
}

const ParameterInput = React.forwardRef<HTMLInputElement, ParameterInputProps>((props, ref) => {
    return (
        <div className="parameter-input">
            { props.prefix ? <span className="parameter-input-prefix">{props.prefix}</span> : null }
            <div className="input-wrapper">
                <input ref={ref} {...props}/>
            </div>
        </div>
    )
})

const VectorParameterView: React.FC<{parameter: VectorParameter}> = (props) => {
    let value = useParameterValue(props.parameter)

    let refs = useRef<HTMLInputElement[]>([])

    const commitChanges = useCallback(() => {
        props.parameter.setValue(refs.current.map(input => parseFloat(input.value)))
        resetValues()
    }, [props.parameter])

    const resetValues = useCallback(() => {
        let value = props.parameter.getValue()
        for(let i = 0; i < props.parameter.dim; i++) {
            refs.current[i].value = String(value[i])
        }
    }, [props.parameter])

    const onKeydown = useCallback((e: React.KeyboardEvent) => {
        if(e.key === "Enter") commitChanges()
        else if(e.key !== "Escape") return
        e.preventDefault()
        let target = e.target as HTMLInputElement
        target.blur()
    }, [props.parameter])

    useEffect(resetValues, [value])

    let callbacks = useMemo(() => {
        let result = []
        for(let i = 0; i < props.parameter.dim; i++) {
            result.push((e: HTMLInputElement) => { refs.current[i] = e })
        }
        return result
    }, [props.parameter.dim])

    const onFocus = useCallback((e: React.FocusEvent) => {
        let target = e.target as HTMLInputElement
        // setSelectionRange doesn't work on number inputs, this is a workaround
        target.type = "text"
        target.setSelectionRange(0, target.value.length)
        target.type = "number"
    }, [])

    return (
        <>
            <div className="parameter-header">{props.parameter.name}</div>
            <div className="parameter-inputs-container">
                {
                    props.parameter.value.map((_, i) => {
                        return <ParameterInput
                            key={i}
                            prefix={props.parameter.prefixes[i]}
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

interface ComponentParameterViewProps {
    parameter: Parameter
}

export const ComponentParameterView: React.FC<ComponentParameterViewProps> = (props) => {

    if(props.parameter instanceof VectorParameter)
        return <VectorParameterView parameter={props.parameter}/>

    return (
        <div>Неизвестный параметр "{props.parameter?.name}"</div>
    )
}

export const SceneComponentsView: React.FC = (props) => {
    let mapEditor = useMapEditorScene()

    let [inspector, setInspector] = useState<ParameterInspector | null>(null)

    useEffect(() => {
        if(!mapEditor.currentSelectedEntity) return undefined
        let onSet = () => mapEditor.update()

        let inspector = new ParameterInspector(mapEditor.currentSelectedEntity)
        inspector.on("set", onSet)
        mapEditor.currentSelectedEntity.emit("inspector-added", inspector)
        setInspector(inspector)

        return () => {
            inspector.off("set", onSet)
            inspector.cleanup()
            setInspector(null)
        }
    }, [mapEditor.currentSelectedEntity])

    if(inspector && inspector.parameters.length) return (
        <div className="parameters-container">
            {inspector.parameters.map((parameter, index) => {
                return <ComponentParameterView key={index} parameter={parameter}/>   
            })}
        </div>
    )

    return (
        <div className="parameters-container">
            <div className="parameter-header">
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