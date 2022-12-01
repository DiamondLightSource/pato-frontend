import { fireEvent, screen } from "@testing-library/react";
import { renderWithProviders } from "../src/utils/test-utils";
import Collection from "../src/routes/Collection";
import React from "react";

describe("Collection", () => {
  it("should display title with proposals, collection, group and visit", () => {
    renderWithProviders(<Collection />);
    expect(screen.getByText("Data Collection #5")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Proposal cm-31111 , visit 5000 , data collection group 2000" })
    ).toBeInTheDocument();
  });

  it("should display collection data", async () => {
    renderWithProviders(<Collection />);
    await expect(screen.findByText("1 kV")).resolves.toBeInTheDocument();
    expect(screen.getByText("50 μm")).toBeInTheDocument();
  });

  it("should display placeholder message if not data collection is found", async () => {
    renderWithProviders(<Collection />);
    await expect(screen.findByText("Data collection group has no data collections")).resolves.toBeInTheDocument();
  });

  it("should set default page to URL collection index parameter", () => {
    renderWithProviders(<Collection />);
    expect(screen.getByDisplayValue("5")).toBeInTheDocument();
  });

  it("should set URL collection index parameter when changing collection", async () => {
    renderWithProviders(<Collection />);

    const previousButton = screen.getByText("<");
    fireEvent.click(previousButton);

    expect(global.window.location.href).toContain("/4");
  });
});
