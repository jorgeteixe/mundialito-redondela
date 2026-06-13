import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, expect, it } from "vitest";

import { Logo } from "./logo";

describe("Logo", () => {
  it("renders the edition logo by default", () => {
    render(<Logo />);

    expect(
      screen.getByRole("img", { name: "XLVII Mundialito da Xunqueira" }),
    ).toBeInTheDocument();
  });

  it("renders the event-name variant", () => {
    render(<Logo variant="event" />);

    expect(
      screen.getByRole("img", { name: "Mundialito da Xunqueira" }),
    ).toBeInTheDocument();
  });
});
