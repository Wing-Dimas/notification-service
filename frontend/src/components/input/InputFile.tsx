import { cn } from "../../libs/utils";

type TextFileProps = {
  labelTitle: string;
  labelStyle?: string;
  containerStyle?: string;
  defaultValue?: string;
  placeholder?: string;
} & React.HTMLAttributes<HTMLInputElement>;

const InputFile: React.FC<TextFileProps> = ({ labelTitle, labelStyle, containerStyle, ...props }) => {
  return (
    <div className={cn("form-control w-full", containerStyle)}>
      <label className="label">
        <span className={cn("label-text text-base-content", labelStyle)}>{labelTitle}</span>
      </label>
      <input type="file" className="file-input file-input-sm" {...props} />
    </div>
  );
};

export default InputFile;
