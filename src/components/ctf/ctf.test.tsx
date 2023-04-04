import { screen } from "@testing-library/react";
import { renderWithProviders } from "utils/test-utils";
import { CTF } from "components/ctf/ctf";
import { server } from "mocks/server";
import { rest } from "msw";

describe("CTF", () => {
  it("should render when tomogram is parent", async () => {
    renderWithProviders(<CTF parentType='tomograms' parentId={3} />);
    await screen.findByText("Resolution");
    expect(screen.getAllByTestId("graph-svg").length).toBe(3);
  });

  it("should render when autoproc program is parent", async () => {
    renderWithProviders(<CTF parentType='autoProc' parentId={3} />);
    await screen.findByText("Resolution");
    expect(screen.getAllByTestId("graph-svg").length).toBe(3);
  });

  it("should display message when no data is present", async () => {
    server.use(
      rest.get("http://localhost/tomograms/:id/ctf", (req, res, ctx) =>
        res.once(
          ctx.status(200),
          ctx.delay(0),
          ctx.json({
            items: [],
          })
        )
      )
    );

    renderWithProviders(<CTF parentType='tomograms' parentId={1} />);
    await screen.findByText("Resolution");
    expect(screen.getAllByText("No Data Available").length).toBe(3);
  });
});
