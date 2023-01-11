import Motion from "../src/components/motion/motion";
import React from "react";
import { renderWithProviders } from "../src/utils/test-utils";
import { screen, waitFor } from "@testing-library/react";

describe("Motion", () => {
  window.URL.createObjectURL = jest.fn();
  it("should display message when no tilt alignment data is present", async () => {
    renderWithProviders(<Motion parentType='dataCollections' parentId={2} />);

    await waitFor(() => {
      expect(screen.getByText("No tilt alignment data available")).toBeInTheDocument();
    });
  });

  it("should display raw image count when no tilt. align. is present", async () => {
    renderWithProviders(<Motion parentType='dataCollections' parentId={2} />);

    await waitFor(() => {
      expect(screen.getByText("10")).toBeInTheDocument();
    });
  });

  it("should display comments button when comments are present", async () => {
    renderWithProviders(<Motion parentType='tomograms' parentId={3} />);

    await waitFor(() => {
      expect(screen.getByText("20")).toBeInTheDocument();
    });

    await expect(screen.findByTestId("comment")).resolves.toBeEnabled();
  });

  it("should call callback when first motion changes", async () => {
    const motionChanged = jest.fn();
    renderWithProviders(<Motion parentType='tomograms' onMotionChanged={motionChanged} parentId={3} />);

    await waitFor(() => {
      expect(motionChanged).toBeCalled();
    });
  });

  it("should call callback when total number of items changes", async () => {
    const totalChanged = jest.fn();
    renderWithProviders(<Motion parentType='tomograms' onTotalChanged={totalChanged} parentId={3} />);

    await waitFor(() => {
      expect(totalChanged).toBeCalled();
    });
  });
});
