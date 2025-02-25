import { Download } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import { useAddToHomescreenPrompt } from "~/hooks/use-add-to-homescreen-prompt";
import { useEffect, useState } from "react";

export function AddToHomescreenAlert() {
  const [prompt, promptToInstall] = useAddToHomescreenPrompt();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (prompt) {
      setIsVisible(true);
    }
  }, [prompt]);

  if (!isVisible) {
    return <></>;
  }

  return (
    <div className="p-4">
      <Alert>
        <Download className="h-4 w-4" />
        <div className="flex justify-between">
          <div className="flex flex-col justify-center">
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>
              You can install a standalone timecracker app to your computer!
            </AlertDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setIsVisible(false)}>
              Not now
            </Button>
            <Button variant="outline" onClick={promptToInstall}>
              Install
            </Button>
          </div>
        </div>
      </Alert>
    </div>
  );
}
