import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { queryClient, renderWithRoute } from "utils/test-utils";
import { server } from "mocks/server";
import { Home } from "routes/Home";
import { sessionLoader } from "loaders/sessions";

describe("Home", () => {
  it("should display message and button if not logged in", async () => {
    server.use(
      http.get("http://localhost/sessions", () => HttpResponse.json({}, { status: 401 }), {
        once: true,
      })
    );

    renderWithRoute(<Home />, sessionLoader(queryClient));

    await screen.findByText("You must be logged in to view recent sessions");
  });

  it("should render cards with data when possible", async () => {
    server.use(
      http.get("http://localhost/sessions", () =>
        HttpResponse.json({
          items: [
            {
              sessionId: 1,
              beamLineName: "m01",
              visit_number: 1,
              parentProposal: "cm31111",
              startDate: "2023-07-21T09:00",
              endDate: "2023-07-21T09:00",
            },
          ],
        })
      )
    );

    renderWithRoute(<Home />, sessionLoader(queryClient));

    await screen.findAllByText(/cm31111-1/i);
    expect(screen.getAllByText("m01").length).toBe(2);
  });

  it("should render beamline operator name alongside hyphen if available", async () => {
    server.use(
      http.get("http://localhost/sessions", () =>
        HttpResponse.json({
          items: [
            {
              sessionId: 1,
              beamLineName: "m01",
              beamLineOperator: "Dr. John Doe",
              visit_number: 1,
              parentProposal: "cm31111",
              startDate: "2023-07-21T09:00",
              endDate: "2023-07-21T09:00",
            },
          ],
        })
      )
    );

    renderWithRoute(<Home />, sessionLoader(queryClient));

    await screen.findAllByText(/cm31111-1/i);
    expect(screen.getAllByText("m01 - Dr. John Doe").length).toBe(2);
  });

  it("should render visit number as ? when not present", async () => {
    server.use(
      http.get("http://localhost/sessions", () =>
        HttpResponse.json({
          items: [
            {
              sessionId: 1,
              parentProposal: "cm31111",
              startDate: "2023-07-21T09:00",
              endDate: "2023-07-21T09:00",
            },
          ],
        })
      )
    );

    renderWithRoute(<Home />, sessionLoader(queryClient));

    await screen.findAllByText(/cm31111-?/i);
  });

  it("should display message when no sessions are available", async () => {
    server.use(
      http.get("http://localhost/sessions", () =>
        HttpResponse.json({
          items: [],
        })
      )
    );

    renderWithRoute(<Home />, sessionLoader(queryClient));

    await screen.findByText("No Recent Sessions Found");
    await screen.findByText("No Current Sessions Found");
  });
});
