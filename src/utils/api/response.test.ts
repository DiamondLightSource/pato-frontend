import { parseJobParameters } from "./response";

describe("Processing Job Parameter Parser", () => {
  it("should only return file name from gain reference path parameter", async () => {
    expect(parseJobParameters({ motioncor_gainreference: "/dls/some/path/here/gain.mrc" })).toEqual(
      { gainReferenceFile: "gain.mrc" }
    );
  });

  it("should cast boolean fields in parameter listing to boolean values", async () => {
    expect(parseJobParameters({ do_class3d: "1", do_class2d: "0", Cs: "1" })).toEqual({
      doClass2D: false,
      doClass3D: true,
      sphericalAberration: "1",
    });
  });

  it("should include generic parameters without an alias", async () => {
    expect(parseJobParameters({ someKey: "1" })).toEqual({ someKey: "1" });
  });
});
