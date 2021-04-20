/**
 * create virtual element
 * @param type string / function / "textNode"
 * @param props node attr / event / nodeValue / children
 * @returns VElement
 */
function createElement(type: string | FunctionComponent, props: Props): VElement {
  return {
    type,
    props,
  } as VElement;
}

export const h = createElement;
