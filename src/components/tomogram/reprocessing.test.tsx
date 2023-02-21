import { waitFor, screen, fireEvent } from "@testing-library/react";
import { rest } from "msw";
import { server } from "../../mocks/server";
import { renderWithProviders } from "../../utils/test-utils";
import { TomogramReprocessing } from "./reprocessing";

describe("Tomogram Reprocessing", () => {
  it("should not close when not successful", async () => {
    const reprocessingCallback = jest.fn();
    server.use(
      rest.post("http://localhost/dataCollections/:collectionId/tomograms/reprocessing", (req, res, ctx) => {
        return res.once(ctx.status(500), ctx.json({ detail: "some error message" }), ctx.delay(0));
      })
    );

    renderWithProviders(<TomogramReprocessing collectionId={1} onClose={reprocessingCallback} />);

    fireEvent.click(screen.getByText("Submit"));
    expect(reprocessingCallback).not.toBeCalled();
  });

  it("should call close callback when successful", async () => {
    const reprocessingCallback = jest.fn();
    server.use(
      rest.post("http://localhost/dataCollections/:collectionId/tomograms/reprocessing", (req, res, ctx) => {
        return res.once(ctx.status(202), ctx.json({ processingJobId: 1 }));
      })
    );

    renderWithProviders(<TomogramReprocessing collectionId={1} onClose={reprocessingCallback} />);

    fireEvent.click(screen.getByText("Submit"));
    await waitFor(() => expect(reprocessingCallback).toBeCalled());
  });

  it("should use default pixel size if provided", async () => {
    const reprocessingCallback = jest.fn();
    server.use(
      rest.post("http://localhost/dataCollections/:collectionId/tomograms/reprocessing", (req, res, ctx) => {
        return res.once(ctx.status(202), ctx.json({ processingJobId: 1 }));
      })
    );

    renderWithProviders(<TomogramReprocessing pixelSize={5} collectionId={1} onClose={reprocessingCallback} />);

    expect(screen.getByDisplayValue("5")).toBeInTheDocument();
  });
});
