import { renderWithAccordion } from "utils/test-utils";
import { screen, waitFor } from "@testing-library/react";
import { RefinementStep } from "./refine";

describe("SPA Refinement Step", () => {
  it("should render B-factor plot", async () => {
    renderWithAccordion(<RefinementStep autoProcId={1} />);

    await waitFor(() => expect(screen.getAllByTestId("dot")).toHaveLength(1));
  });

  it("should render B-factor values", async () => {
    renderWithAccordion(<RefinementStep autoProcId={1} />);

    await waitFor(() => expect(screen.getByText("0.200")).toBeInTheDocument());
  });
});
