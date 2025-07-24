import { renderWithProviders, renderWithRoute } from "utils/test-utils";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { SearchMap } from "components/atlas/SearchMap";
import { server } from "mocks/server";
import { http, HttpResponse } from "msw";

describe("Search Map", () => {
  it("should redirect user to tomogram if tomogram is clicked", async () => {
    server.use(
      http.get(
        "http://localhost/grid-squares/:gridSquareId/tomograms",
        () => HttpResponse.json({}, { status: 404 }),
        { once: true }
      )
    );

    renderWithProviders(<SearchMap searchMapId={1} scalingFactor={0.5} groupId={1} />);

    await screen.findByText("No foil holes available");
  });

  it("should display message if no tomograms are available", async () => {
    server.use(
      http.get(
        "http://localhost/grid-squares/:gridSquareId/tomograms",
        () => HttpResponse.json({}, { status: 404 }),
        { once: true }
      )
    );

    renderWithProviders(<SearchMap searchMapId={1} scalingFactor={0.5} groupId={1} />);

    await screen.findByText("No tomograms available");
  });

  it("should resize tomograms appropriately", async () => {
    server.use(
      http.get(
        "http://localhost/grid-squares/:gridSquareId/foil-holes",
        () => HttpResponse.json({}, { status: 404 }),
        { once: true }
      )
    );

    renderWithProviders(<SearchMap searchMapId={1} scalingFactor={0.5} groupId={1} />);

    await screen.findByText("No tomograms available");
  });
});
