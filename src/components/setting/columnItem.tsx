import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Table as ReactstrapTable,
  Row,
  Col,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Label,
  Badge,
} from "reactstrap";
import { columnItemProps } from '../../types/index'
import Draggable, { DraggableCore } from "react-draggable";
import styles from "./setting.module.scss";
import IconFilter from "../../assets/icons/IconFilter.svg";
import IconExcelActive from "../../assets/icons/IconButtonExcelActive.svg";
import IconVisibleActive from "../../assets/icons/IconButtonActiveVisible.svg";

const columnItem: React.FC<columnItemProps> = ({ post }) =>  {

  const handleChangeExcelExport = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    console.log("excel button clicked!", event);
  };

  const handleChangeFieldVisibility = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    console.log("visible button clicked!", event);
  };

  const [list , setList] = useState(post);
  console.log('list:', list);

  const positionsRef = useRef<{ [key: number]: number}>({});
  const draggingIdRef = useRef<number | null>(null);

  const handleStart = (id: number) => {
    draggingIdRef.current = id;
  }
  

  return (
      <Draggable 
        axis="y" 
        bounds="parent" 
        handle=".handle"
        // onStart={() => handleStart(list.uniqueId)}
        >
        <div className="px-2 py-4">
          <Row className={styles.dargableItem_wrapper}>
            <Col
              xs="6"
              className="d-flex align-items-center justify-content-between py-3 "
            >
              <div className={styles.first_field_wrapper}>
                <div className={`handle ${styles.drag_icon}`}>
                  <img src={IconFilter} />
                </div>
                <div className={styles.input_badge_wrapper}>
                  <Input name="field" className={styles.inputItem_title} />
                  <Badge className={styles.badgeItem} color="light" pill>
                    value
                  </Badge>
                </div>
              </div>
            </Col>
            <Col xs="4" className="d-flex align-items-center">
              <div className="p-0 text-right ml-3">
                <Label for="selectwidth" className={styles.column_label_width}>
                  عرض ستون
                </Label>
              </div>
              <div className={`p-0 ${styles.t_px_input}`}>
                <Input
                  id="selectwidth"
                  type="text"
                  className={styles.column_input_width}
                ></Input>
                <span>px</span>
              </div>
            </Col>
            <Col xs="2" className="d-flex align-items-center justify-content-end">
              <div className={styles.setting_icons}>
                <button onClick={handleChangeExcelExport}>
                  <img src={IconExcelActive} />
                </button>
                <button onClick={handleChangeFieldVisibility}>
                  <img src={IconVisibleActive} />
                </button>
              </div>
            </Col>
          </Row>
        </div>
      </Draggable>
  
    
    
  );
}


export default columnItem;