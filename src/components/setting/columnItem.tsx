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
import styles from "./setting.module.scss";
import IconFilter from "../../assets/icons/IconFilter.svg";
import IconExcelActive from "../../assets/icons/IconButtonExcelActive.svg";
import IconVisibleActive from "../../assets/icons/IconButtonActiveVisible.svg";

export default function columnItem({ columns = [] }) {
  return (
    <Row>
      <Col xs="6 d-flex align-items-center justify-content-between">
        <div className={styles.first_field_wrapper}>
          <div className={styles.drag_icon}>
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
          <button>
            <img src={IconExcelActive} />
          </button>
          <button>
            <img src={IconVisibleActive} />
          </button>
        </div>
      </Col>
    </Row>
  );
}
