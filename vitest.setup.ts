import { server } from "@/mocks/server";
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { getServerSession } from "next-auth";

const pathnameMock = vi.fn(() => "/");
export const toastMock = vi.fn();

vi.mock("next/cache", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return { ...actual, revalidateTag: () => {}, revalidatePath: () => {} };
});

vi.mock("next/navigation", () => ({
  ...require("next-router-mock"),
  usePathname: pathnameMock,
  redirect: vi.fn(),
}));
window.scrollTo = () => {};
window.print = () => {};

process.env.NEXT_PUBLIC_API_URL = "http://localhost/api";
process.env.SERVER_API_URL = "http://localhost/api";

beforeEach(() => server.listen());

afterEach(() => {
  server.resetHandlers();
  toastMock.mockClear();
  cleanup();
});

afterAll(() => {
  server.close();
});

// Reference: https://github.com/nextauthjs/next-auth/discussions/4185#discussioncomment-2397318
// We also need to mock the whole next-auth package, since it's used in
// our various pages via the `export { getServerSideProps }` function.
vi.mock("next-auth/next", () => ({
  __esModule: true,
  default: vi.fn(),
  getServerSession: vi.fn(
    () =>
      new Promise((resolve) => {
        resolve({
          expiresIn: undefined,
          loggedInAt: undefined,
          someProp: "someString",
        });
      }),
  ),
}));

vi.mock("@chakra-ui/react", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    createStandaloneToast: () => ({ toast: toastMock }),
    useToast: () => toastMock,
  };
});

vi.mock("next-auth", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    getServerSession: () => {}
  };
});
