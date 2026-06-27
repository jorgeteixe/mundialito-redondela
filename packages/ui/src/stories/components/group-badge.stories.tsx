import type { Meta, StoryObj } from "@storybook/react-vite";
import { GroupBadge } from "../../components/group-badge";

const meta = {
  title: "Components/GroupBadge",
  component: GroupBadge,
  parameters: { layout: "centered" },
  args: { seed: "Grupo A", children: "Grupo A" },
} satisfies Meta<typeof GroupBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SeveralGroups: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      {["Grupo A", "Grupo B", "Grupo C", "Grupo D"].map((name) => (
        <GroupBadge key={name} seed={name}>
          {name}
        </GroupBadge>
      ))}
    </div>
  ),
};
