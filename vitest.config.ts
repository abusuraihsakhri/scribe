import { defineConfig } from "vitest/config";

// React's development build (which exports `act`, used by the component tests) is only
// bundled when NODE_ENV is not "production". Machines with a global NODE_ENV=production
// would otherwise fail every component test, so force the test environment here.
process.env.NODE_ENV = "test";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    environment: "node",
  },
});
