import Class2D from "../src/components/spa/class2d";
import React from "react";
import { renderWithProviders } from "../src/utils/test-utils";
import { fireEvent, screen, waitFor } from "@testing-library/react";

describe("2D Classification", () => {
  window.URL.createObjectURL = jest.fn();
  it("should display first page as default", async () => {
    renderWithProviders(<Class2D autoProcId={1} />);

    await waitFor(() => {
      expect(screen.getByLabelText("Batch Number Value")).toHaveTextContent("155");
    });

    expect(screen.getByLabelText("Current Page")).toHaveValue("1");
  });

  it("should update information when new class is selected", async () => {
    renderWithProviders(<Class2D autoProcId={1} />);

    await waitFor(() => {
      expect(screen.getByLabelText("Batch Number Value")).toHaveTextContent("155");
    });

    const newClass = screen.getByRole("heading", { name: "355-1 (1)" });
    fireEvent.click(newClass);

    await waitFor(() => {
      expect(screen.getByLabelText("Batch Number Value")).toHaveTextContent("355");
    });
  });

  it("should update query when different sort type is selected", async () => {
    renderWithProviders(<Class2D autoProcId={1} />);
    
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "class" } });

    await waitFor(() => {
      expect(screen.getByLabelText("Class Distribution Value")).toHaveTextContent("999");
    });
  });
});
