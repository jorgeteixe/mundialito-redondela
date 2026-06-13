import type { Meta, StoryObj } from "@storybook/react-vite";

import { Label } from "../../ui/label";
import { Input } from "../../ui/input";

const meta = {
  title: "shadcn/Label",
  component: Label,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div style={{ width: "320px", padding: "20px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Label>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: "Nombre del equipo" },
};

export const WithInput: Story = {
  render: () => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="team">Nombre del equipo</Label>
      <Input id="team" placeholder="Ej: Los Galácticos" />
    </div>
  ),
};
