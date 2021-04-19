import { CompositionComponent, DOMComponent, VNodeComponent } from "./element";

let rootNodeCache: Element | null = null;

function unmountTree(containerNode: Node) {
  // 从 DOM 节点读取内部实例:
  var node = containerNode.firstChild;

  if (!node) {
    return;
  }

  var rootComponent = (node as any)._internalInstance;

  if (!rootComponent) {
    return;
  }

  // 卸载树并清空容器
  rootComponent.unmount();
  (containerNode as HTMLElement).innerHTML = "";
}

export function render(velement: VElement, containerNode: Element) {
  if (containerNode.firstChild) {
    const preChild = containerNode.firstChild;
    const preRootComponent = (preChild as any)._internalInstance as VNodeComponent;
    const preElement = preRootComponent.getVElement();

    if (typeof preElement === "object" && typeof velement === "object") {
      if (preElement.type === velement.type) {
        preRootComponent.receive(velement);
        return;
      }
    } else if (typeof preElement === "string" && typeof velement === "string") {
      preRootComponent.receive(velement);
      return;
    }

    unmountTree(containerNode);
  }

  const rootComponent = instantiateComponent(velement);
  const node = rootComponent.mount();

  containerNode.appendChild(node);
  (node as any)._internalInstance = rootComponent;
  rootNodeCache = containerNode;
}

export function rerender() {
  if (rootNodeCache) {
    const preRootComponent = (rootNodeCache.firstChild as any)._internalInstance;

    if (preRootComponent) {
      render(preRootComponent.getVElement(), rootNodeCache);
    }
  }
}

export function instantiateComponent(velement: VElement): VNodeComponent {
  if (typeof velement === "string") {
    return new DOMComponent(velement);
  } else {
    if (typeof velement.type === "string") {
      return new DOMComponent(velement as VDOMElement);
    } else {
      return new CompositionComponent(velement as FunctionElement);
    }
  }
}
