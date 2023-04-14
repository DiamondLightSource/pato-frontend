import { Input, InputProps } from "@chakra-ui/react";
import { FormEvent } from "react";

interface DebounceProps extends InputProps {
  onChangeEnd: (text: string) => void;
}

const debounce = (fn: Function, ms = 300) => {
  let timer: NodeJS.Timeout;

  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
};

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
