import { RotateCw } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router";
import { useState } from "react";
import { cn } from "~/lib/classNames";

export function RefreshPageButton() {
  const navigate = useNavigate();
  const [isSpinning, setIsSpinning] = useState(false);

  return (
    <Button
      size="icon"
      variant="outline"
      onClick={() => {
        setIsSpinning(true);
        setTimeout(() => navigate(0), 300);
      }}
    >
      <RotateCw className={cn({ "animate-spin": isSpinning })} />
    </Button>
  );
}
