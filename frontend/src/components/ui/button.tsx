import { Button as ChakraButton, ButtonProps } from "@chakra-ui/react"
import { forwardRef } from "react"

export interface CustomButtonProps extends ButtonProps {
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, CustomButtonProps>(
  function Button(props, ref) {
    const { loading, disabled, children, ...rest } = props
    
    return (
      <ChakraButton
        ref={ref}
        disabled={disabled}
        borderRadius="full"
        fontWeight="medium"
        transition="all 0.2s"
        {...rest}
      >
        {children}
      </ChakraButton>
    )
  }
)
