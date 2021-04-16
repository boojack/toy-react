import { createElement } from "../packages/core/element";
import { render } from "../packages/core/render";
import { useState } from "../packages/hooks/useState";

function Header() {
  const [count, setCount] = useState(1);

  return createElement("div", {
    id: "container",
    onClick: () => setCount(count + 1),
    children: ["" + count],
  });
}

const el = createElement("div", {
  children: [createElement(Header, {})],
});

render(el, document.querySelector("#root") as Node);

export {};
