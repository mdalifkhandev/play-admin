
  import { createRoot } from "react-dom/client";
  import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
  import App from "./app/App.tsx";
  import "./styles/index.css";

  if (import.meta.env.DEV) {
    const originalError = console.error;
    console.error = (...args) => {
      const firstArg = args[0];
      const isRechartsDefaultPropsWarning =
        typeof firstArg === "string" &&
        firstArg.includes("Support for defaultProps will be removed from function components") &&
        (firstArg.includes("XAxis") || firstArg.includes("YAxis"));

      if (isRechartsDefaultPropsWarning) {
        return;
      }

      originalError(...args);
    };
  }

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });

  createRoot(document.getElementById("root")!).render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  );
  
