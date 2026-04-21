import MolstarWrapper from "components/molstar/MolstarTomogram";
import { renderWithProviders } from "utils/test-utils";
import { screen } from "@testing-library/react";
import { server } from "mocks/server";
import { http, HttpResponse } from "msw";

vi.mock("molstar/lib/mol-canvas3d/canvas3d");
vi.mock("molstar/lib/mol-plugin/context");
vi.mock("molstar/lib/mol-plugin/spec");

describe("Molstar Wrapper", () => {
  afterAll(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("should display message if no features are available", async () => {
    server.use(
      http.get("http://localhost/tomograms/:id/features", () =>
        HttpResponse.json({}, { status: 404 })
      )
    );

    renderWithProviders(<MolstarWrapper tomogramId={1} />);
    await screen.findByText("No Valid Volume File");
  });
});
