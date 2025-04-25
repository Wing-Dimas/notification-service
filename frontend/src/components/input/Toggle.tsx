import React from "react";

type ToggleProps = {
  labelTitle: string;
  labelStyle?: string;
  type?: string;
  containerStyle?: string;
  defaultValue?: string;
  placeholder?: string;
} & React.HTMLAttributes<HTMLInputElement>;

const Toggle = ({
  labelTitle,
  labelStyle,
  containerStyle,
  ...props
}: ToggleProps) => {
  return (
    <div className={`form-control w-full ${containerStyle}`}>
      <label className="label">
        <span className={"label-text text-base-content " + labelStyle}>
          {labelTitle}
        </span>
      </label>
      {/* <input type="checkbox" defaultChecked className="toggle" /> */}
      <input
        type={"checkbox"}
        className="toggle  checked:border-blue-500 checked:bg-blue-400 checked:text-blue-800"
        defaultChecked
        {...props}
      />
    </div>
  );
};

export default Toggle;
