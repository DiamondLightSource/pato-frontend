import { ParticlePicking } from "./particlePicking";
import React from "react";
import { renderWithProviders } from "../../utils/test-utils";
import { fireEvent, screen, waitFor } from "@testing-library/react";

describe("Particle Picking", () => {
  window.URL.createObjectURL = jest.fn();
  it("should display last page as default", () => {
    renderWithProviders(<ParticlePicking autoProcId={1} page={undefined} total={150} />);
    expect(screen.getByLabelText("Current Page")).toHaveValue("150");
  });

  it("should lock pages with motion correction by default", () => {
    renderWithProviders(<ParticlePicking autoProcId={1} page={12} total={150} />);

    expect(screen.getByLabelText("Current Page")).toBeDisabled();
    expect(screen.getByLabelText("Current Page")).toHaveValue("12");
  });

  it("should allow user to detach current page from motion correction page", () => {
    renderWithProviders(<ParticlePicking autoProcId={1} page={12} total={150} />);

    const checkbox = screen.getByLabelText("Lock Pages with Motion Correction");

    fireEvent.click(checkbox);
    expect(screen.getByLabelText("Current Page")).toBeEnabled();
  });

  it("should display message when no particle picking data exists", () => {
    renderWithProviders(<ParticlePicking autoProcId={1} page={12} total={150} />);

    expect(screen.getByText("No Particle Picking Data Found")).toBeInTheDocument();
  });

  it("should display information if valid data is returned", async () => {
    renderWithProviders(<ParticlePicking autoProcId={2} page={12} total={150} />);

    await waitFor(() => {
      expect(screen.getByText("9999")).toBeInTheDocument();
    });
  });
});
