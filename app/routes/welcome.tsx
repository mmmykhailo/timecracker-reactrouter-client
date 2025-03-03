import { Link, redirect, useNavigate } from "react-router";
import { set as idbSet } from "idb-keyval";
import { Button } from "~/components/ui/button";
import { GithubLoginButton } from "~/components/auth/github-login-button";

export function meta() {
  return [
    { title: "Timecracker" },
    { name: "description", content: "Stupidly simple timetracker" },
  ];
}

export async function clientLoader() {
  const isFilesystemApiSupported = "showDirectoryPicker" in window;

  // top level window means not in iframe
  const checkIfInTopLevelWindow = () => {
    try {
      return window.self === window.top;
    } catch (error) {
      return false;
    }
  };

  if (!isFilesystemApiSupported && checkIfInTopLevelWindow()) {
    return redirect("/not-supported");
  }
}

export default function WelcomePage() {
  const navigate = useNavigate();

  const handleOpenFolder = async () => {
    const rootHandle: FileSystemDirectoryHandle =
      await window.showDirectoryPicker();

    await idbSet("rootHandle", rootHandle);

    return navigate("/");
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-4">
              <img className="h-12 w-12" src="/logo.svg" alt="Timecracker" />
              <h1 className="font-bold text-xl">Welcome to Timecracker</h1>
            </div>
            <div className="flex flex-col gap-2">
              <GithubLoginButton />
              <div className="text-center text-sm">or</div>
              <Button
                type="submit"
                className="w-full"
                onClick={handleOpenFolder}
              >
                Select folder
              </Button>
            </div>
          </div>
          <div className="text-balance text-center text-muted-foreground text-xs [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary ">
            If don't have a timetracker folder yet, I strongly advise you to
            create a new one, do not select a folder that contains anything
            non-related.
            <br />
            <br />
            By logging in or clicking "Select folder", you agree to my{" "}
            <Link to="/terms-and-conditions">Terms and Conditions</Link>.
          </div>
        </div>
      </div>
    </div>
  );
}
