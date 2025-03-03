import { forwardRef } from "react";
import { TreeProvider } from "./provider";
import { TreeApi } from "../interfaces/tree-api";
import { OuterDrop } from "./outer-drop";
import { TreeContainer } from "./tree-container";
import { TreeProps } from "../types/tree-props";
import React from "react";

function TreeComponent<T>(
  props: TreeProps<T>,
  ref: React.Ref<TreeApi<T> | undefined>
) {
  return (
    <TreeProvider treeProps={props} imperativeHandle={ref}>
      <OuterDrop>
        <TreeContainer />
      </OuterDrop>
    </TreeProvider>
  );
}

export const Tree = forwardRef(TreeComponent) as <T>(
  props: TreeProps<T> & { ref?: React.ForwardedRef<TreeApi<T> | undefined> }
) => ReturnType<typeof TreeComponent>;
