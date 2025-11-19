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
import SearchIcon from "../../assets/icons/IconSearch.svg";
import styles from "./setting.module.scss";
import SortableItem from "./sortableItem";
import { SettingModalProps } from "../../types/index";

const SettingModal: React.FC<SettingModalProps> = ({
  isOpen = false,
  toggle = () => {},
  columns = [],
}) => {
  const [items, setItems] = useState(columns);
  useEffect(() => {
    setItems(columns); // وقتی prop تغییر کرد، state رو آپدیت کن
  }, [columns]);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // حداقل ۵ پیکسل حرکت کنه تا درگ شروع بشه (جلوگیری از کلیک اشتباه)
      },
    }),
    useSensor(KeyboardSensor)
  );

 const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;

  if (over && active.id !== over.id) {
    setItems((prevItems) => {
      const oldIndex = prevItems.findIndex((i) => i.uniqueId === active.id);
      const newIndex = prevItems.findIndex((i) => i.uniqueId === over.id);
      const newOrder = arrayMove(prevItems, oldIndex, newIndex);

      console.log("ترتیب جدید ستون‌ها:", newOrder);

      //  فقط آی‌دی‌ها :
      console.log("فقط آی‌دی‌ها:", newOrder.map(item => item.uniqueId));

      return newOrder;
    });
  }
};

  return (
    <Row>
      <Col xs="12">
        <Modal
          isOpen={isOpen}
          size="lg"
          toggle={toggle}
          backdrop="static"
          className={styles.modal_wrapper}
        >
          <ModalHeader toggle={toggle} className={styles.modal_itemheader}>
            تنظیمات ستون
          </ModalHeader>
          <ModalBody>
            <Row>
              <Col xs="12" className={`${styles.search_setting}`}>
                <div className={styles.search_wrapper}>
                  <Input name="search" type="text" placeholder="جستجو..." />
                  <button className={styles.search_btn}>
                    <img src={SearchIcon} />
                  </button>
                </div>
              </Col>
              <Col xs="12" className="py-2">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={items.map((i) => i.uniqueId)} // ← اینجا items (state) رو بده
                    strategy={verticalListSortingStrategy}
                  >
                    {/* اینجا هم از items.map استفاده کن نه columns.map */}
                    {items.map((field) => (
                      <SortableItem
                        key={field.uniqueId}
                        id={field.uniqueId}
                        title={field.title}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button
              color="secondary"
              className={styles.cancel_btn}
              onClick={toggle}
            >
              انصراف
            </Button>
            <Button
              color="primary"
              className={styles.save_btn}
              onClick={toggle}
            >
              تایید
            </Button>
          </ModalFooter>
        </Modal>
      </Col>
    </Row>
  );
};

export default SettingModal;
