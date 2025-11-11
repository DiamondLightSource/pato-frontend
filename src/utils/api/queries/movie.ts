import { BasePoint } from "@diamondlightsource/ui-components";
import { prependApiUrl, client } from "utils/api/client";

interface IdList {
  movieId: number;
  foilHoleId: number;
  gridSquareId: number;
}

interface ParsedMovieData {
  micrograph: string;
  fft: string;
  drift: BasePoint[];
  ids?: IdList;
}

type MovieQueryKeys = [
  "movie",
  {
    movieId: number;
  },
];

export const fetchMovieData = async ({ queryKey }: { queryKey: MovieQueryKeys }) => {
  const { movieId } = queryKey[1];
  let data: ParsedMovieData = {
    micrograph: prependApiUrl(`movies/${movieId}/micrograph`),
    fft: prependApiUrl(`movies/${movieId}/fft`),
    drift: [],
  };

  const fileData = await client.safeGet(`movies/${movieId}/drift`);

  if (fileData.status === 200) {
    data.drift = fileData.data.items;
  }

  const atlasIds = await client.safeGet(`movies/${movieId}`);

  if (atlasIds.status === 200 && atlasIds.data.movieId === movieId) {
    data.ids = {
      movieId: atlasIds.data.movieId,
      foilHoleId: atlasIds.data.foilHoleId,
      gridSquareId: atlasIds.data.gridSquareId,
    };
  }

  return data;
};
