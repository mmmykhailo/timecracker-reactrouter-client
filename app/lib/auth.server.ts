import { redirect } from "react-router";
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
      // headers: {
      //   "Set-Cookie": await commitAuthSession(authSession),
      // },
    });
  }
}
