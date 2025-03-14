import { type Session, createCookieSessionStorage } from "react-router";

type SessionData = {
  accessToken?: string;
  refreshToken?: string;
};

type SessionFlashData = {
  error: string;
};

export type AuthSession = Session<SessionData, SessionFlashData>;

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie: {
      name: "__session",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 1000 * 60 * 24 * 14,
      secrets: [process.env.SESSION_SECRET || "secret"],
      secure: true,
    },
  });

const getSessionFromRequest = async (request: Request) => {
  return await getSession(request.headers.get("Cookie"));
};

export {
  getSession as getAuthSession,
  getSessionFromRequest as getAuthSessionFromRequest,
  commitSession as commitAuthSession,
  destroySession as destroyAuthSession,
};
