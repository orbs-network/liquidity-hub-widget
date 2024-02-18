import { useDebounce } from "lib/hooks/useDebounce";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { TextInput } from "../../TextInput";
export const TokenSearchInput = ({
  setValue,
  className = ''
}: {
  value: string;
  setValue: (value: string) => void;
  className?: string;
}) => {
  const [localValue, setLocalValue] = useState("");
  const debouncedValue = useDebounce(localValue, 300);

  useEffect(() => {
    setValue(debouncedValue);
  }, [debouncedValue, setValue]);

  return (
    <StyledSearchInput
      className={className}
      placeholder="Search..."
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
    />
  );
};


export const StyledSearchInput = styled(TextInput)({
  color: 'white',
  marginRight: 15

});