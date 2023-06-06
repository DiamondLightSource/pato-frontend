import { fireEvent, screen, waitFor } from "@testing-library/react";
import { renderWithRoute } from "utils/test-utils";
import { GenericListing } from "routes/GenericListing";
import { proposalHeaders } from "utils/config/table";

describe("GenericListing", () => {
  afterAll(() => jest.resetAllMocks());
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

    await waitFor(() =>
      expect(router.state.navigation.location?.search).toBe("?search=cm31111&page=1&items=20")
    );
  });

  it("should perform request again when page changes", async () => {
    const { router } = renderWithRoute(
      <GenericListing
        heading='Test'
        makePathCallback={(item) => item.test.toString()}
        headers={proposalHeaders}
      />,
      () => ({ data: null, total: 300 })
    );

    const nextPage = await screen.findByRole("button", { name: "4" });
    fireEvent.click(nextPage);

    await waitFor(() =>
      expect(router.state.navigation.location?.search).toBe("?search=&page=4&items=20")
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
      () => ({ data: [], total: 300 })
    );

    const search = await screen.findByPlaceholderText("Search...");
    fireEvent.click(screen.getByLabelText("Next Page"));
    fireEvent.change(search, { target: { value: "cm3111" } });
    fireEvent.blur(search);

    await screen.findByText("Page 1 out of 15");
  });

  it("should use item limit from URL when available", async () => {
    renderWithRoute(<GenericListing heading='data' headers={proposalHeaders} />, () => ({
      data: [],
      total: 300,
      limit: 30,
    }));

    await screen.findByDisplayValue("30");
  });

  it("should call navigation callback when row is clicked", async () => {
    const mockCallback = jest.fn().mockReturnValue("somethingElse");
    const { router } = renderWithRoute(
      <GenericListing heading='data' makePathCallback={mockCallback} headers={proposalHeaders} />,
      () => ({ data: [{ proposalNumber: 31111 }] })
    );

    const row = await screen.findByText("31111");
    fireEvent.click(row);

    expect(mockCallback).toBeCalled();

    await waitFor(() => expect(router.state.navigation.location?.pathname).toBe("/somethingElse"));
  });
});
