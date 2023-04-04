import { rest } from "msw";
import { server } from "mocks/server";
import { getListingData } from "utils/loaders/listings";

const request = new Request("https://localhost/proposals/");

describe("Listing Data", () => {
  it("should return data for listing if available", async () => {
    const data = await getListingData(request, { groupId: "1" }, "proposals");

    expect(data.data[0].proposalNumber).toBe("31111");
    expect(data.total).toBe(300);
  });

  it("should process data if callback function is given", async () => {
    const reprocess = (data: Record<string, any>[]) => data.map((_, i) => ({ key: i }));
    const data = await getListingData(request, { groupId: "1" }, "proposals", reprocess);

    expect(data.data[0].key).toBe(0);
    expect(data.total).toBe(300);
  });

  it("should return data as null if no data is available", async () => {
    server.use(
      rest.get("http://localhost/proposals", (req, res, ctx) => {
        return res.once(ctx.status(404), ctx.delay(0));
      })
    );

    const data = await getListingData(request, { groupId: "1" }, "proposals");

    expect(data.data).toBe(null);
    expect(data.total).toBe(0);
  });
});
