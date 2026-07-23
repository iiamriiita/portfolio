import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { inject } from "@vercel/analytics";
import Portfolio from "./Portfolio.jsx";
import "./index.css";

inject(); // Vercel Web Analytics（需在 Vercel 後台 Analytics 分頁按 Enable 才會開始收資料）

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Portfolio />
  </StrictMode>
);
