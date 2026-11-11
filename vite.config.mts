import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    // Listen on all interfaces, matching the previous webpack-dev-server behaviour
    host: true,
    port: 3000,
  },
  build: {
    // Kept as "build" (rather than Vite's default "dist") so the Dockerfile and nginx setup are unchanged
    outDir: "build",
    sourcemap: true,
  },
  test: {
    globals: true,
    unstubEnvs: true,
    environment: "jsdom",
    setupFiles: ["vitest.setup.ts"],
    maxWorkers: 2,
    minWorkers: 1,
    deps: {
      moduleDirectories: ["node_modules", path.resolve(__dirname, "./src")],
    },
    coverage: {
      provider: "v8",
      reporter: ["json", "text", "cobertura"],
      include: ["src/**/*.{js,jsx,ts,tsx}", "!src/**/*.d.ts"],
      enabled: true,
      reportsDirectory: "coverage",
      exclude: [
        "node_modules/",
        // Test mocks
        "src/mocks",
        // Styling
        "src/styles",
        // Types
        "src/schema",
        "src/index.tsx",
        "src/routes/Root.tsx",
      ],
    },
  },
});
