import { FunctionComponent, Props, VDOMElement, VElement } from "./types";

/**
 * create virtual element
 * @param type string / function / "textNode"
 * @param props node attr / event / nodeValue / children
 * @returns VElement
 */
export function createElement(type: string | FunctionComponent, props: Props): VElement {
  return {
    type,
    props,
  } as VElement;
}

/**
 * create text node virtual element
 * @param content text content
 * @returns VElement
 */
export function textNode(content: string): VDOMElement {
  return {
    type: "textNode",
    props: {
      nodeValue: content,
    },
  };
}
