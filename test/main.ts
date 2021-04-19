import { h } from "../packages/core/element";
import { render } from "../packages/core/render";
import { useState } from "../packages/hooks/useState";

function Header() {
  const [count, setCount] = useState(1);

  return h("div", {
    id: "container" + count,
    onClick: () => setCount(count + 1),
    children: ["" + count],
  });
}

const el = h("section", {
  children: [
    h(Header, {}),
    h("p", {
      children: [h("br", {})],
    }),
  ],
});

render(el, document.querySelector("#root") as Element);

export {};
