import { screen } from "@testing-library/react";
import { rest } from "msw";
import { renderWithProviders } from "../utils/test-utils";
import { server } from "../mocks/server";
import { Home } from "./Home";

describe("Home", () => {
  it("should display message and button if not logged in", async () => {
    server.use(
      rest.get("http://localhost/sessions", (req, res, ctx) => {
        return res.once(ctx.status(401), ctx.delay(0));
      })
    );

    renderWithProviders(<Home />);

    await screen.findByText("You must be logged in to view recent sessions");
  });

  it("should render cards with data when possible", async () => {
    server.use(
      rest.get("http://localhost/sessions", (req, res, ctx) => {
        return res.once(
          ctx.status(200),
          ctx.delay(0),
          ctx.json({
            items: [
              {
                beamLineName: "m01",
                visit_number: 1,
                parentProposal: "cm31111",
                startDate: "2023-07-21T09:00",
                endDate: "2023-07-21T09:00",
              },
            ],
          })
        );
      })
    );

    renderWithProviders(<Home />);

    await screen.findByText("cm31111-1");
    screen.getByText("m01");
  });

  it("should render beamline operator name alongside hyphen if available", async () => {
    server.use(
      rest.get("http://localhost/sessions", (req, res, ctx) => {
        return res.once(
          ctx.status(200),
          ctx.delay(0),
          ctx.json({
            items: [
              {
                beamLineName: "m01",
                beamLineOperator: "Dr. John Doe",
                visit_number: 1,
                parentProposal: "cm31111",
                startDate: "2023-07-21T09:00",
                endDate: "2023-07-21T09:00",
              },
            ],
          })
        );
      })
    );

    renderWithProviders(<Home />);

    await screen.findByText("cm31111-1");
    screen.getByText("m01 - Dr. John Doe");
  });

  it("should render visit number as ? when not present", async () => {
    server.use(
      rest.get("http://localhost/sessions", (req, res, ctx) => {
        return res.once(
          ctx.status(200),
          ctx.delay(0),
          ctx.json({
            items: [
              {
                parentProposal: "cm31111",
                startDate: "2023-07-21T09:00",
                endDate: "2023-07-21T09:00",
              },
            ],
          })
        );
      })
    );

    renderWithProviders(<Home />);

    await screen.findByText("cm31111-?");
  });
});
