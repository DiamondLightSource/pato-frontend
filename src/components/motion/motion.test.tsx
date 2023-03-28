import { Motion } from "./motion";
import { renderWithProviders } from "utils/test-utils";
import { screen, waitFor } from "@testing-library/react";
import { server } from "mocks/server";
import { rest } from "msw";

describe("Motion", () => {
  window.URL.createObjectURL = jest.fn();
  it("should display message when no tilt alignment data is present", async () => {
    renderWithProviders(<Motion parentType='dataCollections' parentId={2} />);
    await screen.findByText("No tilt alignment data available");
  });

  it("should display raw image count when no tilt. align. is present", async () => {
    renderWithProviders(<Motion parentType='dataCollections' parentId={2} />);
    await expect(screen.findByLabelText("Total Pages")).resolves.toHaveTextContent("10");
  });

  it("should display enabled comments button when comments are present", async () => {
    renderWithProviders(<Motion parentType='tomograms' parentId={3} />);

    await screen.findByText("20");
    await expect(screen.findByTestId("comment")).resolves.toBeEnabled();
  });

  it("should call callback when first motion changes", async () => {
    const motionChanged = jest.fn();
    renderWithProviders(<Motion parentType='tomograms' onMotionChanged={motionChanged} parentId={3} />);
    await waitFor(() => expect(motionChanged).toBeCalled());
  });

  it("should display message when no data is available", async () => {
    server.use(rest.get("http://localhost/dataCollections/:id/motion", (req, res, ctx) => res.once(ctx.status(404))));

    renderWithProviders(<Motion parentType='dataCollections' parentId={9} />);
    await waitFor(() => screen.findByText("No Motion Correction Data Available"));
  });

  it("should call callback when total number of items changes", async () => {
    const totalChanged = jest.fn();
    renderWithProviders(<Motion parentType='tomograms' onTotalChanged={totalChanged} parentId={3} />);

    await waitFor(() => expect(totalChanged).toBeCalled());
  });

  it("should respect current page prop if passed", async () => {
    const totalChanged = jest.fn();
    renderWithProviders(<Motion currentPage={5} parentType='tomograms' onTotalChanged={totalChanged} parentId={3} />);

    expect(await screen.findByLabelText("Current Page")).toHaveValue("5");
  });

  it("displays '?' if passed values for raw total and total include NaN", async () => {
    renderWithProviders(<Motion parentType='tomograms' parentId={4} />);
    await screen.findByRole("heading", { name: "?" });
  });
});
