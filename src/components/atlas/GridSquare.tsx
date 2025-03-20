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
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { components } from "schema/main";
import { client, prependApiUrl } from "utils/api/client";
import "styles/atlas.css";

type FoilHole = components["schemas"]["FoilHole"];

export interface GridSquareProps {
  gridSquareId: number | null;
}

const fetchFoilHoles = async (gridSquareId: number | null) => {
  if (!gridSquareId) {
    return null;
  }

  const foilHoles = await client.safeGet(`grid-squares/${gridSquareId}/foil-holes?limit=3000`);

  return foilHoles.status === 200 ? (foilHoles.data.items as FoilHole[]) : null;
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

  const { data, isLoading } = useQuery({
    queryKey: ["foilHoles", gridSquareId],
    queryFn: async () => await fetchFoilHoles(gridSquareId),
  });

  const { data: movies } = useQuery({
    queryKey: ["foilHoleMovies", foilHoleId],
    queryFn: async () => await fetchMovies(foilHoleId),
  });

  const handleFoilHoleClicked = useCallback(
    (foilHole: FoilHole) => {
      if (gridSquareId === null || foilHole.foilHoleId === null || foilHole.movieCount === 0) {
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

  const handleFoilHide = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams((prev) => {
      prev.set("hideHoles", e.target.checked.toString());
      return prev;
    });
  };

  const sortHole = (
    foilHole: components["schemas"]["FoilHole"],
    selectedFoilHole: number | null
  ) => {
    const hideUncollectedHoles = searchParams.get("hideHoles") === "true";
    return foilHole.movieCount === 0
      ? hideUncollectedHoles
        ? {
            visibility: "hidden",
          }
        : {
            stroke: "red",
            strokeOpacity: "0.4",
            fill: "red",
            fillOpacity: "0.2",
          }
      : {
          role: "button",
          stroke: "green",
          fill: selectedFoilHole === foilHole.foilHoleId ? "blue" : "green",
          fillOpacity: "0.4",
          cursor: "pointer",
        };
  };

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
      ) : data === null ? (
        <Heading variant='notFound' size='md' h='512px' w='100%' alignContent='center'>
          No foil holes available
        </Heading>
      ) : (
        <div style={{ width: "100%" }} className='img-wrapper'>
          <img src={prependApiUrl(`grid-squares/${gridSquareId}/image`)} alt='Grid Square' />
          <svg viewBox={"0 0 512 512"}>
            {data.map((foilHole: components["schemas"]["FoilHole"], i) => (
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
