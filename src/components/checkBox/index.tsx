import React, { useEffect, useRef } from "react";
import {  Input  } from "reactstrap";
import styles from './checkBox.module.scss';
import { CheckboxProps, CheckboxChangeEvent } from '../../types/index'

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  defaultChecked = false,
  onChange,
  disabled = false,
  id,
  value,
  indeterminate = false,
  className = "",
  // onSelect
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
// const [checked, setIsChecked] = useState(false);
  useEffect(() => {
    if(inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  } ,[indeterminate]);

  // const onSelect = (checked , event) => []
  return (
    <div className={`${styles.custom_checkbox_wrapper} ${className}`}>
      <Input
        name='tablecheckbox'
        type="checkbox"
        id={id}
        innerRef={inputRef}
        checked={checked}
        defaultChecked={defaultChecked}
        onChange={(e: CheckboxChangeEvent) => onChange?.(e.target.checked)}
        disabled={disabled}
        value={value}
      />
    </div>
  )
}

export default Checkbox;