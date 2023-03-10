import { createStandaloneToast, Grid } from "@chakra-ui/react";
import { useCallback } from "react";
import { client } from "utils/api/client";
import { Form } from "components/form/form";
import { FormItem, NumericInput } from "components/form/input";
import { baseToast } from "styles/components";

interface ReprocessingProps {
  pixelSize?: number;
  collectionId: number;
  onClose?: () => void;
}

const TomogramReprocessing = ({ pixelSize, collectionId, onClose }: ReprocessingProps) => {
  const { toast } = createStandaloneToast();

  const handleSubmit = useCallback(
    (formData: Record<string, any>) => {
      client.post(`dataCollections/${collectionId}/tomograms/reprocessing`, formData).then((response) => {
        if (response.status !== 202) {
          toast({
            ...baseToast,
            title: "Error while initiating pipeline",
            description: response.data.detail,
            status: "error",
          });
        } else {
          toast({
            ...baseToast,
            title: "Reprocessing succesfully initiated!",
          });

          if (onClose) {
            onClose();
          }
        }
      });
    },
    [collectionId, toast, onClose]
  );

  return (
    <Form onClose={onClose} onSubmit={handleSubmit}>
      <Grid py={2} templateColumns='repeat(2, 1fr)' gap={2}>
        <FormItem label='Pixel Size' unit='Å'>
          <NumericInput name='pixelSize' precision={0} defaultValue={pixelSize ?? 1} />
        </FormItem>
        <FormItem label='Tilt Offset' unit='°'>
          <NumericInput name='tiltOffset' precision={2} defaultValue={1} />
        </FormItem>
      </Grid>
    </Form>
  );
};

export default TomogramReprocessing;
