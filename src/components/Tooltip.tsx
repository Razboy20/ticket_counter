import { Tooltip as KBTooltip } from "@kobalte/core";
import type { Placement } from "@kobalte/core/dist/types/popper/utils";
import type { TooltipTriggerProps } from "@kobalte/core/dist/types/tooltip";
import type { JSX, ParentComponent } from "solid-js";
import { createSignal, splitProps } from "solid-js";
import { css } from "solid-styled";

interface TooltipProps extends TooltipTriggerProps {
  children: JSX.Element;
  tooltipText: JSX.Element;
  placement?: Placement;
  openDelay?: number;
}

export const Tooltip: ParentComponent<TooltipProps> = (props) => {
  const [open, setOpen] = createSignal(false);

  const [local, others] = splitProps(props, ["tooltipText", "placement", "openDelay"]);

  css`
    .tooltip__content {
      transform-origin: var(--kb-tooltip-content-transform-origin);
      animation: fadeIn 0ms;
    }

    .tooltip__content[data-expanded] {
      animation: fadeIn 150ms cubic-bezier(0.19, 1, 0.22, 1);
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: scale(0.98);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
  `;

  return (
    <KBTooltip.Root onOpenChange={setOpen} placement={local.placement} openDelay={local.openDelay}>
      <KBTooltip.Trigger {...others}></KBTooltip.Trigger>
      <KBTooltip.Portal>
        <KBTooltip.Content
          class="tooltip__content z-10 inline-block max-w-sm border border-neutral-300 rounded-lg bg-white p-2 px-2.5 dark:(border-neutral-600 bg-neutral-700 text-neutral-100)"
          use:solid-styled
        >
          <KBTooltip.Arrow />
          <p>{local.tooltipText}</p>
        </KBTooltip.Content>
      </KBTooltip.Portal>
    </KBTooltip.Root>
  );
};
