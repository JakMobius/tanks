import "./tree-view.scss"

import React, { useCallback, useEffect, useMemo, useRef } from "react"
import { CursorProps, DragPreviewProps, NodeRendererProps, RowRendererProps, TreeApi } from "../react-arborist/src"
import { useDataUpdates, useTreeApi } from "../react-arborist/src/context"
import { Virtuoso } from "react-virtuoso"
import { ListOuterElement } from "../react-arborist/src/components/list-outer-element"
import { RowContainer } from "../react-arborist/src/components/row-container"
import RootControlsResponder, { ControlsResponder } from "src/client/controls/root-controls-responder"
import { ControlsProvider, useControls } from "src/client/utils/react-controls-responder"

export interface TreeNodeBase {
    children?: TreeNodeBase[]
    name: string
    id: string
}

export function TreeViewNode<T extends TreeNodeBase>(props: NodeRendererProps<T>) {
    let classNames = ["tree-row"]

    if (props.node.willReceiveDrop && props.tree.canDrop()) classNames.push("will-receive-drop")
    if (props.node.isSelected) classNames.push("selected")
    if (props.node.isSelectedStart) classNames.push("selected-start")
    if (props.node.isSelectedEnd) classNames.push("selected-end")

    const inputRef = React.createRef<HTMLInputElement>()

    let onExpand = useCallback(() => {
        if (props.node.isOpen) {
            props.node.close()
        } else {
            props.node.open()
        }
    }, [props.node])

    useEffect(() => {
        if(props.node.isEditing) {
            if(!props.node.isSelected) {
                props.node.reset()
            } else {
                inputRef.current.focus()
                inputRef.current.value = props.node.data.name
                inputRef.current.setSelectionRange(0, inputRef.current.value.length)
            }
        }
    }, [props.node.isEditing, props.node.isSelected, props.node.data.name])

    const onInputKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault()
            let input = e.target as HTMLInputElement
            props.node.submit(input.value)
        }
        if (e.key === "Escape") {
            e.preventDefault()
            props.node.reset()
        }
    }, [props.node])

    const onInputBlur = useCallback((e: React.FocusEvent) => {
        props.node.reset()
    }, [props.node])

    const onClick = useCallback((e: React.MouseEvent) => {
        if (e.detail === 2 && props.node.isEditable) {
            props.node.edit()
        }
    }, [props.node])

    let expandNodeClassnames = ["expand-arrow"]

    if (props.node.isOpen) expandNodeClassnames.push("open")
    if (!props.node.data.children?.length) expandNodeClassnames.push("hidden")

    return (
        <div
            className={classNames.join(" ")}
            style={props.style}
            ref={props.dragHandle}
            onClick={onClick}
        >
            <div className="background"></div>
            <div className="inner">
                <div className={expandNodeClassnames.join(" ")} onClick={onExpand}></div>
                {props.node.isEditing ?
                    <input 
                        ref={inputRef}
                        onKeyDown={onInputKeyDown}
                        onBlur={onInputBlur}
                    ></input> :
                    <div className="text">{props.node.data.name}</div> }
            </div>
        </div>
    );
}

export function TreeViewDragPreview<T extends TreeNodeBase>(props: DragPreviewProps<T>) {
    let item = props.item

    let isDragging = !!props.mouse
    if (!isDragging) return (
        <div className="drag-container"/>
    )

    let style: React.CSSProperties = {
        transform: "translate(" + props.mouse.x + "px, " + props.mouse.y + "px)"
    }

    let previewText

    if (item.tree.dragNodes.length === 1) {
        previewText = item.tree.dragNodes[0].data.name
    } else {
        previewText = "x" + item.tree.dragNodes.length
    }

    return (
        <div className="drag-container">
            <div className="drag-preview" style={style}>
                <div className="inner">
                    {previewText}
                </div>
            </div>
        </div>
    )
}

