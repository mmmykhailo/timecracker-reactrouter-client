import { Link, useNavigate } from "react-router";
import { set as idbSet } from "idb-keyval";
import { Button } from "~/components/ui/button";

export function meta() {
  return [
    { title: "Timecracker" },
    { name: "description", content: "Stupidly simple timetracker" },
  ];
}

export default function WelcomePage() {
  const navigate = useNavigate();

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
    return navigate("/not-supported");
  }

  const handleOpenFolder = async () => {
    const rootHandle: FileSystemDirectoryHandle =
      await window.showDirectoryPicker();

    await idbSet("rootHandle", rootHandle);

    return navigate("/");
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-4">
              <img className="w-12 h-12" src="/logo.svg" alt="Timecracker" />
              <h1 className="text-xl font-bold">Welcome to Timecracker</h1>
            </div>
            <Button type="submit" className="w-full" onClick={handleOpenFolder}>
              Select folder
            </Button>
          </div>
          <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary  ">
            By clicking "Select folder", you agree to my{" "}
            <Link to="/terms-and-conditions">Terms and Conditions</Link>.
          </div>
        </div>
      </div>
    </div>
  );
}
