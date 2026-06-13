import type { Meta, StoryObj } from "@storybook/react-vite";

import { Badge } from "../../ui/badge";

const meta = {
  title: "shadcn/Badge",
  component: Badge,
  parameters: { layout: "centered" },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: [
        "default",
        "secondary",
        "outline",
        "destructive",
        "ghost",
        "link",
      ],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: "Activo" },
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>Activo</Badge>
      <Badge variant="secondary">Grupo A</Badge>
      <Badge variant="outline">Pendiente</Badge>
      <Badge variant="destructive">Eliminado</Badge>
    </div>
  ),
};
