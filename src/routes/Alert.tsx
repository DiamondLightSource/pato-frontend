import {
  Divider,
  Heading,
  HStack,
  Box,
  Input,
  Text,
  createStandaloneToast,
  UseToastOptions,
} from "@chakra-ui/react";
import { Form } from "components/form/form";
import { FormItem } from "components/form/input";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { baseToast } from "@diamondlightsource/ui-components";
import { client } from "utils/api/client";
import { useMemo, useState } from "react";
import { pascalToSpace } from "utils/generic";
import { useLoaderData, useNavigate, useParams } from "react-router-dom";
import { UserWithEmail } from "loaders/user";

export interface AlertValues {
  email: string;
  astigmatismMin?: string;
  astigmatismMax?: number;
  defocusMin?: number;
  defocusMax?: number;
  resolutionMin?: number;
  resolutionMax?: number;
  particleCountMin?: number;
  particleCountMax?: number;
}

const getFieldWithSuffix = (fieldName: string, suffix: "Min" | "Max") =>
  (fieldName + suffix) as keyof AlertValues;

// This is not up to RFC822, but this doesn't need to be thorough
const emailRegex = /.+@.+\..+/g;
const errorToast: UseToastOptions = {
  ...baseToast,
  title: "An error has occurred while registering your alerts. Please try again later.",
  status: "error",
};

const AlertField = ({
  fieldName,
  isPositive,
  unit,
}: {
  fieldName: string;
  isPositive: boolean;
  unit?: string;
}) => {
  const fieldNameMin = useMemo(() => getFieldWithSuffix(fieldName, "Min"), [fieldName]);
  const fieldNameMax = useMemo(() => getFieldWithSuffix(fieldName, "Max"), [fieldName]);

  const {
    register,
    formState: { errors },
  } = useFormContext<AlertValues>();

  return (
    <>
      <HStack alignItems='first baseline'>
        <Heading size='md' pt='1em'>
          {pascalToSpace(fieldName)}
        </Heading>
        {unit && (
          <Text fontSize={14} color='diamond.300'>
            ({unit})
          </Text>
        )}
      </HStack>

      <Divider />
      <HStack pb='1em' pt='0.5em'>
        <FormItem label='Min' unit='' error={errors[fieldNameMin]}>
          <Input
            data-testid={fieldNameMin}
            variant='hi-contrast'
            borderColor={errors[fieldNameMin] && "red"}
            {...register(fieldNameMin, {
              valueAsNumber: true,
              min: isPositive ? { value: 0, message: `Value must be positive` } : undefined,
            })}
          />
        </FormItem>
        <FormItem label='Max' unit='' error={errors[fieldNameMax]}>
          <Input
            data-testid={fieldNameMax}
            variant='hi-contrast'
            borderColor={errors[fieldNameMax] && "red"}
            {...register(fieldNameMax, {
              valueAsNumber: true,
              min: isPositive ? 0 : undefined,
              validate: {
                greaterThanMin: (v, values) =>
                  !values[fieldNameMin] ||
                  !v ||
                  v > values[fieldNameMin] ||
                  "Maximum must be greater than minimum",
              },
            })}
          />
        </FormItem>
      </HStack>
    </>
  );
};

const AlertPage = () => {
  const { toast } = createStandaloneToast();
  const { groupId } = useParams();
  const navigate = useNavigate();
  const user = useLoaderData() as UserWithEmail;
  const form = useForm<AlertValues>({ defaultValues: { email: user?.email ?? undefined } });
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = form.handleSubmit(async (info) => {
    setIsLoading(true);
    const response = await client.post(`dataGroups/${groupId}/alerts`, info);
    setIsLoading(false);

    if (response.status !== 200) {
      toast(errorToast);
    } else {
      toast({ ...baseToast, title: "Alert successfully registered!" });
      navigate("..", { relative: "path" });
      return;
    }
  });

  return (
    <Box h='100%'>
      <Heading>Set Up Alerts</Heading>
      <Divider mb={4} />
      <Text pb='1em'>
        Set alert thresholds for this data collection group. You will be emailed whenever any of the
        following values exceed your configured limits.
      </Text>
      <FormProvider {...form}>
        <Form onSubmit={onSubmit} onClose={() => navigate(-1)} isLoading={isLoading} maxW='600px'>
          <FormItem
            label='Email'
            unit='required'
            helperText='Address used for alerts'
            error={form.formState.errors.email}
          >
            <Input
              borderColor={form.formState.errors.email && "red"}
              {...form.register("email", {
                required: "Required",
                pattern: { value: emailRegex, message: "Invalid email address" },
              })}
              variant='hi-contrast'
            />
          </FormItem>
          <AlertField fieldName='astigmatism' isPositive={false} unit='nm' />
          <AlertField fieldName='defocus' isPositive={false} unit='Å' />
          <AlertField fieldName='particleCount' isPositive={true} />
          <AlertField fieldName='resolution' isPositive={true} unit='Å' />
        </Form>
      </FormProvider>
    </Box>
  );
};

export default AlertPage;
