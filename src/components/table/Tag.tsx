import React from "react";
import { TagProps, Item } from "../../types/index";

const Tag: React.FC<TagProps> = ({ tagValue }) => {
  console.log(123, tagValue);

  const isArray = Array.isArray(tagValue);

  const renderItem = (item: Item, index?: number) => (
    <>
      <span
        key={index || item.value}
        className={`badge badge-${item.className} badge-pill mb-1`}
      >
        <h6 className="d-inline ml-2">
          <span className="badge badge-light badge-pill display-3">
            {item.extraValue && `${item.extraValue}`}
          </span>
        </h6>
        {item.value}
      </span>
      {<br />}
    </>
  );

  const renderItemPrimary = (item: Item) => {
    if (item && item.extraValue) {
      return (
        <span className={`badge badge-${item.className} badge-pill mb-1`}>
          <h6 className="d-inline ml-2">
            <span className="badge badge-light badge-pill display-3">
              {item.extraValue && `${item.extraValue}`}
            </span>
          </h6>
          {item.value}
        </span>
      );
    } else {
      return (
        <span className={`badge badge-${item?.className} badge-pill`}>
          {item?.value}
        </span>
      );
    }
  };

  return (
    <>
      {!isArray ? (
        tagValue ? renderItemPrimary(tagValue as Item) : null
      ) : (
        tagValue.map((item) => renderItem(item))
      )}
    </>
  );
};

export default Tag;
