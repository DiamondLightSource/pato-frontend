import { screen } from "@testing-library/react";
import { renderWithProviders } from "utils/test-utils";
import APNGViewer from "components/visualisation/apng";
import { server } from "mocks/server";
import { rest } from "msw";

global.URL.createObjectURL = jest.fn(() => "http://localhost/noimage.png");

describe("APNG", () => {
  it("should render valid png image", async () => {
    renderWithProviders(<APNGViewer src='tomograms/1/movie' />);
    await screen.findByLabelText(/frame image/i);
  });

  it("should display message when no image data is available", async () => {
    server.use(
      rest.get("http://localhost/tomograms/:tomogramId/movie", (req, res, ctx) =>
        res.once(ctx.status(404))
      )
    );
    renderWithProviders(<APNGViewer src='tomograms/2/movie' />);
    await screen.findByText(/no image data available/i);
  });

  it("should display message when APNG file parsing fails", async () => {
    server.use(
      rest.get("http://localhost/tomograms/:tomogramId/movie", (req, res, ctx) =>
        res.once(
          ctx.status(200),
          ctx.set("Content-Type", "image/png"),
          ctx.body("notAValidAPNGImage"),
          ctx.delay(0),
          ctx.set("Content-Length", "18")
        )
      )
    );
    renderWithProviders(<APNGViewer src='tomograms/2/movie' />);
    await screen.findByText(/no image data available/i);
  });

  it("should display caption if provided", async () => {
    server.use(
      rest.get("http://localhost/tomograms/:tomogramId/movie", (req, res, ctx) =>
        res.once(ctx.status(404))
      )
    );
    renderWithProviders(<APNGViewer caption='Caption Text' src='tomograms/2/movie' />);
    await screen.findByText(/caption text/i);
  });
});
