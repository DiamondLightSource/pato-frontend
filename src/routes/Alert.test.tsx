import { waitFor, screen, fireEvent } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "mocks/server";
import { renderWithRoute } from "utils/test-utils";
import AlertForm from "./Alert";
import { mockToast } from "../../vitest.setup";

describe("Alerts", () => {
  it("should display toast when not successful", async () => {
    server.use(
      http.post(
        "http://localhost/dataGroups:/groupId/alerts",
        () => HttpResponse.json({ detail: "some error message" }, { status: 500 }),
        { once: true }
      )
    );

    renderWithRoute(<AlertForm />, () => ({}));

    fireEvent.change(await screen.findByRole("textbox", { name: "Email (required)" }), {
      target: { value: "test@diamond.ac.uk" },
    });

    fireEvent.click(screen.getByText("Submit"));
    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ status: "error" }))
    );
  });

  it("should display message if email is not filled in", async () => {
    renderWithRoute(<AlertForm />, () => ({}));

    fireEvent.click(await screen.findByText("Submit"));
    await screen.findByText("Required");
  });

  it("should display message for invalid email address", async () => {
    renderWithRoute(<AlertForm />, () => ({}));

    fireEvent.change(await screen.findByRole("textbox", { name: "Email (required)" }), {
      target: { value: "notAnEmail" },
    });
    fireEvent.click(screen.getByText("Submit"));

    await screen.findByText("Invalid email address");
  });

  it("should display message if min is greater than max", async () => {
    renderWithRoute(<AlertForm />, () => ({}));

    fireEvent.change(await screen.findByTestId("astigmatismMin"), {
      target: { value: "5" },
    });

    fireEvent.change(screen.getByTestId("astigmatismMax"), {
      target: { value: "1" },
    });

    fireEvent.click(screen.getByText("Submit"));
    await screen.findByText("Maximum must be greater than minimum");
  });

  it.each(["resolution", "particleCount"])(
    "should display if passed %s is not positive",
    async (field) => {
      renderWithRoute(<AlertForm />, () => ({}));

      fireEvent.change(await screen.findByTestId(`${field}Min`), {
        target: { value: "-20" },
      });

      fireEvent.click(screen.getByText("Submit"));
      await screen.findByText("Value must be positive");
    }
  );

  it("should display toast when successful", async () => {
    renderWithRoute(<AlertForm />, () => ({}));

    fireEvent.change(await screen.findByRole("textbox", { name: "Email (required)" }), {
      target: { value: "test@diamond.ac.uk" },
    });

    fireEvent.click(screen.getByText("Submit"));
    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ status: "success" }))
    );
  });
});
