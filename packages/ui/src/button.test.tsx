import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { Plus } from "lucide-react";
import { describe, expect, it } from "vitest";

import { Button } from "./button";

describe("Button", () => {
  it("renders a labelled button", () => {
    render(<Button>Crear equipo</Button>);

    expect(
      screen.getByRole("button", { name: "Crear equipo" }),
    ).toBeInTheDocument();
  });

  it("supports icon-only buttons with an accessible label", () => {
    render(<Button aria-label="Añadir" icon={Plus} size="icon" />);

    expect(screen.getByRole("button", { name: "Añadir" })).toBeInTheDocument();
  });

  it("disables the button while loading", () => {
    render(<Button isLoading>Guardando</Button>);

    expect(screen.getByRole("button", { name: "Guardando" })).toBeDisabled();
  });
});
