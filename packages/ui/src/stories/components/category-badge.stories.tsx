import type { Meta, StoryObj } from "@storybook/react-vite";
import { CategoryBadge } from "../../components/category-badge";

const meta = {
  title: "Components/CategoryBadge",
  component: CategoryBadge,
  parameters: { layout: "centered" },
  args: { category: "senior" },
} satisfies Meta<typeof CategoryBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Senior: Story = {
  args: { category: "senior" },
};

export const Cadete: Story = {
  args: { category: "cadet" },
};

export const BothCategories: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <CategoryBadge category="senior" />
      <CategoryBadge category="cadet" />
    </div>
  ),
};
