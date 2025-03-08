import { useDrop } from "react-dnd";
import { useDataUpdates, useTreeApi } from "../context";
import { DragItem } from "../types/dnd";
import { computeDrop } from "./compute-drop";
import { DropResult } from "./drop-hook";
import { actions as dnd } from "../state/dnd-slice";
import { ROOT_ID } from "../data/create-root";
import { useEffect } from "react";

export function useOuterDrop<T>() {
  const tree = useTreeApi<T>();
  useDataUpdates()

  // In case we drop an item at the bottom of the list
  const [{ isOver }, drop] = useDrop<DragItem<T>, DropResult | null, { isOver: boolean }>(
    () => ({
      accept: "NODE",
      canDrop: (_item, m) => {
        if (!m.isOver({ shallow: true })) return false;
        return tree.canDrop();
      },
      hover: (_item, m) => {
        if (!m.isOver({ shallow: true })) return;
        const offset = m.getClientOffset();
        if (!tree.listEl.current || !offset) return;
        const { cursor, drop } = computeDrop({
          element: tree.listEl.current,
          offset: offset,
          indent: tree.indent,
          node: null,
          prevNode: tree.visibleNodes[tree.visibleNodes.length - 1],
          nextNode: null,
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
        let { parentId, index } = tree.state.dnd;
        tree.props.onDrop?.({
          item,
          index,
          parentId: parentId === ROOT_ID ? null : parentId,
          parentNode: tree.get(parentId),
        });
        tree.open(parentId);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
      }),
    }),
    [tree, tree.listEl.current]
  );

  useEffect(() => {
    if (!isOver) {
      tree.hideCursor()
      tree.dispatch(dnd.hovering(null, null));
    }
  }, [isOver]);

  drop(tree.listEl);
}
