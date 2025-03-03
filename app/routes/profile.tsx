import { useLoaderData, type LoaderFunctionArgs } from "react-router";
import { getSession } from "~/lib/sessions";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const accessToken = session.get("accessToken");
  const refreshToken = session.get("refreshToken");

  return { accessToken, refreshToken };
}

export default function ProfilePage() {
  const { accessToken, refreshToken } = useLoaderData<typeof loader>();

  return <div>{JSON.stringify({ accessToken, refreshToken })}</div>;
}
