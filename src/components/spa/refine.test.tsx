import { renderWithAccordion } from "utils/test-utils";
import { screen, waitFor } from "@testing-library/react";
import { RefinementStep } from "./refine";

describe("SPA Refinement Step", () => {
  it("should render b factor plot", async () => {
    renderWithAccordion(<RefinementStep autoProcId={1} />);

    await waitFor(() => expect(screen.getAllByTestId("dot")).toHaveLength(1));
  });
});
