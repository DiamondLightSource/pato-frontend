import { MolstarModal } from "./molstarModal";
import { renderWithProviders } from "../../utils/test-utils";
import { fireEvent, screen } from "@testing-library/react";
import { server } from "../../mocks/server";
import { rest } from "msw";

describe("Molstar Wrapper", () => {
  it("should fire callback if page changes", async () => {
    server.use(
      rest.get("http://localhost/autoProc/:autoProcId/classification/:classId/image", (req, res, ctx) => {
        return res.once(ctx.status(404));
      })
    );

    const pageCallback = jest.fn();

    renderWithProviders(<MolstarModal autoProcId={1} defaultIndex={1} defaultSort='class' onChange={pageCallback} />);
    fireEvent.click(screen.getByText("Open 3D Visualisation"));
    fireEvent.click(await screen.findByLabelText("Next Page"));

    expect(pageCallback).toHaveBeenCalledWith(2);
  });

  it("should not display Molstar renderer if no classification data is available", async () => {
    server.use(
      rest.get("http://localhost/autoProc/:autoProcId/classification", (req, res, ctx) => {
        return res.once(ctx.status(404));
      })
    );

    renderWithProviders(<MolstarModal autoProcId={1} defaultIndex={1} defaultSort='class' />);

    fireEvent.click(screen.getByText("Open 3D Visualisation"));
    await screen.findByText("No Classification Data");
  });
});
