import { renderWithProviders } from "utils/test-utils";
import { screen } from "@testing-library/react";
import { JobParamsDrawer } from "./jobParams";
import { server } from "mocks/server";
import { http, HttpResponse } from "msw";

describe("Job Parameters Drawer", () => {
  it("should display job parameters", async () => {
    renderWithProviders(<JobParamsDrawer procJobId={1} onClose={() => {}} />);

    await screen.findByText(/do_class2d/i);
    expect(screen.getByText(/do_class3d/i)).toBeInTheDocument();
  });

  it("should display empty list if backend returns 404", async () => {
    server.use(
      http.get(
        "http://localhost/processingJob/1/parameters",
        () => HttpResponse.json({}, { status: 404 }),
        { once: true }
      )
    );

    renderWithProviders(<JobParamsDrawer procJobId={1} onClose={() => {}} />);

    await screen.findByText(/processing parameters/i);
  });
});
