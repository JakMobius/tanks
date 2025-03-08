import { ReactElement } from "react";
import { useOuterDrop } from "../dnd/outer-drop-hook";

export function OuterDrop<T>(props: { children: ReactElement }) {
  useOuterDrop<T>();
  return props.children;
}
