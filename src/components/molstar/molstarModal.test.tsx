import { MolstarModal } from "components/molstar/molstarModal";
import { renderWithProviders } from "utils/test-utils";
import { fireEvent, screen } from "@testing-library/react";

vi.mock("components/molstar/molstar", () => ({
  default: () => <p>Molstar SPA</p>,
}));

vi.mock("components/molstar/MolstarTomogram", () => ({
  default: () => <p>Molstar Tomogram</p>,
}));

describe("Molstar Modal", () => {
  afterAll(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("should display tomogram Molstar if tomogram ID is passed", async () => {
    renderWithProviders(<MolstarModal tomogramId={1} />);
    fireEvent.click(screen.getByRole("button"));

    await screen.findByText("Molstar Tomogram");
  });

  it("should display SPA Molstar if autoproc ID is passed", async () => {
    renderWithProviders(<MolstarModal autoProcId={1} classId={1} />);
    fireEvent.click(screen.getByRole("button"));

    await screen.findByText("Molstar SPA");
  });
});
