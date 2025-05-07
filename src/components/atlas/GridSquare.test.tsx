import { renderWithProviders, renderWithRoute } from "utils/test-utils";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { GridSquare } from "components/atlas/GridSquare";
import { server } from "mocks/server";
import { http, HttpResponse } from "msw";

describe("Grid Square", () => {
  it("should display movies if foil hole selected", async () => {
    renderWithProviders(<GridSquare gridSquareId={1} />);

    const gridSquare = await screen.findByRole("button");

    fireEvent.click(gridSquare);

    await screen.findByLabelText("500");
  });

  it("should display message if no foil holes are available", async () => {
    server.use(
      http.get(
        "http://localhost/grid-squares/:gridSquareId/foil-holes",
        () => HttpResponse.json({}, { status: 404 }),
        { once: true }
      )
    );

    renderWithProviders(<GridSquare gridSquareId={1} />);

    await screen.findByText("No foil holes available");
  });

  it("should display message if no grid square is selected", () => {
    renderWithProviders(<GridSquare gridSquareId={null} />);

    expect(screen.getByText(/no grid square selected/i)).toBeInTheDocument();
  });

  it("should display message if no foil hole is selected", async () => {
    renderWithProviders(<GridSquare gridSquareId={1} />);

    await screen.findByText("No foil hole selected");
  });

  it("should display message if no movies are available", async () => {
    server.use(
      http.get(
        "http://localhost/foil-holes/:foilHoleId/movies",
        () => HttpResponse.json({}, { status: 404 }),
        { once: true }
      )
    );

    renderWithProviders(<GridSquare gridSquareId={1} />);

    const gridSquare = await screen.findByRole("button");
    fireEvent.click(gridSquare);

    await screen.findByText("No movies available");
  });

  it("should toggle the search params", async () => {
    const { router } = renderWithRoute(<GridSquare gridSquareId={1} />, () => ({ foilHoles: [] }), [
      "?hideHoles=true",
    ]);

    const checkbox = await screen.findByLabelText("Hide uncollected foil holes");

    fireEvent.click(checkbox);
    await waitFor(() => expect(router.state.location.search).toBe("?hideHoles=false"));
    fireEvent.click(checkbox);
    await waitFor(() => expect(router.state.location.search).toBe("?hideHoles=true"));
  });
});
