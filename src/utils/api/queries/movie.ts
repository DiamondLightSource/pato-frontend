import { BasePoint } from "@diamondlightsource/ui-components";
import { components } from "schema/main";
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
  movie?: components["schemas"]["Movie"];
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
  const movie = await client.safeGet(`movies/${movieId}`);

  if (movie.status === 200 && movie.data.movieId === movieId) {
    data.ids = {
      movieId: movie.data.movieId,
      foilHoleId: movie.data.foilHoleId,
      gridSquareId: movie.data.gridSquareId,
    };

    data.movie = movie.data;
  }

  return data;
};
