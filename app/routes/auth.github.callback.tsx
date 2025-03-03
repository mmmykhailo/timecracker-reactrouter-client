import { useLoaderData, type LoaderFunctionArgs } from "react-router";

const API_URL: string = import.meta.env.VITE_API_URL || "";

export async function loader({ request }: LoaderFunctionArgs) {
  const requestUrl = new URL(request.url);
  const requestSearchParams = requestUrl.searchParams;

  const baseRequestUrl = new URL(request.url.split("?")[0]);

  const url = new URL(`${API_URL}/auth/github/callback`);

  url.searchParams.append("code", requestSearchParams.get("code") || "");
  url.searchParams.append("state", requestSearchParams.get("state") || "");
  url.searchParams.append("redirect_uri", baseRequestUrl.toString());

  const response = await fetch(url);

  return { json: await response.json() };
}

export default function AuthGithubCallbackPage() {
  const { json } = useLoaderData<typeof loader>();
  return <div>{JSON.stringify(json)}</div>;
}
