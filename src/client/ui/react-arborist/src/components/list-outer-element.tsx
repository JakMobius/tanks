import { forwardRef } from "react";
import { useTreeApi } from "../context";
import { Cursor } from "./cursor";
import React from "react";

export const ListOuterElement = forwardRef(function Outer(
  props: React.HTMLProps<HTMLDivElement>,
  ref
) {
  const { children, ...rest } = props;
  const tree = useTreeApi();
  return (
    <div
      // @ts-ignore
      ref={ref}
      {...rest}
      onClick={(e) => {
        if (e.currentTarget === e.target) tree.deselectAll();
      }}
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
