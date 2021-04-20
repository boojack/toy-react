import { CompositionComponent, DOMComponent, VNodeComponent } from "./element";

// dom render variable cache
let velementCache: VElement | null = null;
let containerNodeCache: Element | null = null;

export function render(velement: VElement, containerNode: Element): void {
  velementCache = velement;
  containerNodeCache = containerNode;

  if (containerNode.firstChild) {
    const firstChild = containerNode.firstChild;
    const preRootComponent = (firstChild as any)._internalInstance as VNodeComponent;

    if (Boolean(preRootComponent)) {
      const preElement = preRootComponent.getVElement();

      if (preElement.type === velement.type) {
        preRootComponent.receive(velement);
        return;
      }

      unmountTree(containerNode);
    }
  }

  // 创建组件实例
  const rootComponent = instantiateComponent(velement);
  const node = rootComponent.mount();

  (node as any)._internalInstance = rootComponent;
  containerNode.appendChild(node);
}

export function rerender(): void {
  if (velementCache && containerNodeCache) {
    render(velementCache, containerNodeCache);
  }
}

export function instantiateComponent(velement: VElement): VNodeComponent {
  if (typeof velement.type === "string") {
    return new DOMComponent(velement as VDOMElement);
  } else {
    return new CompositionComponent(velement as FunctionElement);
  }
}

/**
 * 主要用于调用生命周期函数（但是无类组件时是无用的）
 */
function unmountTree(containerNode: Element) {
  const node = containerNode.firstChild;
  const rootComponent = (node as any)._internalInstance;

  if (rootComponent) {
    rootComponent.unmount();
  }

  containerNode.innerHTML = "";
}
