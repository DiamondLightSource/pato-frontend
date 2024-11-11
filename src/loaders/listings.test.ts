import { checkListingChanged, listingLoader } from "loaders/listings";
import { server } from "mocks/server";
import { http, HttpResponse } from "msw";
import { queryClient } from "utils/test-utils";

const request = new Request("http://localhost/proposals/");

describe("Listing Data", () => {
  it("should return data for listing if available", async () => {
    const data = await listingLoader(queryClient)(request, { groupId: "1" }, "proposals");

    expect(data.data![0].proposalNumber).toBe("31111");
    expect(data.total).toBe(300);
  });

  it("should process data if callback function is given", async () => {
    const reprocess = (data: Record<string, any>[]) => data.map((_, i) => ({ key: i }));
    const data = await listingLoader(queryClient)(
      request,
      { groupId: "1" },
      "proposals",
      reprocess
    );

    expect(data.data![0].key).toBe(0);
    expect(data.total).toBe(300);
  });

  it("should return data as null if no data is available", async () => {
    const data = await listingLoader(queryClient)(request, {}, "invalidEndpoint");

    expect(data.data).toBe(null);
    expect(data.total).toBe(0);
  });

  it("should include search keywords in URL", async () => {
    server.use(
      http.get("http://localhost/searchTest", ({ request }) => {
        const url = new URL(request.url);
        return HttpResponse.json({ items: [{ value: url.searchParams.get("search") }] });
      })
    );

    const requestSearch = new Request("http://localhost/proposals?search=test");
    const data = await listingLoader(queryClient)(requestSearch, {}, "searchTest");

    expect(data.data![0]).toMatchObject({ value: "test" });
  });

  it("should not fire loader again if URLs are the same", () => {
    const oldUrl = new URL("http://localhost/proposals");
    expect(checkListingChanged(oldUrl, oldUrl)).toBe(false);
  });

  it("should not fire loader if old URL has no search params", () => {
    const oldUrl = new URL("http://localhost/proposals");
    const newUrl = new URL("http://localhost/proposals?page=90&limit=20");
    expect(checkListingChanged(oldUrl, newUrl)).toBe(false);
  });

  it("should fire loader if search params are different", () => {
    const oldUrl = new URL("http://localhost/proposals?page=89&limit=20");
    const newUrl = new URL("http://localhost/proposals?page=90&limit=20");
    expect(checkListingChanged(oldUrl, newUrl)).toBe(true);
  });
});
