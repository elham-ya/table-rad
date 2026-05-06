import React from "react";
import { TextProps } from "../../types/index";
import { findString } from "../../utils/index";

const Text: React.FC<TextProps> = ({ value, strings, translate = false }) => {
  const isArray = Array.isArray(value);

  if (isArray && value.length === 0) {
    return null;
  }

  if (value == null || value === "") {
    return null;
  }

  const processText = (text: string): string => {
    if (translate) {
      return findString(text, strings) ?? text;
    }
    return text;
  };

  const renderContent = () => {
    if (!isArray) {
      return <span>{processText(value as string)}</span>;
    } else {
      return (value as string[]).map((el, index) => (
        <div key={index}>{processText(el)}</div>
      ));
    }
  };

  return <>{renderContent()}</>;
  
};

export default Text;
