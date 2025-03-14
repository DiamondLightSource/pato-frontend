import { server } from "mocks/server";
import { http, HttpResponse } from "msw";
import { replace } from "react-router-dom";
import { groupLoader } from "./group";

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    replace: vi.fn(),
  };
});

describe("Group Loader Redirect", () => {
  it.each([
    ["Tomography", "./tomograms"],
    ["Single Particle", "./spa"],
    ["Not-Valid", "/proposals/cm1/sessions/1"],
<<<<<<< HEAD
  ])("should redirect to $redirect if experiment type is $experimentType", async (experimentType, redirect) => {
    server.use(
      http.get(
        "http://localhost/dataGroups/:groupId",
        () => HttpResponse.json({ experimentTypeName: experimentType }),
        { once: true }
      )
    );

    await groupLoader({ propId: "cm1", visitId: "1", groupId: "1" });
    expect(replace).toBeCalledWith(redirect);
  });
=======
  ])(
    "should redirect to $redirect if experiment type is $experimentType",
    async (experimentType, redirect) => {
      server.use(
        http.get("http://localhost/dataGroups/:groupId", () =>
          HttpResponse.json({ experimentTypeName: experimentType })
        )
      );

      await groupLoader({ propId: "cm1", visitId: "1", groupId: "1" });
      expect(replace).toBeCalledWith(redirect);
    }
  );
>>>>>>> a2cfd0e1fd1174303558841c532336da31d1a0af
});
