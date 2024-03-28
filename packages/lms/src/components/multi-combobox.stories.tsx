/* eslint-disable react-hooks/rules-of-hooks */
import type { Meta, StoryObj } from "@storybook/react";

import { MultiCombobox, MultiComboboxEntry } from "./multi-combobox";
import { useRef, useState } from "react";

const meta: Meta<typeof MultiCombobox> = {
  component: MultiCombobox,
};

export default meta;
type Story = StoryObj<typeof MultiCombobox>;

const OPTIONS = [
  { label: "Wade Cooper", value: "1" },
  { label: "Arlene Mccoy", value: "2" },
  { label: "Devon Webb", value: "3" },
  { label: "Tom Cook", value: "4" },
  { label: "Tanya Fox", value: "5" },
  { label: "Hellen Schmidt", value: "6" },
];

export const Primary: Story = {
  render: (args) => {
    const [filteredOptions, setFilteredOptions] = useState<
      MultiComboboxEntry[]
    >([]);

    const [loading, setLoading] = useState(false);
    const timeoutRef = useRef<number | undefined>(undefined);

    return (
      <MultiCombobox
        {...args}
        loading={loading}
        onQueryChange={(value) => {
          setLoading(true);
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          timeoutRef.current = setTimeout(() => {
            setFilteredOptions(
              OPTIONS.filter(
                (opt) =>
                  value &&
                  opt.label
                    .toLowerCase()
                    .replace(/\s+/g, "")
                    .includes(value.toLowerCase().replace(/\s+/g, ""))
              )
            );
            setLoading(false);
          }, 500) as any;
        }}
        options={filteredOptions}
      />
    );
  },
};
