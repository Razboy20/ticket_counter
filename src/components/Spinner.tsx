import type { JSX } from "solid-js";
import { Show, splitProps } from "solid-js";

interface SpinnerProps extends JSX.HTMLAttributes<SVGSVGElement> {
  show?: boolean;
}

export default function Spinner(props: SpinnerProps) {
  const [local, rest] = splitProps(props, ["show", "class"]);

  return (
    <Show when={local.show}>
      <svg
        class={`animate-spin ${local.class ?? ""}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        {...rest}
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </Show>
  );
}

export function FastSpinner(props: SpinnerProps) {
  const [local, rest] = splitProps(props, ["show", "class"]);

  return (
    <Show when={local.show}>
      <div class={props.class}>
        <svg
          class={"animate-spin"}
          style={{ "animation-duration": "200ms" }}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          {...rest}
        >
          <path
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    </Show>
  );
}
