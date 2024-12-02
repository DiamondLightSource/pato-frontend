import { renderWithProviders } from "utils/test-utils";
import { fireEvent, screen } from "@testing-library/react";
import { GridSquare } from "components/atlas/GridSquare";
import { server } from "mocks/server";
import { http, HttpResponse } from "msw";

describe("Atlas", () => {
  it("should display movies if foil hole selected", async () => {
    renderWithProviders(<GridSquare gridSquareId={1} />);

    const gridSquare = await screen.findByRole("button");

    fireEvent.click(gridSquare);

    await screen.findByText("500");
  });

  it("should make selected foil hole blue", async () => {
    renderWithProviders(<GridSquare gridSquareId={1} />);

    const gridSquare = await screen.findByRole("button");

    fireEvent.click(gridSquare);

    expect(gridSquare).toHaveAttribute("fill", "blue");
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
});
