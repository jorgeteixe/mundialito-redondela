import type { Meta, StoryObj } from "@storybook/react-vite";
import { SocialCallout } from "../../components/social-callout";

const meta = {
  title: "Components/SocialCallout",
  component: SocialCallout,
  parameters: { layout: "padded" },
  args: {
    instagram: "https://www.instagram.com/mundialitoredondela",
    facebook: "https://www.facebook.com/mundialitoredondela",
  },
} satisfies Meta<typeof SocialCallout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const InstagramOnly: Story = {
  args: { facebook: undefined },
};

export const CustomCopy: Story = {
  args: {
    title: "¿Quieres enterarte de todo?",
    description:
      "Síguenos para recibir los resultados y el calendario al instante.",
  },
};
