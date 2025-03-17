import { jwtDecode } from "jwt-decode";
import { redirect } from "react-router";
import { http } from "./http.server";
import {
  commitAuthSession,
  getAuthSessionFromRequest,
} from "./sessions.server";

export async function logoutIfUnauthorized(
  responseStatus: number,
  request: Request,
) {
  if (responseStatus === 401) {
    const authSession = await getAuthSessionFromRequest(request);

    authSession.set("accessToken", undefined);
    authSession.set("refreshToken", undefined);

    throw redirect("/welcome", {
      headers: {
        "Set-Cookie": await commitAuthSession(authSession),
      },
    });
  }
}

async function refreshTokens(refreshToken: string) {
  const { data, error } = await http.postAuthRefresh({
    body: { refreshToken },
  });

  console.log({ data, error });

  if (error || !data.accessToken || !data.refreshToken) {
    console.error("Could not refresh", { error });
    return {
      accessToken: undefined,
      refreshToken: undefined,
    };
  }

  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  };
}

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
      authSession.set("accessToken", undefined);
      authSession.set("refreshToken", undefined);

      return {
        requestHeaders: requestHeaders,
        responseHeaders: {
          "Set-Cookie": await commitAuthSession(authSession),
        },
      };
    }

    const newTokens = await refreshTokens(refreshToken);

    authSession.set("accessToken", newTokens.accessToken);
    authSession.set("refreshToken", newTokens.refreshToken);

    requestHeaders.Authorization = `Bearer ${newTokens.accessToken}`;

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
