/// <reference types="vitest/config" />

import { getViteConfig } from "astro/config";

export default getViteConfig({
  test: {
    coverage: {
      reporter: ["text", "html"],
    },
  },
});
