import { instantiateComponent } from "./render";

export function createElement(type: string | FunctionComponent, props: Props): VElement {
  return {
    type,
    props,
  };
}

export abstract class VNodeComponent {
  abstract mount(): Node;
  abstract getVElement(): VElement;
}

export class DOMComponent extends VNodeComponent {
  private currentElement: string | VDOMElement;
  private renderedComponents: VNodeComponent[];
  private node: Node | null;

  constructor(element: string | VDOMElement) {
    super();

    this.currentElement = element;
    this.renderedComponents = [];
    this.node = null;
  }

  public mount(): Node {
    if (typeof this.currentElement === "string") {
      const textNode = document.createTextNode(this.currentElement);
      this.node = textNode;
      return textNode;
    }

    const { type, props } = this.currentElement;
    const node = document.createElement(type);

    for (const key of Object.keys(props)) {
      if (key === "children") {
        // continue
      } else if (key === "onClick") {
        node.addEventListener("click", (props as any)[key]);
      } else {
        node.setAttribute(key, (props as any)[key] as string);
      }
    }

    let children = props.children;
    if (!Array.isArray(children)) {
      children = [];
    }

    const renderedComponents = children.map((child) => {
      return instantiateComponent(child);
    });

    this.renderedComponents = renderedComponents;

    renderedComponents.forEach((child) => {
      const childNode = child.mount();
      node.appendChild(childNode);
    });

    this.node = node;

    return node;
  }

  public getVElement(): VElement {
    return this.currentElement;
  }
}

export class CompositionComponent extends VNodeComponent {
  private currentElement: FunctionElement;
  private renderedComponent: VNodeComponent | null;

  constructor(element: FunctionElement) {
    super();

    this.currentElement = element;
    this.renderedComponent = null;
  }

  public mount(): Node {
    const { type, props } = this.currentElement;

    const velement = type(props);

    const renderedComponent = instantiateComponent(velement);
    this.renderedComponent = renderedComponent;

    return renderedComponent.mount();
  }

  public getVElement(): VElement {
    return this.currentElement;
  }
}
