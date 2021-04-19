interface IterableObject {
  [key: string]: any;
}

type AttrKey = "id" | "class";

type AttrProps = Partial<
  {
    [key in AttrKey]: string;
  }
>;

type EventKey = "onClick";

type EventProps = Partial<
  {
    [key in EventKey]: Function;
  }
>;

interface BaseProps extends AttrProps, EventProps {
  children: VElement[];
}

type Props = Partial<BaseProps>;

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
