import { fireEvent, screen } from "@testing-library/react";
import { getListingData } from "utils/loaders/listings";
import { renderWithRoute } from "utils/test-utils";
import { GenericListing } from "routes/GenericListing";

describe("GenericListing", () => {
  it("should include search in request", async () => {
    renderWithRoute(
      <GenericListing
        heading='Test'
        makePathCallback={(item) => item.test.toString()}
        headers={[
          { key: "key1", label: "label1" },
          { key: "key2", label: "label2" },
          { key: "key3", label: "label3" },
        ]}
      />,
      ({ request, params }) => getListingData(request, params, "proposals")
    );

    const search = await screen.findByPlaceholderText("Search...");
    fireEvent.change(search, { target: { value: "cm3111" } });
    fireEvent.blur(search);

    await expect(
      screen.findByRole("cell", { name: "value1cm3111" })
    ).resolves.toBeInTheDocument();
  });

  it("should perform request again when page changes", async () => {
    renderWithRoute(
      <GenericListing
        heading='Test'
        makePathCallback={(item) => item.test.toString()}
        headers={[
          { key: "key1", label: "label1" },
          { key: "key2", label: "label2" },
          { key: "key3", label: "label3" },
        ]}
      />,
      ({ request, params }) => getListingData(request, params, "proposals")
    );

    const nextPage = await screen.findByRole("button", { name: "4" });
    fireEvent.click(nextPage);

    await expect(
      screen.findByText("Page 4 out of 15")
    ).resolves.toBeInTheDocument();
  });

  it("should set data to null when invalid response is provided", async () => {
    renderWithRoute(
      <GenericListing
        heading='data'
        makePathCallback={(item) => item.test.toString()}
        headers={[
          { key: "key1", label: "label1" },
          { key: "key2", label: "label2" },
          { key: "key3", label: "label3" },
        ]}
      />,
      () => ({ data: null, total: 0 })
    );

    await screen.findByText("No data found");
  });

  it("should set page to 1 when user performs search", async () => {
    renderWithRoute(
      <GenericListing
        heading='data'
        makePathCallback={(item) => item.test.toString()}
        headers={[
          { key: "key1", label: "label1" },
          { key: "key2", label: "label2" },
          { key: "key3", label: "label3" },
        ]}
      />,
      ({ request, params }) => getListingData(request, params, "proposals")
    );

    const search = await screen.findByPlaceholderText("Search...");
    fireEvent.click(screen.getByLabelText("Next Page"));
    fireEvent.change(search, { target: { value: "cm3111" } });
    fireEvent.blur(search);

    await screen.findByText("Page 1 out of 15");
  });

  it("should run data through callback function if processData function is provided", async () => {
    renderWithRoute(
      <GenericListing
        heading='data'
        makePathCallback={(item) => item.test.toString()}
        headers={[
          { key: "key1", label: "label1" },
          { key: "key2", label: "label2" },
          { key: "key3", label: "label3" },
        ]}
      />,
      ({ request, params }) =>
        getListingData(request, params, "proposals", (data) =>
          data.map(() => ({ key1: "AAAA", key2: "BBBB", key3: "CCCC" }))
        )
    );

    expect((await screen.findAllByText("AAAA")).length).toBe(3);
  });

  it("should call navigation callback when row is clicked", async () => {
    const mockCallback = jest.fn();
    renderWithRoute(
      <GenericListing
        heading='data'
        makePathCallback={mockCallback}
        headers={[
          { key: "key1", label: "label1" },
          { key: "key2", label: "label2" },
          { key: "key3", label: "label3" },
        ]}
      />,
      ({ request, params }) => getListingData(request, params, "proposals")
    );

    const row = await screen.findByText("value1");
    fireEvent.click(row);

    expect(mockCallback).toBeCalled();
  });
});
