import React from "react";
import { TagProps, TagItem } from "../../types/index";
import { findString } from "../../utils/index";

const Tag: React.FC<TagProps> = ({ value, strings, translate = false }) => {

  if (!value || (Array.isArray(value) && value.length === 0)) {
    return null;
  }
  const isArray = Array.isArray(value);

  const processText = (text: string): string => {
    if (translate) {
      return findString(text, strings) ?? text;
    }
    return text;
  };

  const renderTagItem = (item: TagItem, key?: string | number) => {
    const translatedValue = processText(item.value);
    const hasExtraValue = item.extraValue && item.extraValue !== "";
    const translatedExtraValue = hasExtraValue
      ? processText(item.extraValue!)
      : "";

    return (
      <React.Fragment key={key || item.value}>
        <span className={`badge badge-${item.class} badge-pill mb-1`}>
          {hasExtraValue && (
            <h6 className="d-inline ml-2">
              <span className="badge badge-light badge-pill display-3">
                {translatedExtraValue && translatedExtraValue}
              </span>
            </h6>
          )}
          {translatedValue}
        </span>
         <br />
      </React.Fragment>
    );
  };

  if (!isArray) {
    return <>{renderTagItem(value as TagItem)}</>;
  }
  return <>{value.map((item, index) => renderTagItem(item, index))}</>;
};

export default Tag;
