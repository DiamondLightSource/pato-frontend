import MolstarWrapper from "components/molstar/molstar";
import { renderWithProviders } from "utils/test-utils";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { server } from "mocks/server";
import { rest } from "msw";
import { downloadBuffer } from "utils/api/response";

jest.mock("utils/api/response", () => ({ downloadBuffer: jest.fn() }));
jest.mock("molstar/lib/mol-canvas3d/canvas3d");
jest.mock("molstar/lib/mol-plugin/context");
jest.mock("molstar/lib/mol-plugin/spec");

describe("Molstar Wrapper", () => {
  afterAll(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    jest.resetModules()
  });

  it("should display message if no volume file is available", async () => {
    renderWithProviders(<MolstarWrapper autoProcId={1} classId={1} />);
    await screen.findByText("No Valid Volume File");
  });

  it("should display render canvas when data is available", async () => {
    server.use(
      rest.get("http://localhost/autoProc/:autoProcId/classification/:classId/image", (req, res, ctx) =>
        res.once(ctx.status(200), ctx.body("A"), ctx.set("Content-Type", "application/marc"))
      )
    );

    renderWithProviders(<MolstarWrapper autoProcId={1} classId={1} />);
    await screen.findByTestId("render-canvas");
  });

  it("should download array buffer data when requested", async () => {
    server.use(
      rest.get("http://localhost/autoProc/:autoProcId/classification/:classId/image", (req, res, ctx) =>
        res.once(ctx.status(200), ctx.body("A"), ctx.set("Content-Type", "application/marc"))
      )
    );

    renderWithProviders(<MolstarWrapper autoProcId={1} classId={1} />);
    const downloadButton = await screen.findByLabelText("Download File");
    await waitFor(() => expect(downloadButton).not.toHaveAttribute("disabled"));
    fireEvent.click(downloadButton);
    await waitFor(() => expect(downloadBuffer).toBeCalled());
  });
});
