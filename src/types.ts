export interface IterableObject {
  [key: string]: any;
}

export type AttrKey = "id" | "class";
export type EventKey = "onClick";

export type Props = Partial<{
  [key: string]: string | Function | Object;
  nodeValue: string;
  children: VElement[];
}>;

export type FunctionComponent = <T>(props?: T) => VElement;

export type VElement = VDOMElement | FunctionElement;

export interface VDOMElement {
  type: string;
  props: Props;
}

export interface FunctionElement {
  type: FunctionComponent;
  props: Props;
}
