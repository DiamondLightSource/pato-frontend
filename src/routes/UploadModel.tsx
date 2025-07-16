import { Button, Divider, Heading, useToast, VStack, Text, Code, Progress } from "@chakra-ui/react";
import { FormEvent, useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router";

import "styles/upload.css";
import { prependApiUrl } from "utils/api/client";

export const UploadModelPage = () => {
  const { propId, visitId } = useParams();
  const toast = useToast();
  const [progress, setProgress] = useState<number | null>(null);

  const navigate = useNavigate();

  const uploadFile = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const data = new FormData(e.currentTarget);
      const xhr = new XMLHttpRequest();

      // I'm using the old XHR API because ReadableStreams don't work well with multipart form data;
      // binary files stream just fine, but multipart is missing the boundaries and headers, which
      // makes the backend error out. There are libraries to handle this, but this is the simplest
      // way that doesn't introducte any dependencies
      xhr.upload.addEventListener("progress", (event) => {
        setProgress((event.loaded / event.total) * 100);
      });

      xhr.upload.addEventListener("error", () => {
        toast({
          status: "error",
          title: "Upload failed!",
          description: "Internal server error",
        });
      });

      xhr.upload.addEventListener("load", () => {
        toast({ status: "success", title: "Model successfully uploaded!" });
        navigate(`/proposals/${propId}/sessions/${visitId}`);
      });

      xhr.open("POST", prependApiUrl(`proposals/${propId}/sessions/${visitId}/processingModel`));
      xhr.send(data);
    },
    [propId, visitId, toast, navigate]
  );

  return (
    <VStack alignItems='start' className='about-text' mt='1em'>
      <Heading>Upload Model</Heading>
      <Divider />
      <Text>
        Upload custom model for particle picking (crYOLO). This model will be placed under the <Code>processing</Code>{" "}
        directory in your visit directory.
      </Text>
      <form onSubmit={uploadFile} encType='multipart/form-data'>
        <input name='file' data-testid='file-input' type='file' accept='.h5' />
        <Button
          w='12em'
          type='submit'
          loadingText={progress !== null ? (progress === 100 ? "Processing" : `${progress.toFixed(1)}%`) : null}
          isLoading={progress !== null}
        >
          Submit
        </Button>
      </form>
      {progress !== null && (
        <Progress isIndeterminate={progress === 100} value={progress < 100 ? progress : undefined} width='12em' />
      )}
    </VStack>
  );
};
