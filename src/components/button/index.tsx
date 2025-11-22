import React, { useState } from "react";
import {
  TableColumn,
  TableProps,
  ContentType,
  ButtonProps,
} from "../../types/index";
import styles from "./button.module.scss";
import {
  Table,
  Button,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import EditIcon from "../../assets/icons/IconEdit.svg";
import DotIcon from "../../assets/icons/IconDot.svg";

const ButtonComponent: React.FC<ButtonProps> = ({ data, buttonList }) => {
  // console.log("buttonList:", buttonList);
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggle = () => setDropdownOpen((prevState) => !prevState);
  
  const listofbuttons = buttonList.filter((btn) => {
    return btn.visible === true;
  });
  // console.log("listofbuttons:", listofbuttons);
  return (
    <div className={styles.action_button_wrapper}>
      <Button
        className="border-0 bg-transparent p-0 shadow-none"
        onClick={() => console.log("edit is clicked")}
      >
        <img width={30} src={EditIcon} />
      </Button>
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
          <img width={30} src={DotIcon} />
        </DropdownToggle>
        <DropdownMenu
          style={{
            borderRadius: "8px",
            textAlign: "right",
          }}
        >
          <DropdownItem className={`${styles.dropdown_header} border-b`} header>عملیات</DropdownItem>
          <DropdownItem divider />
          {listofbuttons.map((item) => {
            return (
            <DropdownItem className={styles.dropdownItem} onClick={item.onClick} disabled={item.disable}>
              {item.title}
            </DropdownItem>
            )
          })}
        </DropdownMenu>
      </Dropdown>

      
    </div>
  );
};

export default ButtonComponent;
