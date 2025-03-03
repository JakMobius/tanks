import { RefObject, useEffect } from "react";
import { ConnectDropTarget, useDrop } from "react-dnd";
import { useTreeApi } from "../context";
import { NodeApi } from "../interfaces/node-api";
import { DragItem } from "../types/dnd";
import { computeDrop } from "./compute-drop";
import { actions as dnd } from "../state/dnd-slice";
import { ROOT_ID } from "../data/create-root";

export type DropResult = {
  parentId: string | null;
  index: number | null;
};

export function useDropHook(
  el: RefObject<HTMLElement | null>,
  node: NodeApi<any>,
): ConnectDropTarget {
  const tree = useTreeApi();
  const [{ isOver }, dropRef] = useDrop<DragItem, DropResult | null, { isOver: boolean }>(
    () => ({
      accept: "NODE",
      canDrop: () => tree.canDrop(),
      hover: (_item, m) => {
        const offset = m.getClientOffset();
        if (!m.isOver({ shallow: true })) return;
        if (!el.current || !offset) {
          tree.hideCursor()
          return
        }
        const { cursor, drop } = computeDrop({
          element: el.current,
          offset: offset,
          indent: tree.indent,
          node: node,
          prevNode: node.prev,
          nextNode: node.next,
        });
        if (drop) tree.dispatch(dnd.hovering(drop.parentId, drop.index));

        if (m.canDrop()) {
          if (cursor) tree.showCursor(cursor);
        } else {
          tree.hideCursor();
        }
      },
      drop: (item, m) => {
        if (!m.canDrop()) return null;
        let { parentId, index, dragIds } = tree.state.dnd;
        tree.props.onDrop?.({
          item,
          index: index === null ? 0 : index,
          parentId: parentId === ROOT_ID ? null : parentId,
          parentNode: tree.get(parentId),
        })
        tree.open(parentId);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
      }),
    }),
    [node, el.current, tree.props],
  );

  useEffect(() => {
    if (!isOver) {
      tree.hideCursor()
      tree.dispatch(dnd.hovering(null, null));
    }
  }, [isOver]);

  return dropRef;
}
