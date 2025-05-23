import { createStandaloneToast, Grid, NumberInput, NumberInputField } from "@chakra-ui/react";
import { client } from "utils/api/client";
import { Form } from "components/form/form";
import { FormItem, NumericStepper } from "components/form/input";
import { baseToast } from "@diamondlightsource/ui-components";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { useRevalidator } from "react-router";

export interface ReprocessingProps {
  pixelSize?: number;
  collectionId: number;
  onClose?: () => void;
}

export interface TomogramReprocessingValues {
  pixelSize: number;
  tiltOffset: number;
}

const TomogramReprocessing = ({ pixelSize, collectionId, onClose }: ReprocessingProps) => {
  const queryClient = useQueryClient();
  const revalidator = useRevalidator();
  const { toast } = createStandaloneToast();
  const { handleSubmit, register } = useForm<TomogramReprocessingValues>();

  const onSubmit = handleSubmit((formData) => {
    client
      .post(`dataCollections/${collectionId}/reprocessing/tomograms`, formData)
      .then((response) => {
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
          queryClient.removeQueries({ queryKey: ["tomogramAutoProc"] });
          revalidator.revalidate();

          if (onClose) {
            onClose();
          }
        }
      });
  });

  return (
    <Form onClose={onClose} onSubmit={onSubmit} m={3}>
      <Grid py={2} templateColumns='repeat(2, 1fr)' gap={2}>
        <FormItem label='Pixel Size' unit='Å'>
          <NumberInput size='sm' precision={0} defaultValue={pixelSize ?? 1}>
            <NumberInputField {...register("pixelSize", { required: true })} />
            <NumericStepper />
          </NumberInput>
        </FormItem>
        <FormItem label='Tilt Offset' unit='°'>
          <NumberInput size='sm' precision={2} defaultValue={1}>
            <NumberInputField {...register("tiltOffset", { required: true })} />
            <NumericStepper />
          </NumberInput>
        </FormItem>
      </Grid>
    </Form>
  );
};

export default TomogramReprocessing;