export const TreeViewContainer: React.FC = () => {
    useDataUpdates();
    const tree = useTreeApi();
    const controlsResponder = useRef<ControlsResponder | null>(null)

    const onDelete = () => {
        if (!tree.props.onDelete) return;
        const ids = Array.from(tree.selectedIds);
        if (ids.length >= 1) {
            let nextFocus = tree.mostRecentNode;
            while (nextFocus && nextFocus.isSelected) {
                nextFocus = nextFocus.nextSibling;
            }
            if (!nextFocus) nextFocus = tree.lastNode;
            tree.delete(Array.from(ids));
        }
        return;
    }

    const onNavigateDown = (responder: RootControlsResponder) => {
        const keyboard = responder.keyboard

        let maxIndex = tree.selectedNodes[0]?.rowIndex ?? -1
        for(let node of tree.selectedNodes) {
            maxIndex = Math.max(maxIndex, node.rowIndex)
        }

        maxIndex = Math.min(maxIndex + 1, tree.visibleNodes.length - 1)
        let node = maxIndex === -1 ? tree.lastNode : tree.at(maxIndex)

        if (!keyboard.shiftKeyPressed || tree.props.disableMultiSelection) {
            tree.select(node);
        } else {
            tree.selectContiguous(node);
        }
    }

    const onNavigateUp = (responder: RootControlsResponder) => {
        const keyboard = responder.keyboard

        let minIndex = tree.selectedNodes[0]?.rowIndex ?? -1
        for(let node of tree.selectedNodes) {
            minIndex = Math.min(minIndex, node.rowIndex)
        }

        minIndex = Math.max(minIndex - 1, 0)
        let node = minIndex === -1 ? tree.firstNode : tree.at(minIndex)

        if (!keyboard.shiftKeyPressed || tree.props.disableMultiSelection) {
            tree.select(node);
        } else {
            tree.selectContiguous(node);
        }
    }

    const onNavigateRight = () => {
        const node = tree.mostRecentNode;
        if (!node) return;
        tree.open(node.id);
    }

    const onNavigateLeft = () => {
        const node = tree.mostRecentNode;
        if (!node) return;
        tree.close(node.id);
    }

    const onSelectAll = () => {
        if (!tree.props.disableMultiSelection) {
            tree.selectAll();
        }
    }

    const onRename = () => {
        const node = tree.mostRecentNode;
        if (!node) return;
        setTimeout(() => {
            tree.edit(node.id);
        })
    }

    const onToggle = () => {    
        const node = tree.mostRecentNode;
        if (!node) return;
        if (node.isLeaf) {
            node.select();
            node.activate();
        } else {
            node.toggle();
        }
    }

    useEffect(() => {
        controlsResponder.current.on("navigate-down", onNavigateDown)
        controlsResponder.current.on("navigate-up", onNavigateUp)
        controlsResponder.current.on("navigate-right", onNavigateRight)
        controlsResponder.current.on("navigate-left", onNavigateLeft)
        controlsResponder.current.on("editor-select-all", onSelectAll)
        controlsResponder.current.on("editor-rename", onRename)
        controlsResponder.current.on("editor-tree-toggle", onToggle)
        controlsResponder.current.on("editor-delete", onDelete)
    }, [])

    return (
        <ControlsProvider flat ref={controlsResponder}>
            <div
                role="tree"
                style={{
                    height: tree.height,
                    width: tree.width,
                    minHeight: 0,
                    minWidth: 0,
                }}
                onContextMenu={tree.props.onContextMenu}
                onClick={tree.props.onClick}
            >
                <Virtuoso
                    tabIndex={null}
                    className={tree.props.className}
                    scrollerRef={(element) => tree.listEl.current = element as HTMLElement}
                    totalCount={tree.visibleNodes.length}
                    height={tree.height}
                    width={tree.width}
                    fixedItemHeight={tree.rowHeight}
                    overscan={tree.overscanCount}
                    computeItemKey={(index: number) => tree.visibleNodes[index]?.id || index}
                    components={{
                        List: React.forwardRef((props, ref) => (
                            <ListOuterElement ref={ref} {...props} />
                        ))
                    }}
                    rangeChanged={tree.onRangeChanged.bind(tree)}
                    ref={tree.list}
                    itemContent={(index) => {
                        return <RowContainer index={index} />
                    }}
                />
            </div>
        </ControlsProvider>
    );
}

export const TreeViewCursor: React.FC<CursorProps> = (props) => {
    return (
        <div className="tree-view-cursor" style={{
            left: props.left + 15,
            top: props.top - 3
        }}></div>
    )
}

export function TreeViewRow<T extends TreeNodeBase>({
    node,
    attrs,
    innerRef,
    children,
}: RowRendererProps<T>) {
    return (
        <div
            {...attrs}
            style={{ height: 27 }}
            ref={innerRef}
            onFocus={(e) => e.stopPropagation()}
            onClick={node.handleClick}
        >
            {children}
        </div>
    );
}