import React from "react";
import { NumberProps } from "../../types/index";

export const Number: React.FC<NumberProps> = ({ value }) => {
  if (value === null || value === undefined || value === "") return null;
  return <span>{value}</span>;
};

export default Number;
