interface IterableObject {
  [key: string]: any;
}

type AttrKey = "id" | "class";
type EventKey = "onClick";

type Props = Partial<{
  [key: string]: string | Function | Object;
  nodeValue: string;
  children: VElement[];
}>;

type FunctionComponent = <T>(props?: T) => VElement;

type VElement = VDOMElement | FunctionElement;

interface VDOMElement {
  type: string;
  props: Props;
}

interface FunctionElement {
  type: FunctionComponent;
  props: Props;
}
