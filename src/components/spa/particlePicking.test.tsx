import { ParticlePicking } from "components/spa/particlePicking";
import { renderWithProviders } from "utils/test-utils";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { server } from "mocks/server";
import { http, HttpResponse } from "msw";

describe("Particle Picking", () => {
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
      http.get(
        "http://localhost/autoProc/:procId/particlePicker",
        () => HttpResponse.json({}, { status: 404 }),
        {
          once: true,
        }
      )
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

  it("should use inner total if current page is uncoupled from motion correction", async () => {
    renderWithProviders(<ParticlePicking autoProcId={2} page={12} total={150} />);

    await waitFor(() => expect(screen.getByLabelText("Total Pages")).toHaveTextContent("150"));

    const checkbox = await screen.findByLabelText("Lock Pages with Motion Correction");
    fireEvent.click(checkbox);

    await waitFor(() => expect(screen.getByLabelText("Total Pages")).toHaveTextContent("3"));
  });

  it("should use standard deviation to base graph domain", async () => {
    renderWithProviders(<ParticlePicking autoProcId={2} page={12} total={150} />);

    await screen.findByText("7.4");
    screen.getByText("2.7");
  });

  it("should set graph domain min to 1 if calculated min/max is less than 1", async () => {
    server.use(
      http.get(
        "http://localhost/movies/:movieId/iceThickness",
        () => {
          const dummy = { minimum: 3000, maximum: 10000, median: 5000, q1: 3, q3: 6 };
          return HttpResponse.json({ current: dummy, avg: { ...dummy, stddev: 10000 } });
        },
        { once: true }
      )
    );

    renderWithProviders(<ParticlePicking autoProcId={2} page={12} total={150} />);

    const elements = await screen.findAllByText("1");
    expect(elements).toHaveLength(3);
  });
});
