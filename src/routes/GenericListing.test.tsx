import { fireEvent, screen } from "@testing-library/react";
import { renderWithRoute } from "utils/test-utils";
import { GenericListing } from "routes/GenericListing";
import { proposalHeaders } from "utils/config/table";

const proposal = { proposalNumber: 31111 };

describe("Generic Listing", () => {
  it("should include search in request", async () => {
    const { router } = renderWithRoute(
      <GenericListing
        heading='Test'
        makePathCallback={(item) => item.test.toString()}
        headers={proposalHeaders}
      />,
      () => ({ data: null, total: 300 })
    );

    const search = await screen.findByPlaceholderText("Search...");
    fireEvent.change(search, { target: { value: "cm31111" } });
    fireEvent.blur(search);

    expect(router.state.navigation.location!.search).toBe("?page=1&search=cm31111");
  });

  it("should perform request again when page changes", async () => {
    const { router } = renderWithRoute(
      <GenericListing
        heading='Test'
        makePathCallback={(item) => item.test.toString()}
        headers={proposalHeaders}
      />,
      () => ({ data: [proposal], total: 300 })
    );

    const nextPage = await screen.findByText("4");
    fireEvent.click(nextPage);

    expect(router.state.navigation.location!.search).toBe("?page=4");
  });

  it("should set data to null when invalid response is provided", async () => {
    renderWithRoute(
      <GenericListing
        heading='data'
        makePathCallback={(item) => item.test.toString()}
        headers={proposalHeaders}
      />,
      () => ({ data: null, total: 0 })
    );

    await screen.findByText("No data found");
  });

  it("should set page to 1 when user performs search", async () => {
    const { router } = renderWithRoute(
      <GenericListing
        heading='data'
        makePathCallback={(item) => item.test.toString()}
        headers={proposalHeaders}
      />,
      () => ({ data: [], total: 300, limit: 20 })
    );

    const search = await screen.findByPlaceholderText("Search...");
    fireEvent.click(screen.getByLabelText("Next Page"));

    expect(router.state.navigation.location!.search).toBe("?page=2");

    fireEvent.change(search, { target: { value: "cm3111" } });
    fireEvent.blur(search);

    expect(router.state.navigation.location!.search).toBe("?page=1&search=cm3111");
  });

  it("should use item limit from URL when available", async () => {
    renderWithRoute(<GenericListing heading='data' headers={proposalHeaders} />, () => ({
      data: [],
      total: 300,
      limit: 30,
    }));

    await screen.findByDisplayValue("30");
  });

  it("should not show pagination component if no items are available", async () => {
    renderWithRoute(<GenericListing heading='data' headers={proposalHeaders} />, () => ({
      data: [],
      total: 0,
      limit: 30,
    }));

    await screen.findByText(/no data found/i);
    expect(screen.queryByText(/page 1 out of 0/i)).not.toBeInTheDocument();
  });

  it("should call navigation callback when row is clicked", async () => {
    const mockCallback = vi.fn().mockReturnValue("somethingElse");
    const { router } = renderWithRoute(
      <GenericListing heading='data' makePathCallback={mockCallback} headers={proposalHeaders} />,
      () => ({ data: [proposal] }),
      ["/?sortBy=sortKey2"]
    );

    const row = await screen.findByText("31111");
    fireEvent.click(row);

    expect(mockCallback).toHaveBeenCalledWith(
      proposal,
      0,
      expect.objectContaining({ sortBy: "sortKey2" })
    );

    expect(router.state.navigation.location!.pathname).toBe("/somethingElse");
  });

  it("should display sorting options if provided", async () => {
    renderWithRoute(
      <GenericListing
        heading='data'
        headers={proposalHeaders}
        sortOptions={[{ key: "sortKey", value: "Sort Value" }]}
      />,
      () => ({ data: [] })
    );

    await screen.findByText("Sort By");
    expect(screen.getByText("Sort Value")).toBeInTheDocument();
  });

  it("should select sorting option in URL by default", async () => {
    renderWithRoute(
      <GenericListing
        heading='data'
        headers={proposalHeaders}
        sortOptions={[
          { key: "sortKey", value: "Sort Value" },
          { key: "sortKey2", value: "Sort Value 2" },
        ]}
      />,
      () => ({ data: [] }),
      ["/?sortBy=sortKey2"]
    );

    await screen.findByText("Sort By");
    expect(screen.getByRole("combobox", { name: "Sort By" })).toHaveValue("sortKey2");
  });

  it("should include sort key in URL when fields are updated", async () => {
    const { router } = renderWithRoute(
      <GenericListing
        heading='data'
        headers={proposalHeaders}
        sortOptions={[
          { key: "sortKey", value: "Sort Value" },
          { key: "sortKey2", value: "Sort Value 2" },
        ]}
      />,
      () => ({ data: [] })
    );

    const sortBySelect = await screen.findByRole("combobox", { name: "Sort By" });
    fireEvent.change(sortBySelect, { target: { value: "sortKey2" } });

    expect(router.state.navigation.location!.search).toEqual("?sortBy=sortKey2");
  });

  it("should not display pagination controls if data is null", async () => {
    renderWithRoute(<GenericListing heading='data' headers={proposalHeaders} />, () => ({
      data: null,
    }));

    await screen.findByText("No data found");

    expect(screen.queryByLabelText("Previous Page")).not.toBeInTheDocument();
  });
});
