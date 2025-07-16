import { Button, Divider, Heading, useToast, VStack, Text, Code } from "@chakra-ui/react";
import { FormEvent, useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router";

import "styles/upload.css";
import { client } from "utils/api/client";

export const UploadModelPage = () => {
  const { propId, visitId } = useParams();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const uploadFile = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const data = new FormData(e.currentTarget);

      setLoading(true);
      const resp = await client.post(
        `proposals/${propId}/sessions/${visitId}/processingModel`,
        data
      );
      setLoading(false);

      if (resp.status === 200) {
        toast({ status: "success", title: "Model successfully uploaded!" });
        navigate(`/proposals/${propId}/sessions/${visitId}`);
      } else {
        toast({
          status: "error",
          title: "Upload failed!",
          description: resp.data.detail || "Internal server error",
        });
      }
    },
    [propId, visitId, toast, navigate]
  );

  return (
    <VStack alignItems='start' className='about-text' mt='1em'>
      <Heading>Upload Model</Heading>
      <Divider />
      <Text>
        Upload custom model for particle picking (crYOLO). This model will be placed under the{" "}
        <Code>processing</Code> directory in your visit directory.
      </Text>
      <form onSubmit={uploadFile} encType='multipart/form-data'>
        <input name='file' data-testid='file-input' type='file' accept='.h5' />
        <Button w='8em' type='submit' loadingText='Uploading' isLoading={loading}>
          Submit
        </Button>
      </form>
    </VStack>
  );
};
