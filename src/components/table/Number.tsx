import React from "react";
import { NumberProps } from "../../types/index";

export const NumberCell: React.FC<NumberProps> = ({ value }) => {
  if (value === null || value === undefined || value === "") return null;
  return <span>{value}</span>;
};

export default NumberCell;
