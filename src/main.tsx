// ⚠️  Must be the first import so Amplify is configured before any
//    aws-amplify service (Storage, Auth, API) is touched.
import { configureAmplify } from "./lib/amplify";
configureAmplify();

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
