import { rest } from "msw";
import { server } from "mocks/server";
import { getUser } from "utils/loaders/user";

describe("User Data", () => {
  it("should return user data if available", async () => {
    server.use(
      rest.get("http://localhost/auth/user", (req, res, ctx) => {
        return res.once(ctx.status(200), ctx.json({ givenName: "John", fedid: "abc12345" }));
      })
    );
    const data = await getUser();

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
    const data = await getUser();

    expect(data).toBe(null);
  });

  it("should redirect if access token is in URL", async () => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      enumerable: true,
      value: new URL("http://localhost/test#access_token=abc123?token_type=na"),
    });

    global.window.history.replaceState = jest.fn()

    server.use(
      rest.get("http://localhost/auth/user", (req, res, ctx) => {
        return res.once(ctx.status(401));
      })
    );

    await getUser();
    expect(global.window.history.replaceState).toBeCalled()
  });

  it("should return null if network request fails", async () => {
    server.use(
      rest.get("http://localhost/auth/user", (req, res, ctx) => {
        return res.networkError("Failed to connect");
      })
    );

    const user = await getUser();
    expect(user).toBe(null)
  });
});
