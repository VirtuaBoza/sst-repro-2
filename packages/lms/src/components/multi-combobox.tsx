import { Badge } from "./badge";
import { Button } from "./button";
import { Combobox, Transition } from "@headlessui/react";
import { Fragment, useRef } from "react";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useControllableState } from "@/hooks/use-controllable-state";

export interface MultiComboboxEntry {
  label: string;
  value: string;
}

export interface MultiComboboxOption extends MultiComboboxEntry {
  disabled?: boolean;
}

export function MultiCombobox({
  autoFocus,
  canCreate,
  defaultQuery,
  defaultValue,
  id,
  loading,
  name,
  onChange,
  onQueryChange,
  options = [],
  placeholder,
  query: queryFromProps,
  value,
}: {
  autoFocus?: boolean;
  canCreate?: boolean;
  defaultQuery?: string;
  defaultValue?: MultiComboboxEntry[];
  id?: string;
  loading?: boolean;
  name?: string;
  onChange?: (values: MultiComboboxEntry[]) => any;
  onQueryChange?: (query: string) => any;
  options?: MultiComboboxOption[];
  placeholder?: string;
  query?: string;
  value?: MultiComboboxEntry[];
}) {
  const [selectedOptions, setSelectedOptions] = useControllableState<
    MultiComboboxEntry[]
  >({
    defaultValue: defaultValue || [],
    onChange,
    value,
  });
  const [query, setQuery] = useControllableState<string>({
    defaultValue: defaultQuery || "",
    onChange: onQueryChange,
    value: queryFromProps,
  });

  const filteredOptions = options.filter(
    (opt) => !selectedOptions.map((sel) => sel.value).includes(opt.value)
  );
  const lastOptionRef = useRef<HTMLButtonElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDelete = (opt: MultiComboboxEntry) => {
    setSelectedOptions((prev) => prev.filter((p) => p.value !== opt.value));
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <Combobox
      multiple={true as any}
      onChange={(opts) => {
        setQuery("");
        setSelectedOptions(opts);
      }}
      value={selectedOptions}
    >
      <div
        className="relative"
        onClick={() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }}
      >
        <div className="flex items-center flex-wrap gap-2 min-h-[44px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
          {selectedOptions.map((opt, i) => (
            <Badge
              key={opt.value}
              className="gap-2 whitespace-nowrap py-1"
              variant={"secondary"}
            >
              <input name={name} type="hidden" value={opt.value} />
              <span>{opt.label}</span>
              <Button
                ref={
                  i == selectedOptions.length - 1 ? lastOptionRef : undefined
                }
                className="h-4 w-4"
                onClick={(e) => {
                  e.preventDefault();
                  handleDelete(opt);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace") {
                    handleDelete(opt);
                  }
                }}
                size={"icon"}
                variant={"ghost"}
              >
                <XIcon />
              </Button>
            </Badge>
          ))}
          <Combobox.Input
            ref={inputRef}
            autoComplete="off"
            autoFocus={autoFocus}
            className="flex-1 focus-visible:outline-none"
            displayValue={() => ""}
            id={id}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (
                !query &&
                event.key === "Backspace" &&
                lastOptionRef.current
              ) {
                lastOptionRef.current.focus();
              }
            }}
            placeholder={placeholder}
            value={query}
          />
        </div>
        <Transition
          afterLeave={() => setQuery("")}
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-md ring-1 ring-black/5 focus:outline-none sm:text-sm z-10">
            {canCreate &&
              Boolean(query.trim()) &&
              !selectedOptions.map((sel) => sel.value).includes(query) && (
                <Combobox.Option
                  className={({ active }) =>
                    cn(
                      "relative cursor-default select-none py-2 px-4 text-gray-900",
                      active && "bg-accent"
                    )
                  }
                  value={{
                    label: query,
                    value: query,
                  }}
                >
                  <span className={`block truncate font-normal`}>
                    Create: &quot;{query}&quot;
                  </span>
                </Combobox.Option>
              )}
            {filteredOptions.length === 0 ? (
              <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                {loading ? "Loading..." : "Nothing found."}
              </div>
            ) : (
              <>
                {loading && (
                  <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                    Loading...
                  </div>
                )}

                {filteredOptions.map((option) => (
                  <Combobox.Option
                    key={option.value}
                    className={({ active }) =>
                      cn(
                        "relative cursor-default select-none py-2 px-4 text-gray-900",
                        active && "bg-accent",
                        option.disabled && "opacity-40"
                      )
                    }
                    disabled={option.disabled}
                    value={option}
                  >
                    <span className={`block truncate font-normal`}>
                      {option.label}
                    </span>
                  </Combobox.Option>
                ))}
              </>
            )}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  );
}
