import React from "react";
import { TextProps } from "../../types/index";

const Text: React.FC<TextProps> = ({ value }) => {
  
  const isArray = Array.isArray(value);

  if (isArray && value.length === 0) {
    return null;
  }

  if (value == null  || value === "") {
    return null;
  }

  return (
    <>
      {!isArray ? (
        <span>{value}</span>
      ) : (
        value.map((el, index) => <div key={index}>{el}</div>)
      )}
    </>
  );
};

export default Text;
