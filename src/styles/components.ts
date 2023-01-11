import { defineStyleConfig, ToastProps, defineStyle, createMultiStyleConfigHelpers } from "@chakra-ui/react";
import { cardAnatomy } from '@chakra-ui/anatomy'

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
            _even: {
              bg: "diamond.50"
            },
            _hover: {
              bg: "diamond.200"
            }
          }
        }
      }
    }
  })

const CardHeader = defineStyleConfig({
  baseStyle: {
    p: "10px !important",
    h: "10%"
  }
})

const CardBody = defineStyleConfig({
  baseStyle: {
    p: 2,
    h: "90%"
  }
})

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(cardAnatomy.keys)

const baseCardStyle = definePartsStyle({
  container: {
    p:1,
    borderWidth:'1px',
    borderRadius:'lg',
    _hover: {
      borderColor: "diamond.200",
      cursor: "pointer"
    },
    _selected: {
      background: "diamond.200"
    }
  }, 
  header: {
    p: 2,
    height: "10%" 
  },
  body: {
    px: 2,
    height: "90%"
  }
  }
)

const Card = defineMultiStyleConfig({baseStyle:baseCardStyle, defaultProps:{variant: "outline"}})


const Button = defineStyleConfig({
    defaultProps: {
      variant: "default"
    },
    variants: {
      default: {
        color: "diamond.50",
        bg: "diamond.600",
        _hover: {
          bg: "diamond.500",
          _disabled: {
            bg: "diamond.600"
          }
        }
      },
      pgSelected: {
        bg: "diamond.500",
        color: "diamond.50",
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

const notFound = defineStyle({
  textAlign: "center",
  color: 'diamond.300'
})

const notFoundSubtitle = defineStyle({
  ...notFound,
  fontWeight: 200,
  size: 'md',
  paddingBottom: 10
})
const Heading = defineStyleConfig({
  variants:
  {
    collection,
    notFound,
    notFoundSubtitle
  }
})

export { Accordion, Button, Table, Text, Heading, Card, CardHeader, CardBody, baseToast };
