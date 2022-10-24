import { ToastProps } from "@chakra-ui/react"

const baseToast: ToastProps = {
    status: "success",
    duration: 4000,
    isClosable: true,
}

const defaults = {
    Accordion: {
    baseStyle: {
      container: {
        border: "1px solid var(--chakra-colors-diamond-100)"
      }
    }
  },
  Text: {
    variants: {
        infoGroupText: {
            wordBreak: "break-all",
            display: "inline",
            fontSize: "sm"
        }
    }
  }
}

export {defaults, baseToast}