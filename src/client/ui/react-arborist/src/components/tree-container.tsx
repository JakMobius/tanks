import React from "react";
import { useTreeApi } from "../context";

export function TreeContainer() {
  const tree = useTreeApi();
  const Container = tree.props.renderContainer;
  return (
    <>
      <Container />
    </>
  );
}
