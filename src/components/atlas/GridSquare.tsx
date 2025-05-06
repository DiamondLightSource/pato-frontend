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
  Box,
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
import { pascalToSpace } from "utils/generic";

type FoilHole = components["schemas"]["FoilHole"];

export interface GridSquareProps {
  gridSquareId: number | null;
}

export interface FoilHoleWithColour extends FoilHole {
  colour?: string;
}

const HEATMAP_PALETTE = ["#fde725", "#5ec962", "#21918c", "#3b528b", "#440154"];
const MEAS_UNITS = {
  resolution: "Å",
  astigmatism: "nm",
  particleCount: "units",
  defocus: "μm",
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

    const sortedFoilHoles: FoilHoleWithColour[] = data
      .filter((f) => f[heatmapMetric] !== null)
      .sort((a, b) => a[heatmapMetric]! - b[heatmapMetric]!);
    const binSize = Math.round(sortedFoilHoles.length / 5);

    const bins: number[] = [];

    for (let i = 0; i < 5; i++) {
      const index = binSize * i;
      bins.push(sortedFoilHoles[index][heatmapMetric]!);
    }

    for (let i = 0; i < sortedFoilHoles.length; i++) {
      const index = Math.floor(i / binSize);
      sortedFoilHoles[i].colour =
        HEATMAP_PALETTE[index >= HEATMAP_PALETTE.length ? HEATMAP_PALETTE.length - 1 : index];
    }

    const allFoilHoles = [
      ...sortedFoilHoles,
      ...data.filter((foilHole) => foilHole[heatmapMetric] === null),
    ];

    return { bins, items: allFoilHoles };
  }, [data, heatmapMetric]);

  const handleFoilHoleClicked = useCallback(
    (foilHole: FoilHole) => {
      if (gridSquareId === null || foilHole.movieCount === 0) {
        return;
      }

      /* 
      Search params are set like this so as not to overwrite hideSquares. 
      See the example in the React Router docs:
      https://api.reactrouter.com/v7/types/react_router.SetURLSearchParams.html
      */
      setSearchParams((prev) => {
        prev.set("gridSquare", gridSquareId.toString());
        prev.set("foilHole", foilHole.foilHoleId.toString());
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

  const sortHole = useCallback(
    (foilHole: FoilHoleWithColour, selectedFoilHole: number | null) => {
      const hideUncollectedHoles = searchParams.get("hideHoles") === "true";
      const isSelected = selectedFoilHole === foilHole.foilHoleId;
      return foilHole.movieCount === 0
        ? hideUncollectedHoles
          ? {
              visibility: "hidden",
            }
          : {
              stroke: "red",
              strokeOpacity: "0.4",
              fill: "black",
              fillOpacity: "0.2",
            }
        : {
            role: "button",
            stroke: isSelected ? "white" : foilHole.colour,
            fill: foilHole.colour,
            fillOpacity: isSelected ? "0.8" : "0.4",
            cursor: "pointer",
          };
    },
    [searchParams]
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
        <VStack w='100%'>
          <div style={{ width: "100%" }} className='img-wrapper'>
            <img src={prependApiUrl(`grid-squares/${gridSquareId}/image`)} alt='Grid Square' />
            <svg viewBox={"0 0 512 512"}>
              {foilHoles.items.map((foilHole, i) => (
                <circle
                  key={i}
                  data-testid={`foilHole-${i}`}
                  cx={foilHole.x}
                  cy={foilHole.y}
                  r={foilHole.diameter / 2}
                  onClick={() => handleFoilHoleClicked(foilHole)}
                  {...sortHole(foilHole, foilHoleId)}
                />
              ))}
            </svg>
          </div>
          <HStack zIndex={2} w='100%' flexWrap='wrap'>
            <VStack gap='2px'>
              <HStack gap='1px'>
                {HEATMAP_PALETTE.map((colour, i) => (
                  <VStack alignItems='left'>
                    <Box bg={colour} key={colour} h='12px' w='60px'></Box>
                    <Text fontSize='12px'>{foilHoles.bins[i].toFixed(1)}</Text>
                  </VStack>
                ))}
              </HStack>

              <Text fontSize='12px'>
                {pascalToSpace(heatmapMetric)} ({MEAS_UNITS[heatmapMetric]})
              </Text>
            </VStack>
            <Spacer />
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
                <option key={"defocus"} value={"defocus"}>
                  Defocus
                </option>
              </Select>
            </HStack>
          </HStack>
        </VStack>
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
