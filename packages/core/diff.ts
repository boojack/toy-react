// import { CompositionComponent, DOMComponent, VNodeComponent } from "./element";

// let diffes: any[] = [];

// export function diff(preComponent: VNodeComponent, curComponent: VNodeComponent) {
//   diffes = [];
//   dfsTravelDiff(0, preComponent, curComponent);
//   console.log(diffes);
// }

// function dfsTravelDiff(index: number, preComponent: VNodeComponent | null, curComponent: VNodeComponent | null) {
//   if (preComponent instanceof DOMComponent && curComponent instanceof DOMComponent) {
//     const preElement = preComponent.getVElement();
//     const curElement = curComponent.getVElement();

//     if (typeof preElement === "string" && typeof curElement === "string") {
//       if (preElement !== curElement) {
//         console.log(index, "replace textnode");
//         diffes.push({
//           type: "REPLACE",
//           index: index,
//           value: curElement,
//           node: preComponent.getNode(),
//         });
//       }
//     } else if (typeof preElement === "object" && typeof curElement === "object") {
//       const props = diffProps(preElement.props, curElement.props);
//       if (Object.keys(props).length !== 0) {
//         console.log("props changed", props);
//         diffes.push({
//           type: "PROPS",
//           index: index,
//           value: props,
//           node: preComponent.getNode(),
//         });
//       }

//       // 遍历子节点
//       const preChildren = preComponent.getRenderedComponents();
//       const curChildren = curComponent.getRenderedComponents();
//       const maxSize = Math.max(preChildren.length, curChildren.length);

//       for (let i = 0; i < maxSize; i++) {
//         index++;
//         dfsTravelDiff(index, preChildren[i] ?? null, curChildren[i] ?? null);
//       }
//     } else {
//       console.log(index, "replace");
//     }
//   } else if (preComponent instanceof CompositionComponent && curComponent instanceof CompositionComponent) {
//     dfsTravelDiff(index, preComponent.getRenderedComponent(), curComponent.getRenderedComponent());
//   } else {
//     // Replace
//     console.log(index, "replace");
//   }
// }

// function diffProps(preProps: Props, curProps: Props) {
//   const preP = preProps as IterableObject;
//   const curP = curProps as IterableObject;
//   const keys = Object.keys(preProps).concat(Object.keys(curProps));
//   const finP = {} as IterableObject;

//   for (const k of keys) {
//     if (preP[k] !== curP[k] && typeof curP[k] === "string") {
//       finP[k] = curP[k];
//     }
//   }

//   return finP;
// }

// function isSameComponentType(compA: VNodeComponent, compB: VNodeComponent) {
//   return (compA instanceof DOMComponent && compB instanceof DOMComponent) || (compA instanceof CompositionComponent && compB instanceof CompositionComponent);
// }

export {};
