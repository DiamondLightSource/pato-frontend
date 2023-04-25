import { Input, InputProps } from "@chakra-ui/react";
import { FormEvent } from "react";
import { debounce } from "utils/generic";

interface DebounceProps extends InputProps {
  onChangeEnd: (text: string) => void;
}

const DebouncedInput = ({ onChangeEnd, ...props }: DebounceProps) => {
  const handleUpdate = debounce((event: FormEvent<HTMLInputElement>) =>
    onChangeEnd((event.target as HTMLInputElement).value)
  );

  return (
    <Input
      onKeyUp={(e) => {
        if (e.key === "Enter") {
          onChangeEnd(e.currentTarget.value);
        }
      }}
      onBlur={(e) => onChangeEnd(e.currentTarget.value)}
      onChange={handleUpdate}
      {...props}
    />
  );
};

export { DebouncedInput };
