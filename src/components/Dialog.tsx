import { Dialog as KBDialog } from "@kobalte/core";
import type { DialogRootProps } from "@kobalte/core/dist/types/dialog";
import type { JSX, ParentComponent } from "solid-js";
import { Show, splitProps } from "solid-js";
import { css } from "solid-styled";
import CrossIcon from "~icons/heroicons/x-mark-20-solid";

interface DialogProps extends Omit<DialogRootProps, "title"> {
  title?: JSX.Element;
  children: JSX.Element;
}

export const Dialog: ParentComponent<DialogProps> = (props) => {
  const [local, others] = splitProps(props, ["title", "children"]);

  css`
    .dialog__content {
      transform-origin: var(--kb-tooltip-content-transform-origin);
      animation: dialogDisappear 250ms cubic-bezier(0.23, 0.01, 0.92, 0.72);
    }

    .dialog__content[data-expanded] {
      animation: dialogAppear 400ms cubic-bezier(0.15, 0.3, 0.2, 1);
    }

    .dialog__overlay[data-expanded] {
      animation: fadeIn 300ms ease-out;
    }

    .dialog__overlay {
      animation: fadeOut 150ms ease-in 25ms forwards;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes fadeOut {
      from {
        opacity: 1;
      }
      to {
        opacity: 0;
      }
    }

    @keyframes dialogAppear {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes dialogDisappear {
      from {
        opacity: 1;
        transform: scale(1);
      }
      to {
        opacity: 0;
        transform: scale(0.95);
      }
    }
  `;

  return (
    <KBDialog.Root {...others}>
      <KBDialog.Portal>
        <KBDialog.Overlay
          use:solid-styled
          class="dialog__overlay fixed inset-0 z-50 bg-neutral-500/25 dark:bg-neutral-900/25"
        />
        <div class="fixed inset-0 z-50 flex items-center justify-center">
          <KBDialog.Content
            class="dialog__content z-99 max-h-[80vh] max-w-xl flex flex-col overflow-y-scroll border border-neutral-300 rounded-xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:(border-neutral-700 bg-neutral-800 text-neutral-100)"
            use:solid-styled
          >
            <div class="mb-3 flex items-center justify-between text-xl font-semibold leading-6 text-gray-950 dark:text-gray-50">
              <Show when={local.title != undefined}>
                <KBDialog.Title>{local.title}</KBDialog.Title>
              </Show>
              <KBDialog.CloseButton class="ml-4 rounded bg-transparent opacity-80 transition duration-150 ease-out-expo active:scale-95 hover:opacity-100 focusable">
                <CrossIcon class="h-7 w-7" />
              </KBDialog.CloseButton>
            </div>
            <KBDialog.Description>{local.children}</KBDialog.Description>
          </KBDialog.Content>
        </div>
      </KBDialog.Portal>
    </KBDialog.Root>
  );
};
