import React from "react";
import { TagProps, Item } from "../../types/index";

const Tag: React.FC<TagProps> = (props) => {
  const isArray = Array.isArray(props);

  const renderItem = (item: Item, index?: number) => (
    <span
      key={index || item.value}
      className={`badge badge-${item.className} badge-pill`}
    >
      {item.value}
      {item.extraValue && ` (${item.extraValue})`}
    </span>
  );

  //  if (!isArray) {
  //   return <>{renderItem(items)}</>;
  // }
  
  // return <>{items.map((item, index) => renderItem(item, index))}</>;

  return (
    <>
      {/* {!isArray ? (
        <span className="badge badge-warning badge-pill">{value}</span>
      ) : (
        value.map((val) => val)
      )} */}
    </>
  );
};

export default Tag;
