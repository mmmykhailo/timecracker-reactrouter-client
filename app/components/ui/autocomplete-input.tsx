import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  type ComponentProps,
} from "react";
import { cn } from "~/lib/classNames";
import { Command, CommandInput, CommandItem, CommandList } from "./command";

type AutocompleteInputProps = ComponentProps<typeof CommandInput> & {
  getSuggestions: (value: string) => Array<string>;
};

export const AutoCompleteInput = forwardRef(
  (
    {
      getSuggestions,
      className,
      wrapperClassName,
      defaultValue,
      ...props
    }: AutocompleteInputProps,
    forwardRef,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(forwardRef, () => inputRef.current);

    const [inputValue, setInputValue] = useState(
      defaultValue?.toString() || "",
    );
    const [isSuggestionBoxHidden, setIsSuggestionBoxHidden] = useState(false);
    const [suggestions, setSuggestions] = useState<Array<string>>(
      getSuggestions(""),
    );

    const handleValueChange = (value: string) => {
      setInputValue(value);
      setSuggestions(getSuggestions(value));
      setIsSuggestionBoxHidden(false);
    };

    const handleSuggestionSelect = (suggestion: string) => {
      setInputValue(suggestion);
      setIsSuggestionBoxHidden(true);
      inputRef.current?.focus();
    };

    return (
      <Command className="group relative h-auto overflow-visible">
        <CommandInput
          wrapperClassName={cn(
            "px-0 rounded-md border border-input",
            "[&:has(:focus-visible)]:outline-hidden [&:has(:focus-visible)]:ring-1 [&:has(:focus-visible)]:ring-ring",
            wrapperClassName,
          )}
          className={cn(
            "h-9 px-3 py-1 group-focus-within:ring-ring",
            className,
          )}
          {...props}
          value={inputValue}
          onValueChange={handleValueChange}
          ref={inputRef}
          autoComplete="off"
        />
        <CommandList
          className={cn(
            "absolute top-full mt-1 hidden w-full flex-col rounded border bg-background p-1",
            {
              "group-focus-within:flex":
                !isSuggestionBoxHidden && !!suggestions.length,
            },
          )}
        >
          {suggestions.map((suggestion) => (
            <CommandItem
              key={suggestion}
              value={suggestion}
              onSelect={() => handleSuggestionSelect(suggestion)}
            >
              {suggestion}
            </CommandItem>
          ))}
        </CommandList>
      </Command>
    );
  },
);
