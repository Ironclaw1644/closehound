// Font Awesome SVG-core setup for Next App Router: import the CSS once and stop
// the library from auto-injecting it (we control insertion order ourselves).
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";

config.autoAddCss = false;
