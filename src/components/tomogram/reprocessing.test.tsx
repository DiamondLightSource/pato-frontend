import { waitFor, screen, fireEvent } from "@testing-library/react";
import { rest } from "msw";
import { server } from "mocks/server";
import { renderWithRoute } from "utils/test-utils";
import TomogramReprocessing from "components/tomogram/reprocessing";

const mockToast = jest.fn();

jest.mock("@chakra-ui/react", () => ({
  ...jest.requireActual("@chakra-ui/react"),
  createStandaloneToast: () => ({ toast: mockToast }),
}));

describe("Tomogram Reprocessing", () => {
  it("should not close when not successful", async () => {
    const reprocessingCallback = jest.fn();
    server.use(
      rest.post("http://localhost/dataCollections/1/reprocessing/tomograms", (req, res, ctx) =>
        res.once(ctx.status(500), ctx.json({ detail: "some error message" }), ctx.delay(0))
      )
    );

    renderWithRoute(<TomogramReprocessing collectionId={1} onClose={reprocessingCallback} />);

    fireEvent.click(screen.getByText("Submit"));
    await waitFor(() => expect(mockToast).toHaveBeenCalled());
    expect(reprocessingCallback).not.toHaveBeenCalled();
  });

  it("should call close callback when successful", async () => {
    const reprocessingCallback = jest.fn();
    renderWithRoute(<TomogramReprocessing collectionId={1} onClose={reprocessingCallback} />);

    fireEvent.click(screen.getByText("Submit"));
    await waitFor(() => expect(reprocessingCallback).toHaveBeenCalled());
  });

  it("should use default pixel size if provided", () => {
    renderWithRoute(<TomogramReprocessing pixelSize={5} collectionId={1} onClose={() => {}} />);

    expect(screen.getByDisplayValue("5")).toBeInTheDocument();
  });
});
