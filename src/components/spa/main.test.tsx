import { renderWithAccordion } from "utils/test-utils";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { SPA } from "components/spa/main";
import { components } from "schema/main";

const procJob = {
  processingJobId: 1,
  dataCollectionId: 1,
  displayName: "name",
  comments: "comment",
  recipe: "recipe",
  automatic: 1,
  recordTimestamp: "2024-01-01 00:00",
};

const autoProcJob = {
  autoProcProgramId: 1,
} as components["schemas"]["AutoProcProgramResponse"];

describe("SPA Processing Job Row", () => {
  it("should display all visualisations if recipe isn't in recipe mapping", () => {
    renderWithAccordion(
      <SPA autoProc={autoProcJob} procJob={procJob} active={true} status='Success' />
    );

    screen.getByText(/summary/i);
    expect(screen.getByText(/motion correction\/ctf/i)).toBeInTheDocument();
    expect(screen.getByText(/2d classification/i)).toBeInTheDocument();
    expect(screen.getByText(/3d classification/i)).toBeInTheDocument();
  });

  it("should only display 2D classification if recipe matches", () => {
    renderWithAccordion(
      <SPA
        autoProc={autoProcJob}
        procJob={{ ...procJob, recipe: "em-spa-class2d" }}
        active={true}
        status='Success'
      />
    );

    expect(screen.getAllByText(/2d classification/i)).toHaveLength(2);
    expect(screen.queryByText(/summary/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/3d classification/i)).not.toBeInTheDocument();
  });

  it("should only display 3D classification if recipe matches", () => {
    renderWithAccordion(
      <SPA
        autoProc={autoProcJob}
        procJob={{ ...procJob, recipe: "em-spa-class3d" }}
        active={true}
        status='Success'
      />
    );

    expect(screen.getAllByText(/3d classification/i)).toHaveLength(2);
    expect(screen.queryByText(/summary/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/2d classification/i)).not.toBeInTheDocument();
  });

  it("should only display refinement if recipe matches", async () => {
    renderWithAccordion(
      <SPA
        autoProc={autoProcJob}
        procJob={{ ...procJob, recipe: "em-spa-refine" }}
        active={true}
        status='Success'
      />
    );

    expect(screen.queryAllByText(/refinement/i).length).toBeGreaterThan(1);
    await screen.findAllByText(/open 3d visualisation/i);
  });

  it("should only display preprocessing summary if recipe matches", () => {
    renderWithAccordion(
      <SPA
        autoProc={autoProcJob}
        procJob={{ ...procJob, recipe: "em-spa-preprocess" }}
        active={true}
        status='Success'
      />
    );

    expect(screen.getByText(/preprocessing/i)).toBeInTheDocument();
    expect(screen.getByText(/summary/i)).toBeInTheDocument();
    expect(screen.queryByText(/2d classification/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/3d classification/i)).not.toBeInTheDocument();
  });

  it("should display message if autoprocessing program is null", () => {
    renderWithAccordion(
      <SPA
        autoProc={null}
        procJob={{ ...procJob, recipe: "em-spa-preprocess" }}
        active={true}
        status='Success'
      />
    );

    expect(screen.getByText(/no data can be displayed/i)).toBeInTheDocument();
  });

  it("should update pages for all linked components if page changes", async () => {
    renderWithAccordion(
      <SPA
        autoProc={autoProcJob}
        procJob={{ ...procJob, recipe: "em-spa-preprocess" }}
        active={true}
        status='Success'
      />
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /show content/i,
      })
    );

    fireEvent.click(await screen.findByRole("button", { name: "Previous Page" }));
    await waitFor(() =>
      expect(screen.getAllByRole("textbox", { name: /current page/i })[1]).toHaveDisplayValue("19")
    );
  });

  it("should use default page number if no valid page is provided", async () => {
    renderWithAccordion(
      <SPA
        autoProc={autoProcJob}
        procJob={{ ...procJob, recipe: "em-spa-preprocess" }}
        active={true}
        status='Success'
      />,
      undefined,
      [{ search: "?movie=notANumber" }]
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /show content/i,
      })
    );

    await waitFor(() =>
      expect(screen.getAllByRole("textbox", { name: /current page/i })[0]).toHaveDisplayValue("20")
    );
  });
});
