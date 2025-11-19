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
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SortableItemProps } from "../../types/index";
import styles from "./setting.module.scss";
import IconFilter from "../../assets/icons/IconFilter.svg";
import IconExcelActive from "../../assets/icons/IconButtonExcelActive.svg";
import IconVisibleActive from "../../assets/icons/IconButtonActiveVisible.svg";

const SortableItem = React.forwardRef<HTMLDivElement, SortableItemProps>(
  ({ id, title }, ref) => {
    const {
      attributes,
      listeners,
      setNodeRef: sortableSetNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

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

    const combinedRef = (node: HTMLDivElement | null) => {
      sortableSetNodeRef(node);
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };

    const handleChangeWidth = (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {};

    return (
      <div ref={combinedRef} className={styles.border_bottom_}>
        <Row
          style={style}
          className={`${styles.dargableItem_wrapper} ${
            isDragging ? styles.isDragging : ""
          }`}
        >
          <Col
            xs="6"
            className="d-flex align-items-center justify-content-between py-3"
          >
            <div className={styles.first_field_wrapper}>
              <div
                {...attributes}
                {...listeners}
                className={styles.drag_icon}
                style={{ cursor: "grab" }}
              >
                <img src={IconFilter} alt="drag handle" />
              </div>
              <div className={styles.input_badge_wrapper}>
                <Input
                  name="field"
                  className={styles.inputItem_title}
                  placeholder="نام فیلد"
                />
                <Badge className={styles.badgeItem} color="light" pill>
                  {title}
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
                onChange={handleChangeWidth}
              ></Input>
              <span>px</span>
            </div>
          </Col>
          <Col xs="2" className="d-flex align-items-center justify-content-end">
            <div className={styles.setting_icons}>
              <button onClick={handleChangeExcelExport}>
                <img src={IconExcelActive} alt="excel" />
              </button>
              <button onClick={handleChangeFieldVisibility}>
                <img src={IconVisibleActive} alt="visible" />
              </button>
            </div>
          </Col>
        </Row>
      </div>
    );
  }
);

SortableItem.displayName = "SortableItem";

export default SortableItem;
