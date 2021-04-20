/**
 * stack reconciler implementation
 */
import { AttrKey, EventKey, FunctionElement, IterableObject, VDOMElement, VElement } from "./types";
import { diffVElementProps } from "./diff";
import { instantiateComponent } from "./render";
import { utils } from "./utils";

/**
 * 定义实例组件的公共方法
 */
export interface VNodeComponent {
  mount(): Node;
  unmount(): void;
  receive(nextElement: VElement): void;
  getVElement(): VElement;
  getHostNode(): Node;
}

export class DOMComponent implements VNodeComponent {
  private currentElement: VDOMElement;
  private renderedComponents: VNodeComponent[];
  private node: Node | null;

  constructor(element: VDOMElement) {
    this.currentElement = element;
    this.renderedComponents = [];
    this.node = null;
  }

  public mount(): Node {
    const { type, props } = this.currentElement;

    // 处理特殊情形：textNode
    if (type === "textNode") {
      const textNode = document.createTextNode(props.nodeValue ?? "");
      this.node = textNode;
      return textNode;
    }

    const node = document.createElement(type);
    const iterProps = props as IterableObject;

    // 设置元素属性以及增加事件监听器
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
    const renderedComponents = children.map((childElement) => instantiateComponent(childElement));

    this.renderedComponents = renderedComponents;

    renderedComponents.forEach((child) => {
      const childNode = child.mount();
      node.appendChild(childNode);
    });

    this.node = node;

    return node;
  }

  // 主要是为了调用类组件里的生命周期函数，因此实际无任何作用
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
      node.parentNode.replaceChild(nextNode, node);
      return;
    }

    // 当都为 textNode 时，只用改变 textContent 即可达到组件重用
    if (prevType === "textNode" && nextType === "textNode") {
      if (prevProps.nodeValue !== nextProps.nodeValue) {
        node.textContent = nextProps.nodeValue ?? "";
      }
      return;
    }

    const diffedProps = diffVElementProps(prevProps, nextProps);

    Object.keys(diffedProps).forEach((propName) => {
      const value = diffedProps[propName];

      if (value === null) {
        if (utils.isFunction(prevProps[propName])) {
          const eventName = utils.parseEventName(propName);
          node.removeEventListener(eventName, prevProps[propName]);
        } else {
          node.removeAttribute(propName);
        }
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

    const prevChildren: VElement[] = prevProps.children ?? [];
    const nextChildren: VElement[] = nextProps.children ?? [];

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

      if (prevChildren[i].type !== nextChildren[i].type) {
        const prevNode = prevComponent.getHostNode();
        prevComponent.unmount();

        const nextChild = instantiateComponent(nextChildren[i]);
        const nextNode = nextChild.mount();

        operationQueue.push({ type: "REPLACE", prevNode, nextNode });
        nextRenderedComponents.push(nextChild);
        continue;
      }

      // 重用组件
      prevComponent.receive(nextChildren[i]);
      nextRenderedComponents.push(prevComponent);
    }

    for (let j = nextChildren.length; j < prevChildren.length; ++j) {
      const prevChild = prevRenderedComponents[j];
      const node = prevChild.getHostNode();

      prevChild.unmount();
      operationQueue.push({ type: "REMOVE", node });
    }

    this.renderedComponents = nextRenderedComponents;

    for (const operation of operationQueue) {
      switch (operation.type) {
        case "ADD":
          node.appendChild(operation.node);
          break;
        case "REPLACE":
          node.replaceChild(operation.nextNode, operation.prevNode);
          break;
        case "REMOVE":
          node.removeChild(operation.node);
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

// 拥抱 函数组件 + 组合。因此组合组件仅为函数组件，不支持类组件
export class CompositionComponent implements VNodeComponent {
  private currentElement: FunctionElement;
  private renderedComponent: VNodeComponent | null;

  constructor(element: FunctionElement) {
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
    prevNode.parentNode.replaceChild(nextNode, prevNode);
  }

  public getVElement(): VElement {
    return this.currentElement;
  }

  public getRenderedComponent() {
    return this.renderedComponent;
  }

  public getHostNode(): Node {
    return this.renderedComponent.getHostNode() as Node;
  }
}
