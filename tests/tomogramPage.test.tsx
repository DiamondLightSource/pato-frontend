import { fireEvent, screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../src/utils/test-utils";
import Tomogram from "../src/routes/Tomogram";
import React from "react";

describe("Tomogram", () => {
  it("should display title with proposals, collection, group and visit", () => {
    renderWithProviders(<Tomogram />);
    expect(screen.getByText("Data Collection #5")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Proposal cm-31111 , visit 5000 , data collection group 2000" })
    ).toBeInTheDocument();
  });

  it("should display collection data", async () => {
    renderWithProviders(<Tomogram />);
    await expect(screen.findByText("1 kV")).resolves.toBeInTheDocument();
    expect(screen.getByText("50 μm")).toBeInTheDocument();
  });

  it("should display placeholder message if not data collection is found", async () => {
    renderWithProviders(<Tomogram />);
    await expect(screen.findByText("Data collection group has no data collections")).resolves.toBeInTheDocument();
  });

  it("should set default page to URL collection index parameter", () => {
    renderWithProviders(<Tomogram />);
    expect(screen.getByLabelText("Current Page").getAttribute("value")).toEqual("5");
  });

  it("should set URL collection index parameter when changing collection", async () => {
    renderWithProviders(<Tomogram />);

    const previousButton = screen.getByText("<");
    fireEvent.click(previousButton);

    expect(global.window.location.href).toContain("/4");
  });

  it("should reset page after opting for only collections with tomograms to be shown if old page number is not valid", async () => {
    renderWithProviders(<Tomogram />);

    expect(screen.getByLabelText("Current Page").getAttribute("value")).toEqual("5");

    const tomogramCheckbox = screen.getByText("Only show processed tomograms");
    fireEvent.click(tomogramCheckbox);

    await waitFor(() => {
      expect(global.window.location.href).toContain("/1");
    });
  });
});
