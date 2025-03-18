import { forwardRef } from "react";
import { Cursor } from "./cursor";
import React from "react";

export const ListOuterElement = forwardRef<HTMLDivElement>(function Outer(
  props: React.HTMLProps<HTMLDivElement>,
  ref
) {
  const { children, ...rest } = props;

  return (
    <div ref={ref} {...rest}>
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
