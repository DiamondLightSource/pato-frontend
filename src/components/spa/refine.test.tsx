import { renderWithAccordion } from "utils/test-utils";
import { screen, waitFor } from "@testing-library/react";
import { RefinementStep } from "./refine";
import { http, HttpResponse } from "msw";
import { server } from "mocks/server";

describe("SPA Refinement Step", () => {
  it("should render B-factor plot", async () => {
    renderWithAccordion(<RefinementStep autoProcId={1} />);

    await waitFor(() => expect(screen.getAllByTestId("dot")).toHaveLength(1));
  });

  it("should render B-factor values", async () => {
    renderWithAccordion(<RefinementStep autoProcId={1} />);

    await waitFor(() => expect(screen.getByText("0.200")).toBeInTheDocument());
  });

  it("should render up to two 3D visualisations", async () => {
    renderWithAccordion(<RefinementStep autoProcId={1} />);

    await screen.findByText("Open 3D Visualisation (C8)");
    expect(screen.getByText("Open 3D Visualisation (C1)")).toBeInTheDocument();
  });

  it("should display best resolution", async () => {
    renderWithAccordion(<RefinementStep autoProcId={1} />);

    await screen.findByText(/best resolution/i);
    expect(screen.getByText("3.00 Å")).toBeInTheDocument();
  });

  it("should only render one button if there's only one particle classification group", async () => {
    server.use(
      http.get(
        "http://localhost/autoProc/:procId/classification",
        () =>
          HttpResponse.json({
            items: [
              {
                particleClassificationId: 1,
                classDistribution: 999,
                classNumber: 1,
                particlesPerClass: 1,
                batchNumber: 155,
                symmetry: "C1",
                type: "2D",
                selected: false,
                bFactorFitIntercept: 10,
                bFactorFitLinear: 10,
              },
            ],
          }),
        { once: true }
      )
    );

    renderWithAccordion(<RefinementStep autoProcId={1} />);

    await screen.findByText("Open 3D Visualisation (C1)");
    expect(screen.getAllByText(/open 3d visualisation/i)).toHaveLength(1);
  });

  it("should display message if no refinement data is available", async () => {
    server.use(
      http.get(
        "http://localhost/autoProc/:procId/classification",
        () =>
          HttpResponse.json({
            items: [],
          }),
        { once: true }
      )
    );

    renderWithAccordion(<RefinementStep autoProcId={1} />);

    await screen.findByText("Refinement data not found");
  });
});
