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

export default function columnItem() {
  return (
    <Row>
      <Col xs="6 d-flex align-items-center">
        <div className={styles.first_field_wrapper}>
          <div>
            <img src={IconFilter} />
          </div>
          <div className={styles.input_badge_wrapper}>
            <Input name="field"  />
            <Badge className="text-dark" color="light" pill>
              value
            </Badge>
          </div>
        </div>
      </Col>
      <Col xs="3" className="d-flex align-items-center ">
        <Label for="selectwidth">عرض ستون</Label>
        <Input id="selectwidth" type="text"></Input>
      </Col>
      <Col xs="3">
        <div className={styles.setting_icons}>
          <img src={IconExcelActive} />
          <img src={IconVisibleActive} />
        </div>
      </Col>
    </Row>
  );
}
