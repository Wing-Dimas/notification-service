import React from "react";

type InputTextProps = {
  labelTitle: string;
  labelStyle?: string;
  type?: string;
  containerStyle?: string;
  defaultValue?: string;
  placeholder?: string;
  //   updateFormValue: ({ updateType, value }: { updateType: string; value: string }) => void;
  //   updateType: string;
} & React.HTMLAttributes<HTMLInputElement>;

const InputText = ({
  labelTitle,
  labelStyle,
  type,
  containerStyle,
  //   defaultValue,
  placeholder,
  //   updateFormValue,
  ...props
}: InputTextProps) => {
  return (
    <div className={`form-control w-full ${containerStyle}`}>
      <label className="label">
        <span className={"label-text text-base-content " + labelStyle}>{labelTitle}</span>
      </label>
      <input
        type={type || "text"}
        placeholder={placeholder || ""}
        className="input input-bordered w-full "
        {...props}
      />
    </div>
  );
};

export default InputText;
