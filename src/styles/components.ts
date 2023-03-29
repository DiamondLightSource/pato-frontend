import {
  defineStyleConfig,
  ToastProps,
  defineStyle,
  createMultiStyleConfigHelpers,
} from "@chakra-ui/react";
import { cardAnatomy, tabsAnatomy } from "@chakra-ui/anatomy";

const baseToast: ToastProps = {
  id: "main-toast",
  status: "success",
  duration: 6000,
  isClosable: true,
};

const Accordion = defineStyleConfig({
  baseStyle: {
    container: {
      border: "1px solid var(--chakra-colors-diamond-100)",
    },
  },
});

const Text = defineStyleConfig({
  variants: {
    infoGroupText: {
      wordBreak: "break-all",
      display: "inline",
      fontSize: "xs",
    },
  },
});

const Checkbox = defineStyleConfig({
  baseStyle: {
    control: {
      backgroundColor: "#FFF",
    },
  },
});

const Table = defineStyleConfig({
  variants: {
    diamondStriped: {
      tbody: {
        tr: {
          _odd: {
            bg: "diamond.100",
          },
          _even: {
            bg: "diamond.50",
          },
          _hover: {
            bg: "diamond.200",
          },
        },
      },
    },
  },
});

const CardHeader = defineStyleConfig({
  baseStyle: {
    p: "10px !important",
    h: "10%",
  },
});

const CardBody = defineStyleConfig({
  baseStyle: {
    p: 2,
    h: "90%",
  },
});

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(cardAnatomy.keys);

const baseCardStyle = definePartsStyle({
  container: {
    p: 1,
    borderWidth: "1px",
    borderRadius: "lg",
    _hover: {
      borderColor: "diamond.400",
      cursor: "pointer",
    },
    _selected: {
      bg: "diamond.100",
      borderBottom: "3px solid",
      borderColor: "diamond.400",
    },
  },
  header: {
    p: 2,
    cursor: "pointer",
    _hover: {
      color: "diamond.300",
    },
  },
  body: {
    px: 2,
    height: "90%",
  },
});

const Card = defineMultiStyleConfig({
  baseStyle: baseCardStyle,
  defaultProps: { variant: "outline" },
});

const Button = defineStyleConfig({
  defaultProps: {
    variant: "default",
  },
  baseStyle: {},
  variants: {
    default: {
      color: "diamond.50",
      bg: "diamond.600",
      _hover: {
        bg: "diamond.700",
        _disabled: {
          bg: "diamond.600",
        },
      },
    },
    pgSelected: {
      bg: "diamond.600",
      color: "diamond.50",
      cursor: "default",
    },
    pgNotSelected: {
      bg: "gray.200",
      color: "charcoal",
      fontSize: "sm",
      _hover: {
        bg: "diamond.200",
      },
    },
    onBlue: {
      color: "diamond.500",
      borderColor: "diamond.500",
      border: "1px solid",
      fontSize: "sm",
      _hover: {
        color: "diamond.300",
        bg: "diamond.500",
      },
    },
  },
});

const notFound = defineStyle({
  textAlign: "center",
  color: "diamond.300",
});

const Heading = defineStyleConfig({
  variants: {
    collection: {
      fontSize: 20,
      py: "4px",
    },
    notFound,
    notFoundSubtitle: {
      ...notFound,
      fontWeight: 200,
      fontSize: 20,
      paddingBottom: 10,
    },
  },
});

const {
  definePartsStyle: defineTabsStyle,
  defineMultiStyleConfig: defineTabsConfig,
} = createMultiStyleConfigHelpers(tabsAnatomy.keys);

const baseTabsStyle = defineTabsStyle({
  tab: {
    border: "1px solid",
    borderColor: "diamond.200",
    bg: "diamond.75",
    borderBottom: "none",
    _selected: {
      bg: "diamond.50",
      color: "diamond.700",
      borderColor: "inherit",
      borderBottom: "none",
      borderTopColor: "diamond.700",
      mb: "-2px",
    },
  },
  tablist: {
    borderBottom: "none",
  },
  tabpanel: {
    p: "2",
    bg: "diamond.50",
    border: "1px solid",
    borderColor: "inherit",
  },
});

const Tabs = defineTabsConfig({
  baseStyle: baseTabsStyle,
  defaultProps: { variant: "none" },
});

export {
  Accordion,
  Button,
  Table,
  Text,
  Heading,
  Card,
  CardHeader,
  CardBody,
  Tabs,
  baseToast,
  Checkbox,
};
