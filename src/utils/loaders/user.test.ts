import { rest } from "msw";
import { server } from "mocks/server";
import { getUser } from "utils/loaders/user";

describe("User Data", () => {
  it("should return user data if available", async () => {
    const data = await getUser();

    if (data === null || data instanceof Response) {
      return;
    }

    expect(data.name).toBe("Person");
    expect(data.fedid).toBe("abc12345");
  });

  it("should return null if unauthorised", async () => {
    server.use(rest.get("http://localhost/auth/user", (req, res, ctx) => res.once(ctx.status(401))));

    const data = await getUser();
    expect(data).toBe(null);
  });

  it("should return null if network request fails", async () => {
    server.use(
      rest.get("http://localhost/auth/user", (req, res, ctx) => {
        return res.networkError("Failed to connect");
      })
    );

    const user = await getUser();
    expect(user).toBe(null);
  });
});
