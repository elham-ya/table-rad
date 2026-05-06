import React from "react";
import { TagProps, Item } from "../../types/index";
import { findString } from "../../utils/index";

const Tag: React.FC<TagProps> = ({ tagValue, strings, translate = false }) => {
  const isArray = Array.isArray(tagValue);

  const processText = (text: string): string => {
    if (translate) {
      return findString(text, strings) ?? text;
    }
    return text;
  };

  // array list
  const renderItem = (item: Item, index?: number) => {
    const translatedValue = processText(item.value);
    const translatedExtraValue = item.extraValue
      ? processText(item.extraValue)
      : undefined;

    return (
      <React.Fragment key={index || item.value}>
        <span className={`badge badge-${item.className} badge-pill mb-1`}>
          <h6 className="d-inline ml-2">
            <span className="badge badge-light badge-pill display-3">
              {translatedExtraValue && translatedExtraValue}
            </span>
          </h6>
          {translatedValue}
        </span>
        <br />
      </React.Fragment>
    );
  };

  const renderItemPrimary = (item: Item) => {
    const translatedValue = processText(item.value);

    if (item && item.extraValue) {
      const translatedExtraValue = processText(item.extraValue);
      return (
        <span className={`badge badge-${item.className} badge-pill mb-1`}>
          <h6 className="d-inline ml-2">
            <span className="badge badge-light badge-pill display-3">
              {translatedExtraValue}
            </span>
          </h6>
          {translatedValue}
        </span>
      );
    } else {
      return (
        <span className={`badge badge-${item?.className} badge-pill`}>
          {translatedValue}
        </span>
      );
    }
  };

  return (
    <>
      {!isArray
        ? tagValue
          ? renderItemPrimary(tagValue as Item)
          : null
        : tagValue.map((item) => renderItem(item))}
    </>
  );
};

export default Tag;
