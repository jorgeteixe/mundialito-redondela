import type { Meta, StoryObj } from "@storybook/react-vite";
import { Footer } from "../../components/footer";

const meta: Meta<typeof Footer> = {
  title: "Components/Footer",
  component: Footer,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof Footer>;

const legalLinks = [
  { label: "Política de privacidad", href: "/privacidad" },
  { label: "Aviso legal", href: "/aviso-legal" },
  { label: "Política de cookies", href: "/cookies" },
];

export const Default: Story = {
  args: {
    copyright: "© 2026 Mundialito Redondela · Sitio no oficial",
    email: "contacto@mundialitoredondela.com",
    legalLinks,
  },
};

export const NoEmail: Story = {
  args: {
    copyright: "© 2026 Mundialito Redondela · Sitio no oficial",
    legalLinks,
  },
};

export const Minimal: Story = {
  args: {
    copyright: "© 2026 Mundialito Redondela · Sitio no oficial",
  },
};
