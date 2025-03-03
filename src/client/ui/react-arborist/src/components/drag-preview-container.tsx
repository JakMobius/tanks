import { useDragLayer } from "react-dnd";
import { useDndContext, useTreeApi } from "../context";
import React from "react";

export function DragPreviewContainer() {
  const tree = useTreeApi();
  const { offset, mouse, item, isDragging } = useDragLayer((m) => {
    return {
      offset: m.getSourceClientOffset(),
      mouse: m.getClientOffset(),
      item: m.getItem(),
      isDragging: m.isDragging(),
    };
  });

  const DragPreview = tree.props.renderDragPreview;
  return (
    <DragPreview
      offset={offset}
      mouse={mouse}
      id={item?.id || null}
      dragIds={item?.dragIds || []}
      isDragging={isDragging}
    />
  );
}
