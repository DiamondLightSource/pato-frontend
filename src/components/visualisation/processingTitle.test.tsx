import { renderWithAccordion } from "utils/test-utils";
import { ProcessingTitle } from "./processingTitle";
import { screen } from "@testing-library/react";
import { AccordionItem } from "@chakra-ui/react";

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

describe("Processing Title", () => {
  it("should replace unknown date values with ?", async () => {
    renderWithAccordion(
      <AccordionItem>
        <ProcessingTitle procJob={procJob} autoProc={autoProcJob} status='Success' />
      </AccordionItem>
    );

    expect(screen.getAllByText("?")).toHaveLength(2);
  });

  it("should display date values when available", async () => {
    const newAutoProcJob = {
      ...autoProcJob,
      processingStartTime: "date1",
      processingEndTime: "date2",
    };
    renderWithAccordion(
      <AccordionItem>
        <ProcessingTitle procJob={procJob} autoProc={newAutoProcJob} status='Success' />
      </AccordionItem>
    );

    expect(screen.getByText("date1")).toBeInTheDocument();
    expect(screen.getByText("date2")).toBeInTheDocument();
  });
});
