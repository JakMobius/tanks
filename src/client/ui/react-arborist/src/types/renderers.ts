import { CSSProperties, HTMLAttributes, ReactElement } from "react";
import { IdObj } from "./utils";
import { NodeApi } from "../interfaces/node-api";
import { TreeApi } from "../interfaces/tree-api";
import { XYCoord } from "react-dnd";

export type NodeRendererProps<T> = {
  style: CSSProperties;
  node: NodeApi<T>;
  tree: TreeApi<T>;
  dragHandle?: (el: HTMLDivElement | null) => void;
  preview?: boolean;
};

export type RowRendererProps<T> = {
  node: NodeApi<T>;
  innerRef: (el: HTMLDivElement | null) => void;
  attrs: HTMLAttributes<any>;
  children: ReactElement;
};

export type DragPreviewProps<T> = {
  offset: XYCoord | null;
  mouse: XYCoord | null;
  item: {
    id: string,
    item: T,
    tree: TreeApi<T>
  }
};

export type CursorProps = {
  top: number;
  left: number;
  indent: number;
};
