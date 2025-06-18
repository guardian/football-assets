/**
 * See https://nodejs.org/docs/latest-v22.x/api/module.html#customization-hooks
 */

import { register } from "node:module";
import { pathToFileURL } from "node:url";

register("ts-node/esm", pathToFileURL("./"));
