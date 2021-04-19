interface IterableObject {
  [key: string]: any;
}

type AttrKey = "id" | "class";
type EventKey = "onClick";

type Props = Partial<{
  [key: string]: string | Function | Object;
  children: VElement[];
}>;

type FunctionComponent = <T>(props?: T) => VElement;

type VElement = string | CompositionElement;
type CompositionElement = VDOMElement | FunctionElement;

interface VDOMElement {
  type: string;
  props: Props;
}

interface FunctionElement {
  type: FunctionComponent;
  props: Props;
}
