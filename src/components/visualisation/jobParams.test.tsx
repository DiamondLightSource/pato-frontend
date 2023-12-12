import { renderWithProviders } from "utils/test-utils";
import { screen } from "@testing-library/react";
import { JobParamsDrawer } from "./jobParams";

describe("Job Parameters Drawer", () => {
  it("should display job parameters", async () => {
    renderWithProviders(<JobParamsDrawer procJobId={1} onClose={() => {}} />);

    await screen.findByText(/do_class2d/i);
    expect(screen.getByText(/do_class3d/i)).toBeInTheDocument();
  });
});
