import { fileURLToPath } from "url";
import { resolve } from "path";

globalThis.__dirname = resolve(fileURLToPath(import.meta.url), "../../..");