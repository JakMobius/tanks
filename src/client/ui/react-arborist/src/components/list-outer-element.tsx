import { forwardRef, useCallback } from "react";
import { useTreeApi } from "../context";
import { Cursor } from "./cursor";
import React from "react";

export const ListOuterElement = forwardRef(function Outer(
  props: React.HTMLProps<HTMLDivElement>,
  ref
) {
  const { children, ...rest } = props;
  const tree = useTreeApi();
  const onClick = useCallback((e: React.MouseEvent) => {
    if (e.currentTarget === e.target) tree.deselectAll();
  }, [tree])
  
  return (
    <div
      // @ts-ignore
      ref={ref}
      {...rest}
      onClick={onClick}
    >
      {children}
      <DropContainer />
    </div>
  );
});

const DropContainer = () => {
  return (
    <div
      style={{
        position: "absolute",
        left: "0",
        top: "0",
        right: "0",
      }}
    >
      <Cursor />
    </div>
  );
};
