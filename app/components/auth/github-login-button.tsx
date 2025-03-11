import { Form } from "react-router";
import { Button } from "../ui/button";

export function GithubLoginButton() {
  return (
    <Form className="contents" action="/auth/github" method="POST">
      <Button type="submit">Login with GitHub</Button>
    </Form>
  );
}
