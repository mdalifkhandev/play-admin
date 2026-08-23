
  import { createRoot } from "react-dom/client";
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

  createRoot(document.getElementById("root")!).render(<App />);
  
