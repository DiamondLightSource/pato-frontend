import { fireEvent, screen } from "@testing-library/react";
import { renderWithProviders } from "../utils/test-utils";
import { GenericListing } from "./GenericListing";

describe("GenericListing", () => {
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

  it("should set data to null when invalid response is provided", async () => {
    renderWithProviders(
      <GenericListing
        heading='data'
        endpoint='invalidEndpoint'
        makePathCallback={(item) => item.test.toString()}
        headers={[
          { key: "key1", label: "label1" },
          { key: "key2", label: "label2" },
          { key: "key3", label: "label3" },
        ]}
      />
    );

    await screen.findByText("No data found");
  });
});
