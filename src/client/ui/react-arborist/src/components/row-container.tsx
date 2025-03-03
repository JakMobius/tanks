import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useDataUpdates, useNodesContext, useTreeApi } from "../context";
import { useDragHook } from "../dnd/drag-hook";
import { useDropHook } from "../dnd/drop-hook";
import { useFreshNode } from "../hooks/use-fresh-node";
import { NodeApi } from "../interfaces/node-api";

interface RowContainerInnerProps<T> {
  node: NodeApi<T>
}

export const RowContainerInner = React.memo(function RowContainerInner<T>(props: RowContainerInnerProps<T>) {
  /* When will the <Row> will re-render.
   *
   * The row component is memo'd so it will only render
   * when a new instance of the NodeApi class is passed
   * to it.
   *
   * The TreeApi instance is stable. It does not
   * change when the internal state changes.
   *
   * The TreeApi has all the references to the nodes.
   * We need to clone the nodes when their state
   * changes. The node class contains no state itself,
   * It always checks the tree for state. The tree's
   * state will always be up to date.
   */

  useDataUpdates(); // Re-render when tree props or visability changes
  const _ = useNodesContext(); // So that we re-render appropriately
  const tree = useTreeApi<T>(); // Tree already has the fresh state

  const el = useRef<HTMLDivElement | null>(null);
  const node = props.node
  const dragRef = useDragHook<T>(node);
  const dropRef = useDropHook(el, node);
  const innerRef = useCallback(
    (n: any) => {
      el.current = n;
      dropRef(n);
    },
    [dropRef]
  );

  const indent = tree.indent * node.level;
  const nodeStyle = useMemo(() => ({ paddingLeft: indent }), [indent]);
  const rowAttrs: React.HTMLAttributes<any> = {
    role: "treeitem",
    "aria-level": node.level + 1,
    "aria-selected": node.isSelected,
    "aria-expanded": node.isOpen,
    tabIndex: -1,
    className: tree.props.rowClassName,
  };

  useEffect(() => {
    if (!node.isEditing && node.isFocused) {
      el.current?.focus({ preventScroll: true });
    }
  }, [node.isEditing, node.isFocused, el.current]);

  const Node = tree.renderNode;
  const Row = tree.renderRow;

  return (
    <Row node={node} innerRef={innerRef} attrs={rowAttrs}>
      <Node node={node} tree={tree} style={nodeStyle} dragHandle={dragRef} />
    </Row>
  );
})

interface RowContainerProps {
  index: number
}

export const RowContainer = React.memo(function RowContainer<T>(props: RowContainerProps) {
  let node = useFreshNode<T>(props.index)
  return <RowContainerInner node={node} />
})