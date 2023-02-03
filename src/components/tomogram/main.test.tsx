import { fireEvent, screen } from "@testing-library/react";
import { rest } from "msw";
import { server } from "../../mocks/server";
import { renderWithAccordion } from "../../utils/test-utils";
import { Tomogram } from "./main";
import { BaseProcessingJobProps } from "../../schema/interfaces";

const basicProcJob: BaseProcessingJobProps["procJob"] = {
  processingJobId: 1,
  dataCollectionId: 1,
  displayName: "Test",
  comments: "Test",
  recipe: "Test",
  automatic: 1,
};

describe("Home", () => {
  it("should only display motion correction if tomogram is not fully processed", async () => {
    server.use(
      rest.get("http://localhost/autoProc/:autoProcId/tomogram", (req, res, ctx) => {
        return res.once(ctx.status(404), ctx.delay(0));
      })
    );

    server.resetHandlers();

    renderWithAccordion(
      <Tomogram active={true} autoProc={{ autoProcProgramId: 1 }} procJob={basicProcJob} status={"Queued"} />
    );

    await screen.findByText("Motion Correction/CTF");
    expect(screen.queryByText("Alignment")).not.toBeInTheDocument();
  });

  it("should display tomogram if response is a valid tomogram", async () => {
    renderWithAccordion(
      <Tomogram active={true} autoProc={{ autoProcProgramId: 1 }} procJob={basicProcJob} status={"Queued"} />
    );

    await screen.findByText("Alignment");
  });

  it("should open movie when button clicked", async () => {
    renderWithAccordion(
      <Tomogram active={true} autoProc={{ autoProcProgramId: 1 }} procJob={basicProcJob} status={"Queued"} />
    );

    await screen.findByText("Alignment");

    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByRole("button", { name: "View Movie" }));

    expect(screen.getByLabelText("Play")).toBeInTheDocument();
  });
});
