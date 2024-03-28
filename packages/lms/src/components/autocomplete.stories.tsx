/* eslint-disable react-hooks/rules-of-hooks */
import { Autocomplete, AutocompleteOption } from "./autocomplete";
import { matchSorter } from "match-sorter";
import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Autocomplete> = {
  component: Autocomplete,
};

export default meta;
type Story = StoryObj<typeof Autocomplete>;

const options = [
  { description: "Cool guy", label: "Wade Cooper", value: "1" },
  { label: "Arlene Mccoy", value: "2" },
  { label: "Devon Webb", value: "3" },
  { label: "Tom Cook", value: "4" },
  { label: "Tanya Fox", value: "5" },
  { label: "Hellen Schmidt", value: "6" },
];

export const Primary: Story = {
  args: {
    placeholder: "Placeholder",
  },
  render: (props) => {
    const [filteredOptions, setFilteredOptions] = useState<
      AutocompleteOption[]
    >([]);
    const [loading, setLoading] = useState(false);
    const timeoutRef = useRef<any>();

    return (
      <Autocomplete
        {...props}
        loading={loading}
        onQueryChange={(query) => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          setLoading(true);
          timeoutRef.current = setTimeout(() => {
            setFilteredOptions(
              matchSorter(options, query, { keys: ["label"] })
            );
            setLoading(false);
          }, 1_000);
        }}
        options={filteredOptions}
      />
    );
  },
};
