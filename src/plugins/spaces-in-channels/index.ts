import { ReactNative } from "src/metro/common/libraries/index.ts";
import { after } from "src/patcher/index.ts";
import { definePlugin } from "#plugin-context";
import { Devs } from "@data/constants";

const { View } = ReactNative;

const traverseAndModify = (node: any): any => {
  if (typeof node === "string") {
    return node.replace(/-/g, " ");
  }

  if (Array.isArray(node)) {
    return node.map(traverseAndModify);
  }

  if (node && typeof node === "object" && node.props && node.props.children) {
    return { ...node, props: { ...node.props, children: traverseAndModify(node.props.children) } };
  }
  return node;
};

let unpatchRender: () => void;

export default definePlugin({
  name: "Channel Spaces",
  description: "Turns dashes in text channels into spaces.",
  authors: [Devs.Blaze],

  start() {
    unpatchRender = after(View, "render", (_, res) => {
      return traverseAndModify(res);
    });
  },

  cleanup() {
    unpatchRender?.();
  }
});


