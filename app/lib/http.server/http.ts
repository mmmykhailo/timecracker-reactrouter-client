import { jwtDecode } from "jwt-decode";
import {
  commitAuthSession,
  getAuthSessionFromRequest,
} from "../sessions.server";
import * as http from "./codegen";
import { client as httpClient } from "./codegen/client.gen";

httpClient.setConfig({
  baseUrl: process.env.VITE_API_URL,
});

export async function getAuthHeaders(
  request: Request,
  requestHeaders: Headers = new Headers(),
): Promise<{
  requestHeaders: Headers;
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

    requestHeaders.append("Authorization", `Bearer ${accessToken}`);
    return {
      requestHeaders: requestHeaders,
      responseHeaders: {
        "Set-Cookie": await commitAuthSession(authSession),
      },
    };
  }

  requestHeaders.append("Authorization", `Bearer ${accessToken}`);
  return { requestHeaders: requestHeaders, responseHeaders: {} };
}

export { http, httpClient };
