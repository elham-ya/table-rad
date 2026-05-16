import React, { useState } from "react";
import { ActionItem, ButtonActionProps } from "../../types/index";
import {
  Button,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import styles from "./button.module.scss";

import EditIcon from "../../assets/icons/IconEdit.svg";
import DotIcon from "../../assets/icons/IconDot.svg";

const ActionRenderer: React.FC<ButtonActionProps> = ({
  row,
  actions,
  strings,
}) => {
  console.log("row ActionRenderer:", row);
  console.log("actions:", actions);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggle = () => setDropdownOpen((prevState) => !prevState);



  const renderIcon = (icon: string | React.ReactNode) => {

    if (!icon) {
      return (
        <i
          className="fas fa-bars"
          style={{ marginLeft: "8px", width: "20px" }}
        />
      );
    }

    if (typeof icon === "string") {
      return (
        <i className={icon} style={{ marginLeft: "8px", width: "20px" }} />
      );
    }

    return (
      <span
        style={{ marginLeft: "8px", display: "inline-flex", width: "20px" }}
      >
        {icon}
      </span>
    );
  };

  const handleActionClick = (action: ActionItem) => {
    if (!action) return;
    setDropdownOpen(false);

    if (action.onClick) {
      action.onClick(row);
    }

    if (action.href) {
      if (action.target === "_blank") {
        window.open(action.href, "_blank");
      } else {
        window.location.href = action.href;
      }
    }
  };

  const actionItems = typeof actions === 'function' ? actions(row) : actions;
  if (!actionItems || !Array.isArray(actionItems) || actionItems.length === 0) return null;
  let finalActions = actionItems.filter((item) => item.visible !== false);

  if (finalActions.length === 0) return null;

  const firstAction = finalActions[0];
  const dropdownActions = finalActions.slice(1);

  return (
    <>
      <div className={styles.action_button_wrapper}>
        <Button
          className={`border-0 bg-transparent p-0 shadow-none d-flex align-items-center gap-2 ${styles.firstBtn}`}
          onClick={() => handleActionClick(firstAction)}
          disabled={firstAction.disable}
        >
          {renderIcon(firstAction.icon)}
          <span>{firstAction.title}</span>
        </Button>

        {dropdownActions.length > 0 && (
          <Dropdown
            isOpen={dropdownOpen}
            toggle={toggle}
            className="border-0 bg-transparent p-0 shadow-none"
          >
            <DropdownToggle
              caret={false}
              className="p-0 border-0 bg-transparent shadow-none"
              style={{ boxShadow: "none" }}
            >
              <i className="fas fa-bars" />
            </DropdownToggle>
            <DropdownMenu
              style={{
                borderRadius: "8px",
                textAlign: "right",
              }}
            >
              <DropdownItem
                className={`${styles.dropdown_header} border-b`}
                header
              >
                عملیات
              </DropdownItem>
              <DropdownItem divider />
              {dropdownActions.map((item, index) => (
                <DropdownItem
                  key={item.uniqueId || index}
                  className={`${styles.dropdownItem} ${item.className || ""}`}
                  onClick={() => handleActionClick(item)}
                  disabled={item.disable}
                >
                  {renderIcon(item.icon)}
                  <span>{item.title}</span>
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        )}
      </div>
    </>
  );
};

export default ActionRenderer;
