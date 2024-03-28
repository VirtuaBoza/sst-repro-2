import { CheckIcon, XIcon } from "lucide-react";
import { Fragment, KeyboardEventHandler } from "react";
import { Combobox as HeadlessCombobox, Transition } from "@headlessui/react";
import { cn } from "@/lib/utils";
import { useControllableState } from "@/hooks/use-controllable-state";

export interface AutocompleteOption {
  description?: string;
  disabled?: boolean;
  label: string;
  value: string;
}

export function Autocomplete({
  canCreate,
  defaultQuery,
  defaultValue,
  id,
  loading,
  onChange,
  onKeyDown,
  onQueryChange,
  options = [],
  placeholder,
  query: queryFromProps,
  value,
}: {
  canCreate?: boolean;
  defaultQuery?: string;
  defaultValue?: AutocompleteOption | null;
  id?: string;
  loading?: boolean;
  onChange?: (value: AutocompleteOption | null) => any;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
  onQueryChange?: (query: string) => any;
  options?: AutocompleteOption[];
  placeholder?: string;
  query?: string;
  value?: AutocompleteOption | null;
}) {
  const [selected, setSelected] =
    useControllableState<AutocompleteOption | null>({
      defaultValue: defaultValue || null,
      onChange,
      value,
    });
  const [query, setQuery] = useControllableState<string>({
    defaultValue: defaultQuery || "",
    onChange: onQueryChange,
    value: queryFromProps,
  });

  return (
    <HeadlessCombobox onChange={setSelected} value={selected} nullable>
      <div className="relative">
        <div className="flex items-center flex-wrap gap-2 min-h-[40px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
          <HeadlessCombobox.Input<AutocompleteOption | null>
            className="flex-1 focus-visible:outline-none"
            displayValue={(option) => option?.label || ""}
            id={id}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
          />
          {selected && (
            <button className="absolute inset-y-0 right-0 flex items-center pr-2 outline-none">
              <XIcon
                aria-hidden="true"
                className="h-5 w-5 text-gray-400"
                onClick={() => {
                  setSelected(null);
                }}
              />
            </button>
          )}
        </div>
        <Transition
          afterLeave={() => setQuery("")}
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <HeadlessCombobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-10">
            {loading ? (
              <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                Loading...
              </div>
            ) : (
              <>
                {canCreate && query && (
                  <HeadlessCombobox.Option
                    className={({ active }) =>
                      cn(
                        "relative cursor-default select-none py-2 px-4 text-gray-900",
                        active && "bg-accent"
                      )
                    }
                    value={{
                      label: query,
                      value: "",
                    }}
                  >
                    Create: &quot;{query}&quot;
                  </HeadlessCombobox.Option>
                )}
                {options.length === 0 && query !== "" && (
                  <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                    Nothing found.
                  </div>
                )}
                {options.map((option) => {
                  const isSelected = option.value === selected?.value;
                  return (
                    <HeadlessCombobox.Option
                      key={option.value}
                      className={({ active }) =>
                        cn(
                          "relative cursor-default select-none py-2 pr-10 pl-2 text-gray-900",
                          active && "bg-accent",
                          option.disabled && "opacity-40"
                        )
                      }
                      value={option}
                    >
                      <span
                        className={`block truncate ${
                          isSelected ? "font-medium" : "font-normal"
                        }`}
                      >
                        {option.label}
                      </span>
                      {option.description && (
                        <span className="text-muted-foreground text-sm">
                          {option.description}
                        </span>
                      )}
                      {isSelected ? (
                        <span
                          className={`absolute inset-y-0 right-0 flex items-center pr-3 text-primary`}
                        >
                          <CheckIcon aria-hidden="true" className="h-5 w-5" />
                        </span>
                      ) : null}
                    </HeadlessCombobox.Option>
                  );
                })}
              </>
            )}
          </HeadlessCombobox.Options>
        </Transition>
      </div>
    </HeadlessCombobox>
  );
}
