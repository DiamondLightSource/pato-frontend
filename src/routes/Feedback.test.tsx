import { waitFor, screen, fireEvent } from "@testing-library/react";
import { rest } from "msw";
import { server } from "mocks/server";
import { renderWithProviders } from "utils/test-utils";
import FeedbackForm from "./Feedback";
import { mockToast } from "../../vitest.setup";

describe("Feedback", () => {
  it("should display toast when not successful", async () => {
    server.use(
      rest.post("http://localhost/feedback", (req, res, ctx) =>
        res.once(ctx.status(500), ctx.json({ detail: "some error message" }), ctx.delay(0))
      )
    );

    renderWithProviders(<FeedbackForm />);

    fireEvent.change(screen.getByRole("textbox", { name: "Full Name (required)" }), {
      target: { value: "Someone" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Email (required)" }), {
      target: { value: "admin@dls.ac.uk" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Comments (required)" }), {
      target: { value: "Comment" },
    });

    fireEvent.click(screen.getByText("Submit"));
    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ status: "error" }))
    );
  });

  it("should display message for empty required fields on submit", async () => {
    renderWithProviders(<FeedbackForm />);

    fireEvent.click(screen.getByText("Submit"));
    await waitFor(() => expect(screen.getAllByText("Field is required")).toHaveLength(3));
  });

  it("should display message for invalid email address", async () => {
    renderWithProviders(<FeedbackForm />);

    fireEvent.change(screen.getByRole("textbox", { name: "Email (required)" }), {
      target: { value: "notAnEmail" },
    });
    fireEvent.click(screen.getByText("Submit"));

    await screen.findByText("Invalid email address");
  });

  it("should display toast when successful", async () => {
    server.use(
      rest.post("http://localhost/feedback", (req, res, ctx) =>
        res.once(ctx.status(200), ctx.delay(0))
      )
    );

    renderWithProviders(<FeedbackForm />);

    fireEvent.change(screen.getByRole("textbox", { name: "Full Name (required)" }), {
      target: { value: "Someone" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Email (required)" }), {
      target: { value: "admin@dls.ac.uk" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Comments (required)" }), {
      target: { value: "Comment" },
    });

    fireEvent.click(screen.getByText("Submit"));
    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ status: "success" }))
    );
  });
});
