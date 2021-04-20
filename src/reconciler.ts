/**
 * stack reconciler implementation
 */
import { AttrKey, EventKey, FunctionElement, IterableObject, VDOMElement, VElement } from "./types";
import { diffVElementProps } from "./diff";
import { instantiateComponent } from "./render";
import { utils } from "./utils";

export abstract class VNodeComponent {
  abstract mount(): Node;
  abstract unmount(): void;
  abstract receive(nextElement: VElement): void;

  abstract getVElement(): VElement;
  abstract getHostNode(): Node;
}

export class DOMComponent extends VNodeComponent {
  private currentElement: VDOMElement;
  private renderedComponents: VNodeComponent[];
  private node: Node | null;

  constructor(element: VDOMElement) {
    super();

    this.currentElement = element;
    this.renderedComponents = [];
    this.node = null;
  }

  public mount(): Node {
    const { type, props } = this.currentElement;

    if (type === "textNode") {
      const textNode = document.createTextNode(props.nodeValue ?? "");
      this.node = textNode;
      return textNode;
    }

    const node = document.createElement(type);
    const iterProps = props as IterableObject;

    for (const propName of Object.keys(iterProps)) {
      if (propName === "children") {
        continue;
      }

      if (typeof iterProps[propName] === "function") {
        const eventName = utils.parseEventName(propName);
        node.addEventListener(eventName as EventKey, iterProps[propName]);
      } else if (typeof iterProps[propName] === "string") {
        node.setAttribute(propName as AttrKey, iterProps[propName]);
      }
    }

    const children = props.children || [];
    const renderedComponents = children.map((child) => instantiateComponent(child));

    this.renderedComponents = renderedComponents;

    renderedComponents.forEach((child) => {
      const childNode = child.mount();
      node.appendChild(childNode);
    });

    this.node = node;

    return node;
  }

  // 主要是为了回调生命周期函数
  public unmount() {
    for (const comp of this.renderedComponents) {
      comp.unmount();
    }
  }

  public receive(nextElement: VDOMElement) {
    const node = this.node as Element;
    const prevElement = this.currentElement;
    this.currentElement = nextElement;

    const prevType = prevElement.type;
    const nextType = nextElement.type;
    const prevProps = prevElement.props as IterableObject;
    const nextProps = nextElement.props as IterableObject;

    if (prevType !== nextType) {
      const nextRenderedComponent = instantiateComponent(nextElement);
      const nextNode = nextRenderedComponent.mount();
      this.node = nextNode;
      node.parentNode!.replaceChild(nextNode, node);
      return;
    }

    if (prevType === "textNode" && nextType === "textNode") {
      if (prevProps.nodeValue !== nextProps.nodeValue) {
        node.textContent = nextProps.nodeValue ?? "";
      }
      return;
    }

    const props = diffVElementProps(prevProps, nextProps);

    Object.keys(props).forEach((propName) => {
      const value = props[propName];

      if (value === null) {
        node.removeAttribute(propName);
      } else if (utils.isFunction(value)) {
        const eventName = utils.parseEventName(propName);

        if (utils.isFunction(prevProps[propName])) {
          node.removeEventListener(eventName, prevProps[propName]);
        }
        node.addEventListener(eventName, nextProps[propName]);
      } else {
        node.setAttribute(propName, value);
      }
    });

    const prevChildren = prevProps.children ?? [];
    const nextChildren = nextProps.children ?? [];

    const prevRenderedComponents = this.renderedComponents;
    const nextRenderedComponents = [];

    const operationQueue = [];

    for (let i = 0; i < nextChildren.length; ++i) {
      const prevComponent = prevRenderedComponents[i];

      if (!prevComponent) {
        const nextComponent = instantiateComponent(nextChildren[i]);
        const node = nextComponent.mount();

        operationQueue.push({ type: "ADD", node });
        nextRenderedComponents.push(nextComponent);
        continue;
      }

      if (typeof prevChildren[i] !== typeof nextChildren[i]) {
        const prevNode = prevComponent.getHostNode();
        prevComponent.unmount();

        const nextChild = instantiateComponent(nextChildren[i]);
        const nextNode = nextChild.mount();

        // 记录需要替换的节点
        operationQueue.push({ type: "REPLACE", prevNode, nextNode });
        nextRenderedComponents.push(nextChild);
        continue;
      } else if (typeof prevChildren[i] === "object" && typeof nextChildren[i] === "object") {
        if ((prevChildren[i] as VElement).type !== (nextChildren[i] as VElement).type) {
          const prevNode = prevComponent.getHostNode();
          prevComponent.unmount();

          const nextChild = instantiateComponent(nextChildren[i]);
          const nextNode = nextChild.mount();

          // 记录需要替换的节点
          operationQueue.push({ type: "REPLACE", prevNode, nextNode });
          nextRenderedComponents.push(nextChild);
          continue;
        }
      } else if (typeof prevChildren[i] === "string" && typeof nextChildren[i] === "string") {
        // do nth
      }

      prevComponent.receive(nextChildren[i]);
      nextRenderedComponents.push(prevComponent);
    }

    for (let j = nextChildren.length; j < prevChildren.length; j++) {
      const prevChild = prevRenderedComponents[j];
      const node = prevChild.getHostNode();
      prevChild.unmount();

      // 记录需要删除的节点
      operationQueue.push({ type: "REMOVE", node });
    }

    this.renderedComponents = nextRenderedComponents;

    for (const operation of operationQueue) {
      switch (operation.type) {
        case "ADD":
          node.appendChild(operation.node!);
          break;
        case "REPLACE":
          node.replaceChild(operation.nextNode!, operation.prevNode!);
          break;
        case "REMOVE":
          node.removeChild(operation.node!);
          break;
      }
    }
  }

  public getVElement(): VElement {
    return this.currentElement;
  }

  public getRenderedComponents() {
    return this.renderedComponents;
  }

  public getHostNode(): Node {
    return this.node as Node;
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

  public unmount() {
    const renderedComponent = this.renderedComponent;
    if (renderedComponent) {
      renderedComponent.unmount();
    }
  }

  public receive(nextElement: FunctionElement) {
    const prevRenderedComponent = this.renderedComponent as VNodeComponent;
    const prevRenderedElement = prevRenderedComponent.getVElement();
    this.currentElement = nextElement;

    const { type, props: nextProps } = nextElement;
    const nextRenderedElement = type(nextProps);

    // 尝试复用
    if (prevRenderedElement.type === nextRenderedElement.type) {
      prevRenderedComponent.receive(nextRenderedElement);
      return;
    }

    // 卸载旧节点，并挂载新节点
    const prevNode = prevRenderedComponent.getHostNode();
    prevRenderedComponent.unmount();
    const nextRenderedComponent = instantiateComponent(nextRenderedElement);
    const nextNode = nextRenderedComponent.mount();

    this.renderedComponent = nextRenderedComponent;
    prevNode?.parentNode?.replaceChild(nextNode, prevNode);
  }

  public getVElement(): VElement {
    return this.currentElement;
  }

  public getRenderedComponent() {
    return this.renderedComponent;
  }

  public getHostNode(): Node {
    return this.renderedComponent?.getHostNode() as Node;
  }
}
