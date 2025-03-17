import { logoutIfUnauthorized } from "../auth.server";
import * as http from "./codegen";
import { client as httpClient } from "./codegen/client.gen";
import type { ApiCallMethod } from "./types";

httpClient.setConfig({
  baseUrl: process.env.VITE_API_URL,
});

export async function performAuthenticatedRequest<
  T extends ReturnType<ApiCallMethod>,
>(request: Request, result: T): Promise<Awaited<T>> {
  const awaitedResult = await result;
  const {
    data,
    response: { status: responseStatus },
  } = awaitedResult;

  console.log(data, responseStatus);

  await logoutIfUnauthorized(responseStatus, request);

  return awaitedResult;
}

export { http, httpClient };
