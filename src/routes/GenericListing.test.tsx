import { fireEvent, screen, waitFor } from "@testing-library/react";
import { renderWithRoute } from "utils/test-utils";
import { GenericListing } from "routes/GenericListing";
import { proposalHeaders } from "utils/config/table";

const mockUseNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...(jest.requireActual("react-router-dom") as any),
  useNavigate: () => mockUseNavigate,
}));

describe("Generic Listing", () => {
  afterAll(() => jest.resetAllMocks());
  it("should include search in request", async () => {
    renderWithRoute(
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

    expect(mockUseNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ search: "page=1&search=cm31111" }),
      expect.anything()
    );
  });

  it("should perform request again when page changes", async () => {
    renderWithRoute(
      <GenericListing
        heading='Test'
        makePathCallback={(item) => item.test.toString()}
        headers={proposalHeaders}
      />,
      () => ({ data: null, total: 300 })
    );

    const nextPage = await screen.findByRole("button", { name: "4" });
    fireEvent.click(nextPage);

    expect(mockUseNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ search: "page=4" }),
      expect.anything()
    );
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
    renderWithRoute(
      <GenericListing
        heading='data'
        makePathCallback={(item) => item.test.toString()}
        headers={proposalHeaders}
      />,
      () => ({ data: [], total: 300, limit: 20 })
    );

    const search = await screen.findByPlaceholderText("Search...");
    fireEvent.click(screen.getByLabelText("Next Page"));

    expect(mockUseNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ search: "page=2" }),
      expect.anything()
    );

    fireEvent.change(search, { target: { value: "cm3111" } });
    fireEvent.blur(search);

    await waitFor(() =>
      expect(mockUseNavigate).toHaveBeenCalledWith(
        expect.objectContaining({ search: "page=1&search=cm31111" }),
        expect.anything()
      )
    );
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
    const mockCallback = jest.fn().mockReturnValue("somethingElse");
    renderWithRoute(
      <GenericListing heading='data' makePathCallback={mockCallback} headers={proposalHeaders} />,
      () => ({ data: [{ proposalNumber: 31111 }] })
    );

    const row = await screen.findByText("31111");
    fireEvent.click(row);

    expect(mockCallback).toHaveBeenCalled();

    expect(mockUseNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: "somethingElse" }),
      expect.anything()
    );
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
    renderWithRoute(
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

    expect(mockUseNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ search: "sortBy=sortKey2" }),
      expect.anything()
    );
  });
});
