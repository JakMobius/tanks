import { ElementType } from "react";
import { TreeApi } from "../interfaces/tree-api";
import { DragPreviewProps } from "./renderers";

export type DragItem<T = any> = {
  id: string
  tree?: TreeApi<T>
  preview?: ElementType<DragPreviewProps<T>>
  userData: any
};
