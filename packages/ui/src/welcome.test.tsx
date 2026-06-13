import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, expect, it } from "vitest";

import { Welcome } from "./welcome";

describe("Welcome", () => {
  it("renders the Mundialito Redondela welcome message", () => {
    render(<Welcome />);

    expect(
      screen.getByRole("heading", { name: "Welcome to Mundialito Redondela" }),
    ).toBeInTheDocument();
  });
});
