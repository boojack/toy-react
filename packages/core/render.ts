import { CompositionComponent, DOMComponent, VNodeComponent } from "./element";

let rootNodeCache: Node | null = null;

export function render(velement: VElement, rootNode: Node) {
  while (rootNode.firstChild) {
    rootNode.removeChild(rootNode.firstChild);
  }

  const rootComponent = instantiateComponent(velement);

  (rootNode as any)._internalInstance = rootComponent;

  rootNode.appendChild(rootComponent.mount());
  rootNodeCache = rootNode;
}

export function rerender() {
  if (rootNodeCache) {
    const preRootComponent = (rootNodeCache as any)._internalInstance;

    if (preRootComponent && rootNodeCache) {
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
