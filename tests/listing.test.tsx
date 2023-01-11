import { fireEvent, screen } from "@testing-library/react";
import { renderWithProviders } from "../src/utils/test-utils";
import GenericListing from "../src/routes/GenericListing";
import React from "react";

describe("GenericListing", () => {
  it("should display message when no data is received", () => {
    renderWithProviders(
      <GenericListing
        heading='Proposals'
        endpoint='invalidEndpoint'
        makePathCallback={(item) => item.test.toString()}
        headers={[{ key: "key1", label: "label1" }]}
      />
    );
    expect(screen.getByText("No proposals found")).toBeInTheDocument();
  });

  it("should render header labels", async () => {
    renderWithProviders(
      <GenericListing
        heading='Test'
        endpoint='proposals'
        makePathCallback={(item) => item.test.toString()}
        headers={[
          { key: "key1", label: "label1" },
          { key: "key2", label: "label2" },
          { key: "key3", label: "label3" },
        ]}
      />
    );

    await expect(screen.findByText("label1")).resolves.toBeInTheDocument();

    expect(screen.getByText("label2")).toBeInTheDocument();
    expect(screen.getByText("label3")).toBeInTheDocument();
  });

  it("should include search in request", async () => {
    renderWithProviders(
      <GenericListing
        heading='Test'
        endpoint='proposals'
        makePathCallback={(item) => item.test.toString()}
        headers={[
          { key: "key1", label: "label1" },
          { key: "key2", label: "label2" },
          { key: "key3", label: "label3" },
        ]}
      />
    );

    const search = screen.getByPlaceholderText("Search");
    fireEvent.change(search, { target: { value: "cm3111" } });
    fireEvent.blur(search);

    await expect(screen.findByRole("cell", { name: "value1cm3111" })).resolves.toBeInTheDocument();
  });

  it("should include search in request (when enter pressed)", async () => {
    renderWithProviders(
      <GenericListing
        heading='Test'
        endpoint='proposals'
        makePathCallback={(item) => item.test.toString()}
        headers={[
          { key: "key1", label: "label1" },
          { key: "key2", label: "label2" },
          { key: "key3", label: "label3" },
        ]}
      />
    );

    const search = screen.getByPlaceholderText("Search");
    fireEvent.change(search, { target: { value: "cm3111" } });
    fireEvent.keyUp(search, { key: "Enter", code: "Enter", charCode: 13 });

    await expect(screen.findByRole("cell", { name: "value1cm3111" })).resolves.toBeInTheDocument();
  });

  it("should display value when provided", async () => {
    renderWithProviders(
      <GenericListing
        heading='Test'
        endpoint='proposals'
        makePathCallback={(item) => item.test.toString()}
        headers={[
          { key: "key1", label: "label1" },
          { key: "key2", label: "label2" },
          { key: "key3", label: "label3" },
        ]}
      />
    );

    await expect(screen.findByText("value1")).resolves.toBeInTheDocument();
    expect(screen.getByText("value2")).toBeInTheDocument();
    expect(screen.getByText("value3")).toBeInTheDocument();
  });

  it("should perform request again when page changes", async () => {
    renderWithProviders(
      <GenericListing
        heading='Test'
        endpoint='proposals'
        makePathCallback={(item) => item.test.toString()}
        headers={[
          { key: "key1", label: "label1" },
          { key: "key2", label: "label2" },
          { key: "key3", label: "label3" },
        ]}
      />
    );

    const nextPage = await screen.findByRole("button", { name: "4" });
    fireEvent.click(nextPage);

    await expect(screen.findByText("Page 4 out of 15")).resolves.toBeInTheDocument();
  });
});
