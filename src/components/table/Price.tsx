import React from "react";
import { PriceProps } from "../../types/index";
import { findString } from "../../utils";

const Price: React.FC<PriceProps> = ({ value, strings }) => {
  if (value === null || value === undefined || value === "") return null;
  console.log('strings at Price:',strings);

  const isArray = Array.isArray(value);

  if (!isArray) {
    return (
      <span>
        {value?.toLocaleString?.()} {findString(strings?.rial, strings)}
      </span>
    );
  }

  return (
    <>
      {value.map((item, index) => (
        <span key={index}>
          {item.price?.toLocaleString?.()} {strings?.rial}
        </span>
      ))}
    </>
  );
};

export default Price;
