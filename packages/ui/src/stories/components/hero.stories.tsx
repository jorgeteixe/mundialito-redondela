import type { Meta, StoryObj } from "@storybook/react-vite";
import { CalendarDays, ExternalLink, MapPin } from "lucide-react";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Hero } from "../../components/hero";

const meta: Meta<typeof Hero> = {
  title: "Components/Hero",
  component: Hero,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof Hero>;

export const Default: Story = {
  args: {
    badge: <Badge variant="secondary">XLVII</Badge>,
    title: "Mundialito da Xunqueira",
    description: (
      <>
        <div className="flex items-center justify-center gap-2">
          <MapPin className="size-4 shrink-0" />
          <span>Pista de A Xunqueira, Redondela</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <CalendarDays className="size-4 shrink-0" />
          <span>29 jun – 24 jul 2026</span>
        </div>
      </>
    ),
    actions: (
      <>
        <Button asChild>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSfw9x_7AGtd7LbWosYPkU06ks8I0kLr-RGnDZETmbMTKuypVg/viewform?usp=sf_link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Inscríbete
            <ExternalLink className="ml-1 size-3.5" />
          </a>
        </Button>
        <Button variant="outline" asChild>
          <a
            href="https://redondela.gal/evento/mundialito-da-xunquiera-2026/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Más información
            <ExternalLink className="ml-1 size-3.5" />
          </a>
        </Button>
      </>
    ),
  },
};

export const NoBadge: Story = {
  args: {
    title: "Mundialito da Xunqueira",
    description: (
      <>
        <div className="flex items-center justify-center gap-2">
          <MapPin className="size-4 shrink-0" />
          <span>Pista de A Xunqueira, Redondela</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <CalendarDays className="size-4 shrink-0" />
          <span>29 jun – 24 jul 2026</span>
        </div>
      </>
    ),
    actions: (
      <Button asChild>
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLSfw9x_7AGtd7LbWosYPkU06ks8I0kLr-RGnDZETmbMTKuypVg/viewform?usp=sf_link"
          target="_blank"
          rel="noopener noreferrer"
        >
          Inscríbete
          <ExternalLink className="ml-1 size-3.5" />
        </a>
      </Button>
    ),
  },
};

export const TitleOnly: Story = {
  args: {
    title: "Mundialito da Xunqueira",
  },
};
