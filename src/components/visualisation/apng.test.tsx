import { screen} from "@testing-library/react";
import { renderWithProviders } from "utils/test-utils";
import APNGViewer from "components/visualisation/apng";
import { server } from "mocks/server";
import { rest } from "msw";

global.URL.createObjectURL = jest.fn(() => "http://localhost/noimage.png");

describe("APNG", () => {
  it("should render valid png image", async () => {
    renderWithProviders(<APNGViewer src='tomograms/1/movie' />);
    await screen.findByLabelText("Frame Image");
  });

  it("should display message when no image data is available", async () => {
    server.use(rest.get("http://localhost/tomograms/:tomogramId/movie", (req, res, ctx) => res.once(ctx.status(404))));
    renderWithProviders(<APNGViewer src='tomograms/2/movie' />);
    await screen.findByText("No Image Data Available");
  });
});
