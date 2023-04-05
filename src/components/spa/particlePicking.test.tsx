import { ParticlePicking } from "components/spa/particlePicking";
import { renderWithProviders } from "utils/test-utils";
import { fireEvent, screen } from "@testing-library/react";
import { server } from "mocks/server";
import { rest } from "msw";

describe("Particle Picking", () => {
  beforeAll(() => {
    jest.spyOn(window.URL, "createObjectURL");
  });
  afterAll(() => {
    jest.restoreAllMocks();
  });
  it("should display last page as default", () => {
    renderWithProviders(<ParticlePicking autoProcId={1} page={undefined} total={150} />);
    expect(screen.getByLabelText("Current Page")).toHaveValue("150");
  });

  it("should lock pages with motion correction by default", () => {
    renderWithProviders(<ParticlePicking autoProcId={1} page={12} total={150} />);

    expect(screen.getByLabelText("Current Page")).toBeDisabled();
    expect(screen.getByLabelText("Current Page")).toHaveValue("12");
  });

  it("should allow user to detach current page from motion correction page", () => {
    renderWithProviders(<ParticlePicking autoProcId={1} page={12} total={150} />);

    const checkbox = screen.getByLabelText("Lock Pages with Motion Correction");

    fireEvent.click(checkbox);
    expect(screen.getByLabelText("Current Page")).toBeEnabled();
  });

  it("should display message when no particle picking data exists", async () => {
    server.use(
      rest.get("http://localhost/autoProc/:procId/particlePicker", (req, res, ctx) => res.once(ctx.status(404)))
    );
    renderWithProviders(<ParticlePicking autoProcId={3} page={12} total={150} />);

    await screen.findByText("No Particle Picking Data Found");
  });

  it("should display information if valid data is returned", async () => {
    renderWithProviders(<ParticlePicking autoProcId={2} page={12} total={150} />);

    await screen.findByText("9999");
  });

  it("should render ice thickness data if available", async () => {
    renderWithProviders(<ParticlePicking autoProcId={2} page={12} total={150} />);

    await screen.findByText("Relative Ice Thickness");
  });
});
