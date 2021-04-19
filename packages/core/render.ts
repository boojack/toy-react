import { CompositionComponent, DOMComponent, VNodeComponent } from "./element";

let velementCache: VElement | null = null;
let containerNodeCache: Element | null = null;

function unmountTree(containerNode: Element) {
  const node = containerNode.firstChild;
  const rootComponent = (node as any)._internalInstance;

  if (rootComponent) {
    rootComponent.unmount();
  }

  containerNode.innerHTML = "";
}

export function render(velement: VElement, containerNode: Element) {
  velementCache = velement;
  containerNodeCache = containerNode;

  if (containerNode.firstChild) {
    const firstChild = containerNode.firstChild;
    const preRootComponent = (firstChild as any)._internalInstance as VNodeComponent;
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
}

export function rerender() {
  if (velementCache && containerNodeCache) {
    render(velementCache, containerNodeCache);
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
