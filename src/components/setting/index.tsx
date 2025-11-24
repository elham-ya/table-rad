import React, { useState, useEffect } from "react";
import {
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
  handleSaveConfig,
}) => {

  const [items, setItems] = useState(columns);
  console.log("items:", items)

  useEffect(() => {
    setItems(columns);
  }, [columns]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // حداقل 3 پیکسل حرکت کنه تا درگ شروع بشه (جلوگیری از کلیک اشتباه)
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
        return newOrder;
      });
    }
  };

  const handleChangeTitle = (title: string, index: number) => {

    // console.log('items ch ti:', items);
    //  index

    // items[index].title = title;
    
    setItems((prev) => {
      console.log("prev change title:", prev);

      const updated = [...prev];

      console.log("updated[index]:", updated[index]);

      if (!updated[index]) {
        updated[index] = { ...updated[index],index: index, title: title };
      } else {
        updated[index] = { ...updated[index], title };
      }

      return updated;
    });
  };


  const handleChangeWidth = (width: string, index: number) => {
    setItems((prev) => {
      console.log("prev change width:", prev);
      const updated = [...prev];

      if (!updated[index]) {
        updated[index] = { index: index, width: width };
      } else {
        updated[index] = { ...updated[index], width };
      }

      return updated;
    });
  };

  const handleChangeVisibility = (flag: boolean, index: number) => {
    setItems((prev) => {
      console.log("prev change visible:", prev);
      const updated = [...prev];

      if (!updated[index]) {
        updated[index] = { index: index, visible: flag };
      } else {
        updated[index] = { ...updated[index], visible: flag };
      }

      return updated;
    });
  };

  const handleChangeExcelExport = (flag: boolean, index: number) => {
    setItems((prev) => {
      console.log("prev change excel:", prev);
      const updated = [...prev];

      if (!updated[index]) {
        updated[index] = { index: index, excel: flag };
      } else {
        updated[index] = { ...updated[index], excel: flag };
      }

      return updated;
    });
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
                    items={items.map((i) => i.uniqueId)}
                    strategy={verticalListSortingStrategy}
                  >
                    {items.map((field) => (
                      <SortableItem
                        key={field.uniqueId}
                        id={field.uniqueId}
                        row={field}
                        onChangeTitle={handleChangeTitle}
                        onChangeWidth={handleChangeWidth}
                        onChangeVisibility={handleChangeVisibility}
                        onChangeExcelExport={handleChangeExcelExport}
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
              onClick={() => {
                handleSaveConfig(items);
                toggle();
              }}
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
