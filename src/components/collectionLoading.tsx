import { VStack, Skeleton, Heading } from "@chakra-ui/react";
import { useAppSelector } from "../store/hooks";

const CollectionLoader = () => {
  const loading = useAppSelector((state) => state.ui.loading);

  if (loading) {
    return (
      <VStack py={3} spacing={2} h='70vh'>
        <Skeleton h='3vh' w='100%' />
        <Skeleton h='33vh' w='100%' />
        <Skeleton h='25vh' w='100%' />
      </VStack>
    );
  }

  return (
    <span style={{ margin: "auto", width: "60%", display: "block" }}>
      <Heading paddingTop={10} variant="notFound">
        Data collection group has no data collections
      </Heading>
      <Heading variant="notFoundSubtitle">
        ...or you could not have permission to view the contents of this collection group. If this page was sent to you
        through a link, ask the person who sent it if you're included in the parent session.
      </Heading>
    </span>
  );
};

export { CollectionLoader };
