import React from "react";
import {
  TableColumn,
  TableProps,
  ContentType,
  ButtonProps,
} from "../../types/index";
import styles from "./button.module.scss";
import { Table as ReactstrapTable, Button } from "reactstrap";
import EditIcon from "../../assets/icons/IconEdit.svg";
import DotIcon from "../../assets/icons/IconDot.svg";

const ButtonComponent: React.FC<ButtonProps> = ({ data, buttonList }) => {
  console.log("buttonList:", buttonList);

  return (
    <div>
      <div className={styles.action_button_wrapper}>
        <Button
          className="border-0 bg-transparent p-0 shadow-none"
          onClick={() => console.log("111")}
        >
          <img width={30} src={EditIcon} />
        </Button>
        <Button
          onClick={() => console.log("222")}
          className="border-0 bg-transparent p-0 shadow-none"
        >
          <img width={30} src={DotIcon} />
        </Button>
      </div>
    </div>
  );
};

export default ButtonComponent;
