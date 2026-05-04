import React from "react";
import { PriceProps } from "../../types/index";

const Price: React.FC<PriceProps> = ({ value }) => {
  if (value === null || value === undefined || value === "") return null;

  const isArray = Array.isArray(value);

  if (!isArray) {
    return <span>{value?.toLocaleString?.()}</span>;
  }

  return (
    <>
      {value.map((item, index) => (
        <span key={index}>{item.price?.toLocaleString?.()}</span>
      ))}
    </>
  );
};

export default Price;
