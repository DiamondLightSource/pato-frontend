import { renderWithProviders } from "utils/test-utils";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { SearchMap } from "components/atlas/SearchMap";
import { server } from "mocks/server";
import { http, HttpResponse } from "msw";
import { mockToast } from "../../../vitest.setup";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Search Map", () => {
  it("should redirect user to tomogram if tomogram is clicked", async () => {
    renderWithProviders(<SearchMap searchMapId={1} scalingFactor={0.5} />);

    const area = await screen.findByTestId("item-0");
    fireEvent.click(area);

    await waitFor(() => expect(mockNavigate).toHaveBeenCalled());
  });

  it("should display message if no search map ID is provided", async () => {
    renderWithProviders(<SearchMap searchMapId={null} scalingFactor={0.5} />);

    expect(
      screen.getByText(
        "No search map selected. Select one by clicking one of the squares on the atlas."
      )
    );
  });

  it("should display message if no tomograms are available", async () => {
    server.use(
      http.get(
        "http://localhost/grid-squares/:gridSquareId/tomograms",
        () => HttpResponse.json({}, { status: 404 }),
        {
          once: true,
        }
      )
    );

    renderWithProviders(<SearchMap searchMapId={1} scalingFactor={0.5} />);

    await screen.findByText("No tomograms available");
  });

  it("should display message if there's no data for the selected tomogram", async () => {
    server.use(
      http.get(
        "http://localhost/dataCollections/:dataCollectionId",
        () => HttpResponse.json({}, { status: 404 }),
        {
          once: true,
        }
      )
    );

    renderWithProviders(<SearchMap searchMapId={1} scalingFactor={0.5} />);

    const area = await screen.findByTestId("item-0");
    fireEvent.click(area);
    await waitFor(() =>
      expect(mockToast).toBeCalledWith(
        expect.objectContaining({ description: "Could not get tomogram information" })
      )
    );
  });

  it("should resize tomograms appropriately", async () => {
    renderWithProviders(<SearchMap searchMapId={1} scalingFactor={0.01} />);

    const area = await screen.findByTestId("item-0");

    expect(area).toHaveAttribute("x", expect.stringContaining("7."));
    expect(area).toHaveAttribute("y", expect.stringContaining("9."));
    expect(area).toHaveAttribute("width", "5");
    expect(area).toHaveAttribute("height", "1");
  });

  it("should not render tomograms with missing attributes", async () => {
    server.use(
      http.get(
        "http://localhost/grid-squares/:gridSquareId/tomograms",
        () =>
          HttpResponse.json({
            items: [
              {
                tomogramId: 500,
                pixelLocationX: 150,
                pixelLocationY: 150,
                sizeX: 500,
                sizeY: 100,
                pixelSpacing: 1,
              },
              {
                tomogramId: 500,
                pixelLocationX: 150,
                pixelLocationY: 150,
                pixelSpacing: 1,
              },
            ],
          }),
        { once: true }
      )
    );
    renderWithProviders(<SearchMap searchMapId={1} scalingFactor={0.01} />);

    await screen.findByTestId("item-0");
    expect(screen.queryByTestId("item-1")).not.toBeInTheDocument();
  });
});
