import { waitFor, screen, fireEvent } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "mocks/server";
import { renderWithRoute } from "utils/test-utils";
import TomogramReprocessing from "components/tomogram/reprocessing";
import { mockToast } from "../../../vitest.setup";

describe("Tomogram Reprocessing", () => {
  it("should not close when not successful", async () => {
    const reprocessingCallback = vi.fn();
    server.use(
      http.post(
        "http://localhost/dataCollections/1/reprocessing/tomograms",
        () => HttpResponse.json({ detail: "some error message" }, { status: 500 }),
        { once: true }
      )
    );

    renderWithRoute(<TomogramReprocessing collectionId={1} onClose={reprocessingCallback} />);

    fireEvent.click(screen.getByText("Submit"));
    await waitFor(() => expect(mockToast).toHaveBeenCalled());
    expect(reprocessingCallback).not.toHaveBeenCalled();
  });

  it("should call close callback when successful", async () => {
    const reprocessingCallback = vi.fn();
    renderWithRoute(<TomogramReprocessing collectionId={1} onClose={reprocessingCallback} />);

    fireEvent.click(screen.getByText("Submit"));
    await waitFor(() => expect(reprocessingCallback).toHaveBeenCalled());
  });

  it("should use default pixel size if provided", () => {
    renderWithRoute(<TomogramReprocessing pixelSize={5} collectionId={1} onClose={() => {}} />);

    expect(screen.getByDisplayValue("5")).toBeInTheDocument();
  });
});
