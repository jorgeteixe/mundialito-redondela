import type { Meta, StoryObj } from "@storybook/react-vite";

import { Separator } from "../../ui/separator";

const meta = {
  title: "shadcn/Separator",
  component: Separator,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Separator>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <div style={{ width: "320px" }}>
      <p className="text-xs">Fase de grupos</p>
      <Separator className="my-2" />
      <p className="text-xs">Rondas eliminatorias</p>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-8 items-center gap-3">
      <span className="text-xs">Equipos</span>
      <Separator orientation="vertical" />
      <span className="text-xs">Partidos</span>
    </div>
  ),
};
