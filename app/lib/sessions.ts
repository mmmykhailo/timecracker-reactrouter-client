import { createCookieSessionStorage } from "react-router";

type SessionData = {
  accessToken?: string;
  refreshToken?: string;
};

type SessionFlashData = {
  error: string;
};

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie: {
      name: "__session",
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 1000 * 60 * 60,
      secrets: [process.env.SESSION_SECRET as string],
      secure: false,
    },
  });

export { getSession, commitSession, destroySession };
