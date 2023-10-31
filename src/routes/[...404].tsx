import type { VoidComponent } from "solid-js";

const ErrorPage: VoidComponent = () => {
  return (
    <main class="content-stretch w-full flex flex-grow flex-row items-center justify-center p-8">
      <div class="flex flex-col items-center justify-center">
        <h1 class="text-8xl font-bold text-neutral-900 dark:text-neutral-100">404</h1>
        <p class="text-2xl text-neutral-700 dark:text-neutral-300">Page not found</p>
      </div>
    </main>
  );
};

export default ErrorPage;
