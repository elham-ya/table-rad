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
import {
  SettingModalProps,
  TableColumn,
  FinalColumnProps,
} from "../../types/index";

const SettingModal: React.FC<SettingModalProps> = ({
  tableName='',
  isOpen = false,
  toggle = () => {},
  columns = [],
  // handleSaveConfig,
  requestConfig,
  apiConfigData,
}) => {
  const [items, setItems] = useState(columns);

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
        let newOrder = arrayMove(prevItems, oldIndex, newIndex);
        console.log("newOrder:", newOrder);
        return newOrder;
      });
    }
  };

  const updateContentChange = (
    uniqueId: string,
    updates: Partial<TableColumn>
  ) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((c) => c.uniqueId === uniqueId);

      if (existingIndex === -1) {
        const newItem: TableColumn = {
          uniqueId,
          title: updates.title ?? "",
          width: updates.width ?? "",
          visible: updates.visible ?? true,
          excel: updates.excel ?? true,
          key: prev[existingIndex].key 
        };

        return [...prev, newItem];
      } else {
        const updated = {
          ...prev[existingIndex],
          ...updates,
        };

        return prev.map((col, index) =>
          index === existingIndex ? updated : col
        );
      }
    });
  };

  const handleChangeTitle = (title: string, uniqueId: string) => {
    updateContentChange(uniqueId, { title });
  };

  const handleChangeWidth = (width: string, uniqueId: string) => {
    updateContentChange(uniqueId, { width });
  };

  const handleChangeVisibility = (flag: boolean, uniqueId: string) => {
    updateContentChange(uniqueId, { visible: flag });
  };

  const handleChangeExcelExport = (flag: boolean, uniqueId: string) => {
    updateContentChange(uniqueId, { excel: flag });
  };

  const requestSetSetting = async (params: any) => {
    try {
      const res = await fetch(requestConfig.url, {
        method: "POST",
        headers: {
          "Access-Token": `${requestConfig["Access-Token"]}`,
          "Client-Id": requestConfig["Client-Id"],
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        throw new Error(`http error! status:${res.status}`);
      }

      const data = await res.json();
      return data;
    } catch (err) {
      console.log("Post request faild!:", err);
      return null;
    }
  };

  console.log("apiConfigData***:", apiConfigData);

  const getSetting = (tableId = tableName) => {
    if (!apiConfigData?.result[0] || !!apiConfigData?.result[0].setting) {
      return null;
    }
    const { setting } = apiConfigData.result[0];

    if (Object.hasOwn(setting, "tables")) {
      return setting?.tables.find((table: FinalColumnProps) => table.id === tableId);
    } else {
      return [];
    }
  };

  const handleSave = () => {

    const changedColumns = items.filter((col) => col.visible === true || col.excel === true);

    const currentTable = getSetting(tableName) || [];
        
    const finalColumns: FinalColumnProps = 
      {
        id: tableName,
        columns: [...currentTable, ...changedColumns]
      };
    
    // apiConfigData from api
    console.log("finalColumns:", finalColumns);

    if (!apiConfigData?.result[0]) {
      return null;
    }
    const { setting } = apiConfigData.result[0];
    if (Object.hasOwn(setting, "tables")) {
      console.log('i am here!');
      
      // find related table
      requestSetSetting(
        {
        setting: {
          ...apiConfigData.result[0].setting,
          tables: [
            ...apiConfigData.result[0].setting.tables,
            finalColumns,
          ],
        },
      });
    } else {
      console.log('no tables object');
      
      // requestSetSetting( {
      //   'setting': {
      //     ...params
      //   }
      // });
    }

    // toggle();
  };

  console.log("items:", items);

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
                handleSave();
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
