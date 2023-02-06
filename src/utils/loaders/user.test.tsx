import { rest } from "msw";
import { server } from "../../mocks/server";
import { getUser } from "./user";

const request = new Request("https://localhost/proposals/");

describe("User Data", () => {
  it("should return user data if available", async () => {
    server.use(
      rest.get("http://localhost/auth/user", (req, res, ctx) => {
        return res.once(ctx.status(200), ctx.json({ givenName: "John", fedid: "abc12345" }));
      })
    );
    const data = await getUser(request);

    if (data === null || data instanceof Response) {
      return;
    }

    expect(data.name).toBe("John");
    expect(data.fedid).toBe("abc12345");
  });

  it("should return null if unauthorised", async () => {
    server.use(
      rest.get("http://localhost/auth/user", (req, res, ctx) => {
        return res.once(ctx.status(401));
      })
    );
    const data = await getUser(request);

    expect(data).toBe(null);
  });

  it("should redirect if access token is in URL", async () => {
    const tokenRequest = new Request("https://localhost/proposals#access_token=abc12345&token_type=na");
    const data = await getUser(tokenRequest);

    expect(data).toBeInstanceOf(Response);
  });
});
