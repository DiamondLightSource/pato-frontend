import { screen } from "@testing-library/react";
import { renderWithProviders } from "utils/test-utils";
import { CTF } from "components/ctf/ctf";

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
});
