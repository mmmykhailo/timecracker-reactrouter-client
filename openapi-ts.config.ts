import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "http://localhost:3000/doc",
  output: "app/lib/http",
  plugins: ["@hey-api/client-fetch"],
});
