import { extendTheme } from "@chakra-ui/react";
import { colours } from "styles/colours";
import {
  Accordion,
  Button,
  Checkbox,
  Heading,
  Table,
  Card,
  Tabs,
  Code,
  Text,
  Input,
  Textarea,
} from "styles/components";

export const theme = extendTheme({
  colors: colours,
  components: {
    Accordion,
    Checkbox,
    Button,
    Text,
    Heading,
    Table,
    Card,
    Tabs,
    Code,
    Input,
    Textarea,
  },
  breakpoints: {
    sm: "30em",
    md: "48em",
    lg: "62em",
    xl: "80em",
    "2xl": "150em",
  },
});
