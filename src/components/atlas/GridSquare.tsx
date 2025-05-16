import {
  Divider,
  Heading,
  Skeleton,
  VStack,
  Link,
  Image,
  Grid,
  HStack,
  Spacer,
  Checkbox,
  Text,
  Select,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { components } from "schema/main";
import { client, prependApiUrl } from "utils/api/client";
import "styles/atlas.css";
import { FoilHoleMetricTypes } from "schema/interfaces";
import { HeatmapOptions, HeatmapOverlay } from "components/visualisation/Heatmap";

type FoilHole = components["schemas"]["FoilHole"];

export interface GridSquareProps {
  gridSquareId: number | null;
}

export interface FoilHoleWithColour extends FoilHole {
  colour?: string;
}

const HEATMAP_VALUES: Record<string, HeatmapOptions> = {
  resolution: { label: "Resolution (Å)", max: 5, type: "log", binCount: 5 },
  astigmatism: { label: "Astigmatism (nm)", max: 50, type: "log", binCount: 5 },
  particleCount: { label: "Particle Count", min: 0, max: 300, type: "linear", binCount: 5 },
};

const fetchFoilHoles = async (gridSquareId: number | null) => {
  if (!gridSquareId) {
    return null;
  }

  const foilHoleReq = await client.safeGet(`grid-squares/${gridSquareId}/foil-holes?limit=3000`);

  return foilHoleReq.status === 200 ? (foilHoleReq.data.items as FoilHole[]) : null;
};

const fetchMovies = async (foilHoleId: number | null) => {
  if (!foilHoleId) {
    return null;
  }

  const foilHoles = await client.safeGet(`foil-holes/${foilHoleId}/movies?limit=3000`);

  return foilHoles.status === 200
    ? (foilHoles.data.items as components["schemas"]["Movie"][])
    : null;
};

export const GridSquare = ({ gridSquareId }: GridSquareProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const foilHoleId = useMemo(() => {
    const foilHole = searchParams.get("foilHole");
    if (foilHole) {
      const intFoilHole = parseInt(foilHole);
      return isNaN(intFoilHole) ? null : intFoilHole;
    }

    return null;
  }, [searchParams]);
  const [heatmapMetric, setHeatmapMetric] = useState<FoilHoleMetricTypes>("resolution");

  const { data, isLoading } = useQuery({
    queryKey: ["foilHoles", gridSquareId],
    queryFn: async () => await fetchFoilHoles(gridSquareId),
  });

  const { data: movies } = useQuery({
    queryKey: ["foilHoleMovies", foilHoleId],
    queryFn: async () => await fetchMovies(foilHoleId),
  });

  const foilHoles = useMemo(() => {
    if (!data) {
      return null;
    }

    return data.map((foilHole) => ({
      ...foilHole,
      value: foilHole[heatmapMetric] ?? null,
      id: foilHole.foilHoleId,
    }));
  }, [data, heatmapMetric]);

  const handleFoilHoleClicked = useCallback(
    (foilHole: number | string) => {
      if (gridSquareId === null) {
        return;
      }
      /* 
      Search params are set like this so as not to overwrite hideSquares. 
      See the example in the React Router docs:
      https://api.reactrouter.com/v7/types/react_router.SetURLSearchParams.html
      */
      setSearchParams((prev) => {
        prev.set("gridSquare", gridSquareId.toString());
        prev.set("foilHole", foilHole.toString());
        return prev;
      });
    },
    [gridSquareId, setSearchParams]
  );

  const handleFoilHide = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchParams((prev) => {
        prev.set("hideHoles", e.target.checked.toString());
        return prev;
      });
    },
    [setSearchParams]
  );

  return (
    <VStack
      display='flex'
      flex='1 0 300px'
      p='0.5em'
      bg='diamond.50'
      alignItems='start'
      border='1px solid'
      borderColor='diamond.900'
    >
      <HStack w='100%'>
        <Heading>Grid Square</Heading>
        <Spacer />
        <Checkbox
          defaultChecked={searchParams.get("hideHoles") === "true"}
          onChange={handleFoilHide}
          size='lg'
        >
          Hide uncollected foil holes
        </Checkbox>
      </HStack>

      <Divider />
      {gridSquareId === null ? (
        <Heading w='100%' variant='notFound' size='md' h='512px' alignContent='center'>
          No grid square selected. Select one by clicking one of the atlas grid squares.
        </Heading>
      ) : data === undefined || isLoading ? (
        <Skeleton h='512px' w='100%' />
      ) : foilHoles === null ? (
        <Heading variant='notFound' size='md' h='512px' w='100%' alignContent='center'>
          No foil holes available
        </Heading>
      ) : (
        <HeatmapOverlay
          image={`grid-squares/${gridSquareId}/image`}
          options={HEATMAP_VALUES[heatmapMetric]}
          onItemClicked={handleFoilHoleClicked}
          items={foilHoles}
          selectedItem={foilHoleId}
          hideNull={searchParams.get("hideHoles") === "true"}
        >
          <HStack>
            <Text>Display heatmap for</Text>
            <Select
              w='10em'
              variant='hi-contrast'
              p='1px'
              onChange={(e) => setHeatmapMetric(e.target.value as FoilHoleMetricTypes)}
              value={heatmapMetric}
            >
              <option key={"resolution"} value={"resolution"}>
                Resolution
              </option>
              <option key={"particleCount"} value={"particleCount"}>
                Particle Count
              </option>
              <option key={"astigmatism"} value={"astigmatism"}>
                Astigmatism
              </option>
            </Select>
          </HStack>
        </HeatmapOverlay>
      )}
      <VStack zIndex={2} divider={<Divider />} w='100%' alignItems='start'>
        <Heading mt='0.5em' size='lg'>
          Movies
        </Heading>
        {!movies ? (
          foilHoleId ? (
            <Heading w='100%' variant='notFound' size='md' h='5em' alignContent='center'>
              No movies available
            </Heading>
          ) : (
            <Heading w='100%' variant='notFound' size='md' h='5em' alignContent='center'>
              No foil hole selected
            </Heading>
          )
        ) : (
          <Grid w='100%' gridGap='0.5em' templateColumns='repeat(auto-fill, minmax(150px, 1fr))'>
            {movies.map((movie) => (
              <Link
                key={movie.movieId}
                href={`spa?movie=${movie.movieNumber}`}
                aria-label={movie.movieId.toString()}
              >
                <Image
                  alt={movie.movieId.toString()}
                  src={prependApiUrl(`movies/${movie.movieId}/micrograph`)}
                  fallbackSrc='/images/loading.png'
                ></Image>
              </Link>
            ))}
          </Grid>
        )}
      </VStack>
    </VStack>
  );
};
