import { HStack, Skeleton, Box, VStack } from "@chakra-ui/react";
import { useMemo } from "react";
import { client, prependApiUrl } from "utils/api/client";
import { components } from "schema/main";
import { ClassificationProps } from "schema/interfaces";
import { MolstarModal } from "components/molstar/molstarModal";
import { useQuery } from "@tanstack/react-query";
import { ImageCard, ScatterPlot } from "@diamondlightsource/ui-components";
import { PlotContainer } from "components/visualisation/plotContainer";

type ClassificationSchema = components["schemas"]["Classification"];
interface FullClassification extends ClassificationSchema {
  imageUrl: string;
}

const fetchClassData = async (autoProcId: number) => {
  const promises = [
    client.safeGet(`autoProc/${autoProcId}/bFactorFit`),
    client.safeGet(`autoProc/${autoProcId}/classification?limit=1&classType=3d`),
  ];

  const [bFactorResponse, classResponse] = await Promise.all(promises);

  const firstClass: FullClassification = classResponse.data.items[0];

  return {
    data: bFactorResponse.data.items.map((item: any) => ({
      x: item.numberOfParticles,
      y: item.resolution,
    })),
    particleClassificationId: firstClass.particleClassificationId,
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
      `autoProc/${autoProcId}/classification/${data.particleClassificationId}/angleDistribution`
    );
  }, [data, autoProcId]);
  return (
    <Box w='100%'>
      {data ? (
        <HStack my='1em' w='100%' alignItems='stretch' flexWrap='wrap'>
          <VStack h='300px' flex='1 0 250px' alignItems='start'>
            <PlotContainer>
              <ScatterPlot
                data={data.data}
                options={{ x: { label: "ln(numOfParticles)" }, y: { label: "1/res^2" } }}
              />
            </PlotContainer>
            <MolstarModal autoProcId={autoProcId} classId={data.particleClassificationId} />
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
    </Box>
  );
};

export { RefinementStep };
