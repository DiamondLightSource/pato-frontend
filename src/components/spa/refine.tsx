import {
  HStack,
  Skeleton,
  Box,
  VStack,
  Alert,
  AlertIcon,
  Text,
  Link,
  Divider,
  Spacer,
} from "@chakra-ui/react";
import { useMemo } from "react";
import { client, prependApiUrl } from "utils/api/client";
import { components } from "schema/main";
import { ClassificationProps } from "schema/interfaces";
import { MolstarModal } from "components/molstar/molstarModal";
import { useQuery } from "@tanstack/react-query";
import { ImageCard, InfoGroup, ScatterPlot } from "@diamondlightsource/ui-components";
import { PlotContainer } from "components/visualisation/plotContainer";

type ClassificationSchema = components["schemas"]["Classification"];
interface FullClassification extends ClassificationSchema {
  imageUrl: string;
}

const fetchClassData = async (autoProcId: number) => {
  const promises = [
    client.safeGet(`autoProc/${autoProcId}/bFactorFit`),
    client.safeGet(`autoProc/${autoProcId}/classification?limit=2&classType=3d`),
  ];

  const [bFactorResponse, classResponse] = await Promise.all(promises);

  const classes: FullClassification[] = classResponse.data.items;
  const firstClass = classes[0];

  const bestResolution = Math.min(...classes.map(particleClass => particleClass.estimatedResolution))

  return {
    data: bFactorResponse.data.items.map((item: any) => ({
      x: item.numberOfParticles,
      y: item.resolution,
    })),
    classes: classResponse.data.items as FullClassification[],
    bFactor: [
      { label: "Intercept", value: firstClass.bFactorFitIntercept?.toFixed(3) ?? "?" },
      {
        label: "Slope",
        value: firstClass.bFactorFitLinear?.toFixed(3) ?? "?",
      },
      {
        label: "B-Factor",
        value: firstClass.bFactorFitLinear ? (2 / firstClass.bFactorFitLinear).toFixed(3) : "?",
      },
      {
        label: "Best Resolution",
        value: bestResolution.toFixed(2) + " Å",
      }
    ],
  };
};

const RefinementStep = ({ autoProcId }: ClassificationProps) => {
  const { data } = useQuery({
    queryKey: ["refinement", autoProcId],
    queryFn: async () => await fetchClassData(autoProcId),
  });

  const angDistImageUrl = useMemo(() => {
    if (!data) return undefined;
    return prependApiUrl(
      `autoProc/${autoProcId}/classification/${data.classes[0].particleClassificationId}/angleDistribution`
    );
  }, [data, autoProcId]);
  return (
    <Box w='100%'>
      <Alert my='10px' status='info' colorScheme='gray' variant='left-accent'>
        <AlertIcon />
        Particles are binned by a factor of 2 before refinement. The maximum achievable resolution
        is therefore 4 times the pixel size used for data collection. Refinement is performed at a
        number of different particle batch sizes to give an indication of how resolution is
        improving with the number of particles.
      </Alert>
      <Alert my='10px' status='warning' colorScheme='yellow' variant='left-accent'>
        <AlertIcon />
        Resolution estimates are approximate and should not be taken as an indication of data
        quality. Masks are not optimised and the performance of earlier automated processing steps
        will affect the results. If the refined map looks correct you should expect to be able to
        improve on these resolution values.
      </Alert>
      {data ? (
        <HStack my='1em' w='100%' flexWrap='wrap'>
          <VStack h='300px' flex='1 0 250px' alignItems='start'>
            <PlotContainer title='3D Refinement'>
              <ScatterPlot
                data={data.data}
                options={{
                  x: { label: "ln(numOfParticles)" },
                  y: { label: "1/res^2" },
                  points: { dotRadius: 4 },
                }}
              />
            </PlotContainer>
            <HStack w='100%' alignItems='center' flexWrap='wrap'>
              {data.classes.map((class3d) => (
                <MolstarModal
                  key={class3d.particleClassificationId}
                  autoProcId={autoProcId}
                  classId={class3d.particleClassificationId}
                  buttonText={`Open 3D Visualisation (${class3d.symmetry})`}
                  w='18em'
                />
              ))}
              <Spacer />
              <Box minW="80px">
                <InfoGroup info={data.bFactor} cols={2}></InfoGroup>
              </Box>
            </HStack>
          </VStack>
          <ImageCard
            flex='0 0 500px'
            title='Angle Distribution'
            src={angDistImageUrl}
            height='300px'
            width='500px'
          ></ImageCard>
        </HStack>
      ) : (
        <Skeleton w='100%' h='500px' />
      )}
      <Divider borderColor='diamond.300' />
      <Text w='100%' mt='1em'>
        Rosenthal, PB, Henderson, R., J. Mol. Biol. 333, 721–745 (2003){" "}
        <Link color='diamond.600'>https://pubmed.ncbi.nlm.nih.gov/14568533/</Link>
      </Text>
    </Box>
  );
};

export { RefinementStep };
