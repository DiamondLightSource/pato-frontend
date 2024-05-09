import { renderWithAccordion } from "utils/test-utils";
import { screen } from "@testing-library/react";
import { SPA } from "components/spa/main";

const procJob = {
  processingJobId: 1,
  dataCollectionId: 1,
  displayName: "name",
  comments: "comment",
  recipe: "recipe",
  automatic: 1,
};

const autoProcJob = {
  autoProcProgramId: 1,
};

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
    await screen.findByText(/open 3d visualisation/i);
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
});
