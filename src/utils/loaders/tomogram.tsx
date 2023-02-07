import { Params } from "react-router-dom";
import { CollectionData } from "../../schema/interfaces";
import { client } from "../api/client";
import { buildEndpoint } from "../api/endpoint";
import { collectionConfig } from "../config/parse";
import { parseData } from "../generic";
import { redirect } from "react-router-dom";

const getTomogramData = async (params: Params, request: Request) => {
  const returnData = {
    collection: { info: [], comments: "", fileTemplate: "?", imageDirectory: "?" } as CollectionData,
    total: 1,
    page: 1,
    jobs: null,
  };
  const searchParams = new URL(request.url).searchParams;
  const onlyTomograms = searchParams.get("onlyTomograms");
  const collectionIndex = params.collectionIndex ?? "1";

  const collectionResponse = await client.safe_get(
    `${buildEndpoint("dataCollections", params, 1, parseInt(collectionIndex))}&onlyTomograms=${onlyTomograms ?? false}`
  );

  if (collectionResponse.status !== 200) {
    return returnData;
  }

  if (collectionIndex > collectionResponse.data.total) {
    return redirect(`${request.url.split("/").slice(0, -1).join("/")}/1?onlyTomograms=${onlyTomograms}`);
  }

  if (collectionResponse.status === 200 && collectionResponse.data.total && collectionResponse.data.items) {
    returnData.total = collectionResponse.data.total;

    returnData.collection = parseData(collectionResponse.data.items[0], collectionConfig) as CollectionData;

    const jobsResponse = await client.safe_get(
      `dataCollections/${collectionResponse.data.items[0].dataCollectionId}/processingJobs?limit=3`
    );
    if (jobsResponse.status === 200 && jobsResponse.data) {
      const items = jobsResponse.data.items;
      returnData.jobs = items;
    }
  }

  return returnData;
};

export { getTomogramData };
