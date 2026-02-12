import { Input as ChakraInput, InputProps } from "@chakra-ui/react"
import { forwardRef } from "react"

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input(props, ref) {
    return (
      <ChakraInput
        ref={ref}
        borderRadius="full"
        {...props}
      />
    )
  }
)
