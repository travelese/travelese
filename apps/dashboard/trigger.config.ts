import { defineConfig } from "@trigger.dev/sdk/v3";

export default defineConfig({
  //project: process.env.TRIGGER_PROJECT_ID!,
  project: "proj_dzlhkdgrzrlbbhwbceog",
  runtime: "node",
  logLevel: "log",
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
  dirs: ["./jobs/tasks"],
});
