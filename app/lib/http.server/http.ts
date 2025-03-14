import { jwtDecode } from "jwt-decode";
import { logoutIfUnauthorized } from "../auth.server";
import {
  commitAuthSession,
  getAuthSessionFromRequest,
} from "../sessions.server";
import * as http from "./codegen";
import { client as httpClient } from "./codegen/client.gen";
import type { ApiCallMethod } from "./types";

httpClient.setConfig({
  baseUrl: process.env.VITE_API_URL,
});

export async function getAuthHeaders(
  request: Request,
  requestHeaders: Record<string, string> = {},
): Promise<{
  requestHeaders: Record<string, string>;
  responseHeaders: HeadersInit;
}> {
  const authSession = await getAuthSessionFromRequest(request);

  const accessToken = authSession.get("accessToken");
  const refreshToken = authSession.get("refreshToken");

  if (!accessToken) {
    return { requestHeaders: requestHeaders, responseHeaders: {} };
  }

  const decoded = jwtDecode(accessToken);
  const currentTime = Math.floor(Date.now() / 1000);
  if (!decoded.exp) {
    return { requestHeaders: requestHeaders, responseHeaders: {} };
  }
  const isTokenExpired = decoded.exp <= currentTime + 30;

  if (isTokenExpired) {
    if (!refreshToken) {
      return { requestHeaders: requestHeaders, responseHeaders: {} };
    }
    const { data, error } = await http.postAuthRefresh({
      body: { refreshToken },
    });

    if (error) {
      console.error("Could not refresh", { error });
      authSession.set("accessToken", undefined);
      authSession.set("refreshToken", undefined);
      return {
        requestHeaders: requestHeaders,
        responseHeaders: {
          "Set-Cookie": await commitAuthSession(authSession),
        },
      };
    }

    authSession.set("accessToken", data.accessToken);
    authSession.set("refreshToken", data.refreshToken);

    requestHeaders.Authorization = `Bearer ${accessToken}`;
    return {
      requestHeaders: requestHeaders,
      responseHeaders: {
        "Set-Cookie": await commitAuthSession(authSession),
      },
    };
  }

  requestHeaders.Authorization = `Bearer ${accessToken}`;
  return { requestHeaders: requestHeaders, responseHeaders: {} };
}

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
