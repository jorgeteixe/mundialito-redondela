import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { DateTimePicker } from "../../components/date-time-picker";

const meta = {
  title: "Components/DateTimePicker",
  component: DateTimePicker,
  parameters: { layout: "centered" },
} satisfies Meta<typeof DateTimePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  render: () => {
    const [value, setValue] = useState<Date | undefined>(undefined);
    return (
      <div className="w-72">
        <DateTimePicker value={value} onChange={setValue} />
      </div>
    );
  },
};

export const Preselected: Story = {
  render: () => {
    const [value, setValue] = useState<Date | undefined>(
      new Date("2026-07-15T18:30:00"),
    );
    return (
      <div className="w-72">
        <DateTimePicker value={value} onChange={setValue} />
      </div>
    );
  },
};
