import { listingLoader } from "loaders/listings";
import { server } from "mocks/server";
import { rest } from "msw";
import { queryClient } from "utils/test-utils";

const request = new Request("http://localhost/proposals/");

describe("Listing Data", () => {
  it("should return data for listing if available", async () => {
    const data = await listingLoader(queryClient)(
      request,
      { groupId: "1" },
      "proposals"
    );

    expect(data.data[0].proposalNumber).toBe("31111");
    expect(data.total).toBe(300);
  });

  it("should process data if callback function is given", async () => {
    const reprocess = (data: Record<string, any>[]) =>
      data.map((_, i) => ({ key: i }));
    const data = await listingLoader(queryClient)(
      request,
      { groupId: "1" },
      "proposals",
      reprocess
    );

    expect(data.data[0].key).toBe(0);
    expect(data.total).toBe(300);
  });

  it("should return data as null if no data is available", async () => {
    const data = await listingLoader(queryClient)(
      request,
      {},
      "invalidEndpoint"
    );

    expect(data.data).toBe(null);
    expect(data.total).toBe(0);
  });

  it("should include search keywords in URL", async () => {
    server.use(
      rest.get("http://localhost/searchTest", (req, res, ctx) =>
        res.once(
          ctx.status(200),
          ctx.delay(0),
          ctx.json({ items: [{ value: req.url.searchParams.get("search") }] })
        )
      )
    );

    const requestSearch = new Request("http://localhost/proposals?search=test");
    const data = await listingLoader(queryClient)(
      requestSearch,
      {},
      "searchTest"
    );

    expect(data.data[0]).toMatchObject({ value: "test" });
  });
});
