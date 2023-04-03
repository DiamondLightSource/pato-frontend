import { Motion } from "./motion";
import { renderWithProviders } from "utils/test-utils";
import { fireEvent, screen, waitFor } from "@testing-library/react";
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

    await screen.findAllByText("20");
    await expect(screen.findByTestId("comment")).resolves.toBeEnabled();
  });

  it("should call callback when page changes", async () => {
    const motionChanged = jest.fn();
    renderWithProviders(<Motion parentType='tomograms' onPageChanged={motionChanged} parentId={3} />);

    await waitFor(() => expect(screen.getByLabelText("Current Page")).toHaveAttribute("value", "10"));
    fireEvent.click(screen.getByLabelText("Next Page"));

    await waitFor(() => expect(motionChanged).toBeCalledWith(11));
  });

  it("should calculate number of dark images appropriately", async () => {
    const motionChanged = jest.fn();
    renderWithProviders(<Motion parentType='tomograms' onPageChanged={motionChanged} parentId={1} />);

    await screen.findByText("Dark Images: 10");
  });

  it("should change page internally if no external control is used", async () => {
    renderWithProviders(<Motion parentType='tomograms' parentId={3} />);

    await waitFor(() => expect(screen.getByLabelText("Current Page")).toHaveAttribute("value", "10"));
    fireEvent.click(screen.getByLabelText("Next Page"));

    await waitFor(() => expect(screen.getByLabelText("Current Page")).toHaveAttribute("value", "11"));
  });

  it("should display message when no data is available", async () => {
    server.use(rest.get("http://localhost/dataCollections/:id/motion", (req, res, ctx) => res.once(ctx.status(404))));
    renderWithProviders(<Motion parentType='dataCollections' parentId={9} />);

    await waitFor(() => screen.findByText("No Motion Correction Data Available"));
  });

  it("should call callback when total number of items changes", async () => {
    const totalChanged = jest.fn();
    renderWithProviders(<Motion parentType='tomograms' onTotalChanged={totalChanged} parentId={3} />);

    await waitFor(() => expect(totalChanged).toBeCalledWith(20));
  });

  it("displays '?' if passed values for raw total and total include NaN", async () => {
    renderWithProviders(<Motion parentType='tomograms' parentId={4} />);
    await screen.findByRole("heading", { name: "?" });
  });

  it("should update current page if external control variable changes", async () => {
    const { rerender } = renderWithProviders(<Motion parentType='tomograms' parentId={4} page={1} />);
    await waitFor(() => expect(screen.getByLabelText("Current Page")).toHaveAttribute("value", "1"));

    rerender(<Motion parentType='tomograms' parentId={4} page={2} />);
    await waitFor(() => expect(screen.getByLabelText("Current Page")).toHaveAttribute("value", "2"));
  });

  it("should not update page if current page is controlled externally", async () => {
    const motionCallback = jest.fn();
    renderWithProviders(<Motion parentType='tomograms' parentId={4} page={1} onPageChanged={motionCallback} />);
    await waitFor(() => expect(screen.getByLabelText("Current Page")).toHaveAttribute("value", "1"));

    fireEvent.click(screen.getByLabelText("Next Page"));
    await waitFor(() => expect(motionCallback).toBeCalled());

    expect(screen.getByLabelText("Current Page")).not.toHaveAttribute("value", "2");
  });
});
