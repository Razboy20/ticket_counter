import { Toast, toaster } from "@kobalte/core";
import styles from "~/assets/css/toast.module.scss";
import CrossIcon from "~icons/heroicons/x-mark-20-solid";

interface ToastProps {
  title: string;
  description: string;
}
export function showToast(toast: ToastProps) {
  toaster.show((props) => (
    <Toast.Root toastId={props.toastId} class={styles["toast"]}>
      <div class={styles["toast__content"]}>
        <div>
          <Toast.Title class={styles["toast__title"]}>{toast.title}</Toast.Title>
          <Toast.Description class={styles["toast__description"]}>{toast.description}</Toast.Description>
        </div>
        <Toast.CloseButton class={styles["toast__close-button"]}>
          <CrossIcon class="h-5 w-5" />
        </Toast.CloseButton>
      </div>
      <Toast.ProgressTrack class={styles["toast__progress-track"]}>
        <Toast.ProgressFill class={styles["toast__progress-fill"]} />
      </Toast.ProgressTrack>
    </Toast.Root>
  ));
}
