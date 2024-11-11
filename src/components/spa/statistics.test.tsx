import Statistics from "components/spa/statistics";
import { renderWithProviders } from "utils/test-utils";
import { screen } from "@testing-library/react";
import { server } from "mocks/server";
import { http, HttpResponse } from "msw";

describe("Collection Statistics", () => {
  it("should display data when available", async () => {
    renderWithProviders(<Statistics dataCollectionId={1} />);

    await screen.findByText("Estimated Resolution");
    await screen.findByText("Total Motion");
    await screen.findByText("Particle count at different defoci");
  });

  it("should display message if at least one histogram endpoint fails", async () => {
    server.use(
      http.get(
        "http://localhost/dataCollections/:collectionId/totalMotion",
        () => HttpResponse.json({}, { status: 404 }),
        { once: true }
      )
    );

    renderWithProviders(<Statistics dataCollectionId={1} />);

    await screen.findByText("No Frequency Data Available");
  });

  it("should display message if at least one CTF endpoint fails", async () => {
    server.use(
      http.get(
        "http://localhost/dataCollections/:collectionId/ctf",
        () => HttpResponse.json({}, { status: 404 }),
        {
          once: true,
        }
      )
    );

    renderWithProviders(<Statistics dataCollectionId={1} />);

    await screen.findByText("No CTF Data Available");
  });
});
