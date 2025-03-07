import { cn } from "../../libs/utils";

type TextAreaTextProps = {
  labelTitle: string;
  labelStyle?: string;
  type?: string;
  containerStyle?: string;
  defaultValue?: string;
  placeholder?: string;
} & React.HTMLAttributes<HTMLTextAreaElement>;

function TextAreaInput({ labelTitle, labelStyle, containerStyle, placeholder, ...props }: TextAreaTextProps) {
  return (
    <div className={cn("form-control w-full", containerStyle)}>
      <label className="label">
        <span className={"label-text text-base-content " + labelStyle}>{labelTitle}</span>
      </label>
      <textarea className="textarea textarea-bordered w-full" placeholder={placeholder || ""} {...props}></textarea>
    </div>
  );
}

export default TextAreaInput;
