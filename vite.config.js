import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig(({ mode }) => {
    const isLibBuild = mode === "lib";

    return {
        plugins: [react()],
        test: {
            environment: "jsdom",
            setupFiles: "./src/testSetup.js",
        },
        build: isLibBuild
            ? {
                  outDir: "lib",
                  lib: {
                      entry: resolve(__dirname, "src/index.js"),
                      name: "InputX",
                      formats: ["es", "cjs"],
                      fileName: format =>
                          format === "es" ? "index.js" : "index.cjs",
                  },
                  rollupOptions: {
                      external: ["react", "react-dom", "react-icons/md"],
                  },
              }
            : undefined,
    };
});
