import { defineConfig } from "orval";

export default defineConfig({
  api: {
    input: {
      target:
        "https://raw.githubusercontent.com/Neptune-Progate-Hackathon-AWS/back/main/openapi.yml",
    },
    output: {
      mode: "tags-split",
      target: "src/gen/api",
      schemas: "src/gen/models",
      client: "react-query",
      httpClient: "fetch",
      baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080",
    },
    hooks: {
      afterAllFilesWrite: "prettier --write",
    },
  },
});
