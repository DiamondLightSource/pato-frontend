import { fireEvent, screen, waitFor } from "@testing-library/react";
import { renderWithRoute } from "utils/test-utils";
import { GenericListing } from "routes/GenericListing";
import { proposalHeaders } from "utils/config/table";

describe("GenericListing", () => {
  it("should include search in request", async () => {
    const loaderFn = jest.fn();
    renderWithRoute(
      <GenericListing
        heading='Test'
        makePathCallback={(item) => item.test.toString()}
        headers={proposalHeaders}
      />,
      ({ request }) => {
        loaderFn(new URL(request.url).searchParams.get("search"));
        return { data: null };
      }
    );

    const search = await screen.findByPlaceholderText("Search...");
    fireEvent.change(search, { target: { value: "cm31111" } });
    fireEvent.blur(search);

    await waitFor(() => expect(loaderFn).toBeCalledWith("cm31111"));
  });

  it("should perform request again when page changes", async () => {
    const loaderFn = jest.fn();
    renderWithRoute(
      <GenericListing
        heading='Test'
        makePathCallback={(item) => item.test.toString()}
        headers={proposalHeaders}
      />,
      ({ request }) => {
        loaderFn(new URL(request.url).searchParams.get("page"));
        return { data: null, total: 300 };
      }
    );

    const nextPage = await screen.findByRole("button", { name: "4" });
    fireEvent.click(nextPage);

    await waitFor(() => expect(loaderFn).toBeCalledWith("4"));
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

  it("should call navigation callback when row is clicked", async () => {
    const mockCallback = jest.fn();
    renderWithRoute(
      <GenericListing
        heading='data'
        makePathCallback={mockCallback}
        headers={proposalHeaders}
      />,
      () => ({ data: [{ proposalNumber: 31111 }] })
    );

    const row = await screen.findByText("31111");
    fireEvent.click(row);

    expect(mockCallback).toBeCalled();
  });
});
