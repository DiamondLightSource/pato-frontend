import { defineStyleConfig, ToastProps, defineStyle } from "@chakra-ui/react";

const baseToast: ToastProps = {
  id: "main-toast",
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
        fontSize: "xs",
      },
    },
  })

  const Table = defineStyleConfig({
    variants: {
      diamondStriped: {
        tbody: {
          tr: {
            _odd: {
              bg: "diamond.100"
            },
            _hover: {
              bg: "diamond.200"
            }
          }
        }
      }
    }
  })

const Button = defineStyleConfig({
    defaultProps: {
      colorScheme: "diamond",
    },
    variants: {
      pgSelected: {
        bg: "diamond.500",
        color: "#FFF",
        cursor: "default"
      },
      pgNotSelected: {
        bg: "gray.200",
        color: "charcoal",
        fontSize: "sm",
        _hover: {
          bg: "diamond.200"
        }
      },
    },
  })

const collection = defineStyle({
    fontSize: 20,

})

const Heading = defineStyleConfig({
  variants:
  {
    collection
  }
})

export { Accordion, Button, Table, Text, Heading, baseToast };
