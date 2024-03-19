import { renderWithProviders } from "utils/test-utils";
import { screen } from "@testing-library/react";
import { JobParamsDrawer } from "./jobParams";
import { server } from "mocks/server";
import { rest } from "msw";

describe("Job Parameters Drawer", () => {
  it("should display job parameters", async () => {
    renderWithProviders(<JobParamsDrawer procJobId={1} onClose={() => {}} />);

    await screen.findByText(/do_class2d/i);
    expect(screen.getByText(/do_class3d/i)).toBeInTheDocument();
  });

  it("should display empty list if backend returns 404", async () => {
    server.use(
      rest.get("http://localhost/processingJob/1/parameters", (req, res, ctx) =>
        res.once(ctx.status(404), ctx.delay(0))
      )
    );

    renderWithProviders(<JobParamsDrawer procJobId={1} onClose={() => {}} />);

    await screen.findByText(/processing parameters/i);
  });
});
