import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vitest/config";
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["vitest.setup.ts"],
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
        // NextAuth
        // Styling
        "src/styles",
        // Types
        "src/schema",
        "src/index.tsx",
        "src/routes/Root.tsx"
      ],
    },
  },
});
