import { FC, ReactNode } from "react";
import { Button } from "@radix-ui/themes";

interface VoteButtonProps {
  children: ReactNode;
  onClick: () => void;
  disabled: boolean;
  selected: boolean;
}

const VoteButton: FC<VoteButtonProps> = ({
  children,
  onClick,
  disabled,
  selected,
}) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant={selected ? "soft" : "outline"}
      color={selected ? "green" : "gray"}
      size="3"
      className="w-full"
    >
      {children}
    </Button>
  );
};

export default VoteButton;
