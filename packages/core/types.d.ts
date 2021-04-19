interface IterableObject {
  [key: string]: any;
}

type AttrProps = Partial<{
  id: string;
  class: string;
}>;

type EventProps = Partial<{
  onClick: Function;
}>;

interface BaseProps extends AttrProps, EventProps {
  children: VElement[];
}

type Props = Partial<BaseProps>;

type FunctionComponent = <T>(props?: T) => VElement;

type VElement = string | VDOMElement | FunctionElement;

interface VDOMElement {
  type: string;
  props: Props;
}

interface FunctionElement {
  type: FunctionComponent;
  props: Props;
}
