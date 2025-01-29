import { useRef, useState, type ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import clsx from "clsx";

type CopyableSpanProps = {
  className?: string;
  children: ReactNode;
};

const DELAY = 2000;

const CopyableText: React.FC<CopyableSpanProps> = ({
  children,
  className = "",
}) => {
  const [isJustCopied, setIsJustCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const resetTimeout = useRef<ReturnType<typeof setInterval>>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error("Failed to copy text:", err);
      return false;
    }
  };

  const handleClick = async () => {
    const text = buttonRef.current?.innerText;
    if (!text) {
      return;
    }

    if (!copyText(text)) {
      return;
    }
    setIsJustCopied(true);
    setIsOpen(true);

    if (resetTimeout.current) {
      clearTimeout(resetTimeout.current);
    }

    resetTimeout.current = setTimeout(() => {
      setIsJustCopied(false);
    }, DELAY);
  };

  return (
    <TooltipProvider>
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>
          <button
            ref={buttonRef}
            type="button"
            onClick={handleClick}
            className={clsx(
              "cursor-pointer rounded outline-0 [text-align:inherit]",
              "active:bg-foreground active:text-background",
              "focus-visible:bg-foreground focus-visible:text-background",
              className,
            )}
          >
            {children}
          </button>
        </TooltipTrigger>
        <TooltipContent className="pointer-events-none">
          <p className="text-sm">
            {isJustCopied ? "Copied!" : "Click to copy"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CopyableText;
