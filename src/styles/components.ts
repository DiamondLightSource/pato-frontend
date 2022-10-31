import { defineStyleConfig, ToastProps, defineStyle } from "@chakra-ui/react";

const baseToast: ToastProps = {
  status: "success",
  duration: 4000,
  isClosable: true,
};

const Accordion = defineStyleConfig({
    baseStyle: {
      container: {
        border: "1px solid var(--chakra-colors-diamond-100)",
      },
    },
  })

const Text = defineStyleConfig({
    variants: {
      infoGroupText: {
        wordBreak: "break-all",
        display: "inline",
        fontSize: "sm",
      },
    },
  })


const Button = defineStyleConfig({
    defaultProps: {
      colorScheme: "diamond",
    },
    variants: {
      pgSelected: {
        bg: "diamond.500",
        color: "#FFF",
      },
      pgNotSelected: {
        bg: "gray.200",
        color: "charcoal",
        fontSize: "sm",
      },
    },
  })

const collection = defineStyle({
    fontSize: 20,
    paddingTop: 4,

})

const Heading = defineStyleConfig({
  variants:
  {
    collection
  }
})

export { Accordion, Button, Text, Heading, baseToast };
