import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Service Worker disabled to prevent automatic requests
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/sw.js').catch(err => {
//       console.log('Service Worker registration failed:', err);
//     });
//   });
// }

createRoot(document.getElementById("root")!).render(<App />);
