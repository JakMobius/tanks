import "./tree-view.scss"

import React, { useCallback } from "react"
import { CursorProps, DragPreviewProps, NodeRendererProps, RowRendererProps, TreeApi } from "../react-arborist/src"
import { useDataUpdates, useTreeApi } from "../react-arborist/src/context"
import { focusNextElement, focusPrevElement } from "../react-arborist/src/utils"
import { Virtuoso } from "react-virtuoso"
import { ListOuterElement } from "../react-arborist/src/components/list-outer-element"
import { RowContainer } from "../react-arborist/src/components/row-container"

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

    let onExpand = useCallback(() => {
        if (props.node.isOpen) {
            props.node.close()
        } else {
            props.node.open()
        }
    }, [props.node])

    let expandNodeClassnames = ["expand-arrow"]

    if (props.node.isOpen) expandNodeClassnames.push("open")
    if (!props.node.data.children?.length) expandNodeClassnames.push("hidden")

    return (
        <div className={classNames.join(" ")} style={props.style} ref={props.dragHandle}>
            <div className="inner">
                <div className={expandNodeClassnames.join(" ")} onClick={onExpand}></div>
                {props.node.data.name}
            </div>
        </div>
    );
}

export function SceneTreeViewDragPreview<T extends TreeNodeBase>(props: DragPreviewProps & { tree: TreeApi<T> }) {

    let isDragging = props.mouse && props.isDragging
    if (!isDragging) return <></>

    let style: React.CSSProperties = {
        transform: "translate(" + props.mouse.x + "px, " + props.mouse.y + "px)"
    }

    let previewText

    if (props.tree.dragNodes.length === 1) {
        previewText = props.tree.dragNodes[0].data.name
    } else {
        previewText = "x" + props.tree.dragNodes.length
    }

    return (
        <div className="tree-drag-container">
            <div className="tree-preview" style={style}>
                <div className="inner">
                    {previewText}
                </div>
            </div>
        </div>
    )
}

export function TreeViewContainer() {
    useDataUpdates();
    const tree = useTreeApi();

    return (
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
            tabIndex={0}
            onFocus={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                    tree.onFocus();
                }
            }}
            onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                    tree.onBlur();
                }
            }}
            onKeyDown={(e) => {
                if (tree.isEditing) {
                    return;
                }
                if (e.key === "Backspace") {
                    if (!tree.props.onDelete) return;
                    const ids = Array.from(tree.selectedIds);
                    if (ids.length > 1) {
                        let nextFocus = tree.mostRecentNode;
                        while (nextFocus && nextFocus.isSelected) {
                            nextFocus = nextFocus.nextSibling;
                        }
                        if (!nextFocus) nextFocus = tree.lastNode;
                        tree.focus(nextFocus, { scroll: false });
                        tree.delete(Array.from(ids));
                    } else {
                        const node = tree.focusedNode;
                        if (node) {
                            const sib = node.nextSibling;
                            const parent = node.parent;
                            tree.focus(sib || parent, { scroll: false });
                            tree.delete(node);
                        }
                    }
                    return;
                }
                if (e.key === "Tab" && !e.shiftKey) {
                    e.preventDefault();
                    focusNextElement(e.currentTarget);
                    return;
                }
                if (e.key === "Tab" && e.shiftKey) {
                    e.preventDefault();
                    focusPrevElement(e.currentTarget);
                    return;
                }
                if (e.key === "ArrowDown") {
                    e.preventDefault();
                    const next = tree.nextNode;
                    if (e.metaKey) {
                        tree.select(tree.focusedNode);
                        tree.activate(tree.focusedNode);
                        return;
                    } else if (!e.shiftKey || tree.props.disableMultiSelection) {
                        tree.focus(next);
                        return;
                    } else {
                        if (!next) return;
                        const current = tree.focusedNode;
                        if (!current) {
                            tree.focus(tree.firstNode);
                        } else if (current.isSelected) {
                            tree.selectContiguous(next);
                        } else {
                            tree.selectMulti(next);
                        }
                        return;
                    }
                }
                if (e.key === "ArrowUp") {
                    e.preventDefault();
                    const prev = tree.prevNode;
                    if (!e.shiftKey || tree.props.disableMultiSelection) {
                        tree.focus(prev);
                        return;
                    } else {
                        if (!prev) return;
                        const current = tree.focusedNode;
                        if (!current) {
                            tree.focus(tree.lastNode); // ?
                        } else if (current.isSelected) {
                            tree.selectContiguous(prev);
                        } else {
                            tree.selectMulti(prev);
                        }
                        return;
                    }
                }
                if (e.key === "ArrowRight") {
                    const node = tree.focusedNode;
                    if (!node) return;
                    if (node.isInternal && node.isOpen) {
                        tree.focus(tree.nextNode);
                    } else if (node.isInternal) tree.open(node.id);
                    return;
                }
                if (e.key === "ArrowLeft") {
                    const node = tree.focusedNode;
                    if (!node || node.isRoot) return;
                    if (node.isInternal && node.isOpen) tree.close(node.id);
                    else if (!node.parent?.isRoot) {
                        tree.focus(node.parent);
                    }
                    return;
                }
                if (e.key === "a" && e.metaKey && !tree.props.disableMultiSelection) {
                    e.preventDefault();
                    tree.selectAll();
                    return;
                }
                if (e.key === "a" && !e.metaKey && tree.props.onCreate) {
                    tree.createLeaf();
                    return;
                }
                if (e.key === "A" && !e.metaKey) {
                    if (!tree.props.onCreate) return;
                    tree.createInternal();
                    return;
                }

                if (e.key === "Home") {
                    // add shift keys
                    e.preventDefault();
                    tree.focus(tree.firstNode);
                    return;
                }
                if (e.key === "End") {
                    // add shift keys
                    e.preventDefault();
                    tree.focus(tree.lastNode);
                    return;
                }
                if (e.key === "Enter") {
                    const node = tree.focusedNode;
                    if (!node) return;
                    if (!node.isEditable || !tree.props.onRename) return;
                    setTimeout(() => {
                        if (node) tree.edit(node);
                    });
                    return;
                }
                if (e.key === " ") {
                    e.preventDefault();
                    const node = tree.focusedNode;
                    if (!node) return;
                    if (node.isLeaf) {
                        node.select();
                        node.activate();
                    } else {
                        node.toggle();
                    }
                    return;
                }
                if (e.key === "*") {
                    const node = tree.focusedNode;
                    if (!node) return;
                    tree.openSiblings(node);
                    return;
                }
                if (e.key === "PageUp") {
                    e.preventDefault();
                    tree.pageUp();
                    return;
                }
                if (e.key === "PageDown") {
                    e.preventDefault();
                    tree.pageDown();
                }
            }}
        >
            <Virtuoso
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