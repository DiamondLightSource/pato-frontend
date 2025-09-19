import {
  Button,
  Divider,
  Heading,
  useToast,
  VStack,
  Text,
  FormControl,
  FormLabel,
  Input,
  HStack,
} from "@chakra-ui/react";
import { FormEvent, useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router";

import "styles/upload.css";
import { client } from "utils/api/client";

export interface UploadFormProps {
  requestUrl: string;
  fileExtension: string;
  redirectUrl: string;
  title: string;
}

const UploadForm = ({ requestUrl, fileExtension, redirectUrl, title }: UploadFormProps) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const uploadFile = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const data = new FormData(e.currentTarget);

      setLoading(true);
      const resp = await client.post(requestUrl, data);
      setLoading(false);

      if (resp.status === 200) {
        toast({ status: "success", title: "Model successfully uploaded!" });
        navigate(redirectUrl);
      } else {
        toast({
          status: "error",
          title: "Upload failed!",
          description: resp.data.detail || "Internal server error",
        });
      }
    },
    [toast, navigate, redirectUrl, requestUrl]
  );

  return (
    <form onSubmit={uploadFile} encType='multipart/form-data'>
      <HStack>
        <FormControl>
          <FormLabel size='sm' mt='1.5em'>
            {title}:
          </FormLabel>
          <Input
            name='file'
            data-testid={`file-input-${fileExtension}`}
            type='file'
            accept={fileExtension}
            h='auto'
          />
        </FormControl>
        <Button
          ml='1em'
          mt='3.5em'
          w='10em'
          type='submit'
          data-testid={`submit-${fileExtension}`}
          loadingText='Uploading'
          isLoading={loading}
        >
          Submit
        </Button>
      </HStack>
    </form>
  );
};

export const UploadModelPage = () => {
  const { propId, visitId } = useParams();

  return (
    <VStack alignItems='start' className='about-text'>
      <Heading>Upload Model</Heading>
      <Divider />
      <Text>
        Upload custom initial model, or custom particle picking model (crYOLO). These models will be
        placed in your visit directory.
      </Text>
      <UploadForm
        requestUrl={`proposals/${propId}/sessions/${visitId}/processingModel`}
        redirectUrl={`/proposals/${propId}/sessions/${visitId}`}
        fileExtension='.h5'
        title='Particle picking model(crYOLO)'
      />
      <UploadForm
        requestUrl={`proposals/${propId}/sessions/${visitId}/initialModel`}
        redirectUrl={`/proposals/${propId}/sessions/${visitId}`}
        fileExtension='.mrc'
        title='Initial reference model'
      />
    </VStack>
  );
};
