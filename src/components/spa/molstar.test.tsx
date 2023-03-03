import MolstarWrapper from "./molstar";
import { renderWithProviders } from "../../utils/test-utils";
import { screen } from "@testing-library/react";
import { server } from "../../mocks/server";
import { rest } from "msw";

describe("Molstar Wrapper", () => {
  it("should display message if no volume file is available", async () => {
    server.use(
      rest.get("http://localhost/autoProc/:autoProcId/classification/:classId/image", (req, res, ctx) => {
        return res.once(ctx.status(404));
      })
    );

    renderWithProviders(<MolstarWrapper autoProcId={1} classificationId={1} />);
    await screen.findByText("No Valid Volume File");
  });

  it("should display render canvas when data is available", async () => {
    server.use(
      rest.get("http://localhost/autoProc/:autoProcId/classification/:classId/image", (req, res, ctx) => {
        return res.once(ctx.status(200), ctx.body("A"), ctx.set("Content-Type", "application/marc"));
      })
    );

    renderWithProviders(<MolstarWrapper autoProcId={1} classificationId={1} />);
    await screen.findByTestId("render-canvas");
  });
});
