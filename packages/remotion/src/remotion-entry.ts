import { registerRoot } from "remotion";
import "./tailwind.css";
import { RemotionRoot } from "./Root";

// Studio + (later) the worker bundle() point at this file. Keep it side-effect-only.
registerRoot(RemotionRoot);
