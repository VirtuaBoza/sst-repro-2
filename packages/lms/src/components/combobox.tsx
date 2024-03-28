import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { Fragment } from "react";
import { Combobox as HeadlessCombobox, Transition } from "@headlessui/react";
import { cn } from "@/lib/utils";
import { matchSorter } from "match-sorter";
import { useControllableState } from "@/hooks/use-controllable-state";

export interface ComboboxOption {
  disabled?: boolean;
  label: string;
  value: string;
}

export function Combobox({
  defaultQuery,
  defaultValue,
  id,
  onChange,
  onQueryChange,
  options = [],
  placeholder,
  query: queryFromProps,
  value,
}: {
  defaultQuery?: string;
  defaultValue?: ComboboxOption;
  id?: string;
  onChange?: (value: ComboboxOption) => any;
  onQueryChange?: (query: string) => any;
  options?: ComboboxOption[];
  placeholder?: string;
  query?: string;
  value?: ComboboxOption;
}) {
  const [selected, setSelected] = useControllableState<ComboboxOption>({
    defaultValue: defaultValue,
    onChange,
    value,
  });
  const [query, setQuery] = useControllableState<string>({
    defaultValue: defaultQuery || "",
    onChange: onQueryChange,
    value: queryFromProps,
  });

  const filteredOptions = matchSorter(options, query, { keys: ["label"] });

  return (
    <HeadlessCombobox onChange={setSelected} value={selected}>
      <div className="relative">
        <div className="flex items-center flex-wrap gap-2 min-h-[44px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
          <HeadlessCombobox.Input<ComboboxOption>
            className="flex-1 focus-visible:outline-none"
            displayValue={(option) => option.label}
            id={id}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
          />
          <HeadlessCombobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronsUpDownIcon
              aria-hidden="true"
              className="h-5 w-5 text-gray-400"
            />
          </HeadlessCombobox.Button>
        </div>
        <Transition
          afterLeave={() => setQuery("")}
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <HeadlessCombobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-10">
            {filteredOptions.length === 0 && query !== "" ? (
              <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                Nothing found.
              </div>
            ) : (
              <>
                {filteredOptions.map((option) => (
                  <HeadlessCombobox.Option
                    key={option.value}
                    className={({ active }) =>
                      cn(
                        "relative cursor-default select-none py-2 pl-10 text-gray-900",
                        active && "bg-accent",
                        option.disabled && "opacity-40"
                      )
                    }
                    value={option}
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? "font-medium" : "font-normal"
                          }`}
                        >
                          {option.label}
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 text-primary`}
                          >
                            <CheckIcon aria-hidden="true" className="h-5 w-5" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </HeadlessCombobox.Option>
                ))}
              </>
            )}
          </HeadlessCombobox.Options>
        </Transition>
      </div>
    </HeadlessCombobox>
  );
}
