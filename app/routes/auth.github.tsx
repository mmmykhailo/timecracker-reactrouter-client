import { redirect } from "react-router";
import { http } from "~/lib/http.server";

const CLIENT_URL: string = import.meta.env.VITE_CLIENT_URL || "";

export async function action() {
  const { data, error } = await http.getAuthGithub({
    query: {
      redirect_uri: `${CLIENT_URL}/auth/github/callback`,
    },
  });

  if (error || !data?.url) {
    throw error;
  }

  return redirect(data.url);
}
