import { cn } from "../../libs/utils";

type ErrorTextProps = React.HTMLAttributes<HTMLElement>;

const ErrorText = ({ className, children }: ErrorTextProps) => {
  return <p className={cn("text-left text-error", className)}>{children}</p>;
};

export default ErrorText;
