import { redirect, type LoaderFunctionArgs } from "react-router";
import { getAuthGithubCallback } from "~/lib/http";
import { commitSession, getSession } from "~/lib/sessions";

const API_URL: string = import.meta.env.VITE_API_URL || "";

export async function loader({ request }: LoaderFunctionArgs) {
  const requestUrl = new URL(request.url);
  const requestSearchParams = requestUrl.searchParams;

  const baseRequestUrl = new URL(request.url.split("?")[0]);

  const url = new URL(`${API_URL}/auth/github/callback`);

  url.searchParams.append("code", requestSearchParams.get("code") || "");
  url.searchParams.append("state", requestSearchParams.get("state") || "");
  url.searchParams.append("redirect_uri", baseRequestUrl.toString());

  const { error, data } = await getAuthGithubCallback({
    query: {
      code: requestSearchParams.get("code") || "",
      state: requestSearchParams.get("state") || "",
      redirect_uri: baseRequestUrl.toString(),
    },
  });

  if (error || !data) {
    return {
      error: error.error,
    };
  }

  const session = await getSession(request.headers.get("Cookie"));
  session.set("accessToken", data.accessToken);
  session.set("refreshToken", data.refreshToken);

  return redirect("/profile", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}
