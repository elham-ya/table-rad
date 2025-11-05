import React, { useEffect, useRef } from "react";
import { Input } from "reactstrap";
import styles from "./checkBox.module.scss";
import { CheckboxProps, CheckboxChangeEvent } from "../../types/index";

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  defaultChecked = false,
  onChange,
  disabled = false,
  uniqueId,
  value,
  indeterminate = false,
  className = "",
}) => {
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);


  return (
    <div className={`${styles.custom_checkbox_wrapper} ${className}`}>
      <Input
        name={`tablecheckbox-${uniqueId}`}
        type="checkbox"
        id={uniqueId}
        innerRef={inputRef}
        checked={checked}
        onChange={(e: CheckboxChangeEvent) => onChange?.(e.target.checked)}
        disabled={disabled}
      />
    </div>
  );
};

export default Checkbox;
