import { http, HttpResponse } from "msw";
import { server } from "mocks/server";
import { getUser } from "loaders/user";

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
    server.use(
      http.get("http://localhost/auth/user", () => HttpResponse.json({}, { status: 401 }), {
        once: true,
      })
    );

    const data = await getUser();
    expect(data).toBe(null);
  });

  it("should return null if network request fails", async () => {
    server.use(http.get("http://localhost/auth/user", () => HttpResponse.error(), { once: true }));

    const user = await getUser();
    expect(user).toBe(null);
  });

  it("should get token and redirect if code is in URL", async () => {
    Object.defineProperty(window, "location", {
      value: new URL("http://localhost/?code=abc1234&otherVal=1234"),
      configurable: true,
    });

    window.location.replace = vi.fn();

    server.use(
      http.get("http://localhost/auth/token", () => HttpResponse.json({}), { once: true })
    );

    await getUser();
    expect(window.location.replace).toBeCalledWith("http://localhost/?otherVal=1234");
  });
});
