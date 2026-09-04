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
  TableSchema,
} from "../../types/index";

const SettingModal: React.FC<SettingModalProps> = ({
  tableName = "",
  isOpen = false,
  toggle = () => {},
  columns = [], // columns is default cols by developer
  requestConfig,
  apiConfigData, // columns come from calling api
  onGetData, // changed data
}) => {
  const [items, setItems] = useState(columns);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
    }
  }, [isOpen]);

  // useEffect(() => {
  //   initializeItems();
  // }, [isOpen, apiConfigData, columns]);

  useEffect(() => {
    if (isOpen && !items.length) {
      initializeItems();
    }
  }, [isOpen, apiConfigData, columns]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // حداقل 3 پیکسل حرکت کنه تا درگ شروع بشه (جلوگیری از کلیک اشتباه)
      },
    }),
    useSensor(KeyboardSensor),
  );

  const getSetting = (tableId = tableName) => {
    if (!apiConfigData?.result[0]) {
      return null;
    }
    const { setting } = apiConfigData.result[0];

    if (setting && "tables" in setting) {
      return setting?.tables[tableId];
    } else {
      return null;
    }
  };

  const targetTable = getSetting(tableName);

  const initializeItems = () => {
    // اگر مودال بسته است، کاری نکن
    if (!isOpen) return;

    // گرفتن ستون‌های ذخیره شده از API
    const savedColumns = targetTable?.columns;

    // اگر تنظیمات ذخیره شده وجود دارد
    if (
      savedColumns &&
      Array.isArray(savedColumns) &&
      savedColumns.length > 0
    ) {
      // ادغام با استفاده از mergeLists موجود
      const merged = mergeLists(savedColumns, columns);
      setItems(merged);
    } else {
      // اگر تنظیماتی وجود ندارد، از columns پیش‌فرض استفاده کن
      // ولی ستون‌های ویژه (__ دار) را حذف کن
      const filteredDefaultColumns = columns.filter(
        (col) => !col.uniqueId?.startsWith("__"),
      );

      setItems(filteredDefaultColumns);
    }
  };

  const mergeLists = (apiList: TableColumn[], devList: TableColumn[]) => {
    if (!apiList || apiList.length === 0) return [...devList];
    if (!devList || devList.length === 0) return [...apiList];

    const apiIds = new Set(apiList.map((item) => item.uniqueId));

    const onlyInDev = devList.filter((item) => !apiIds.has(item.uniqueId));

    const noVisible = onlyInDev.map((item) => ({
      ...item,
      excel: false,
      visible: false,
    }));

    if (apiList.length >= devList.length) {
      return [...apiList];
    }

    return [...apiList, ...noVisible];
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((prevItems) => {
        const oldIndex = prevItems.findIndex((i) => i.uniqueId === active.id);
        const newIndex = prevItems.findIndex((i) => i.uniqueId === over.id);
        let newOrder = arrayMove(prevItems, oldIndex, newIndex);
        return newOrder;
      });
    }
  };

  const updateContentChange = (
    uniqueId: string,
    updates: Partial<TableColumn>,
  ) => {
    console.log("876 updateContentChange called:", { uniqueId, updates });
    setItems((prev) => {
      const existingIndex = prev.findIndex((c) => c.uniqueId === uniqueId);
      console.log(
        "876 existingIndex:",
        existingIndex,
        "876 items length:",
        prev.length,
      );
      if (existingIndex === -1) {
        const newItem: TableColumn = {
          uniqueId,
          title: updates.title ?? "",
          width: updates.width ?? "",
          visible: updates.visible ?? true,
          excel: updates.excel ?? true,
          key: updates.key ?? "",
        };
        return [...prev, newItem];
      } else {
        const updated = {
          ...prev[existingIndex],
          ...updates,
        };
        return prev.map((col, index) =>
          index === existingIndex ? updated : col,
        );
      }
    });
  };

  const handleChangeTitle2 = (title: string, uniqueId: string) => {
    updateContentChange(uniqueId, { title });
  };

  const handleChangeTitle = (title: string, uniqueId: string) => {
    const currentItem = items.find((item) => item.uniqueId === uniqueId);
    const originalCol = columns.find((col) => col.uniqueId === uniqueId);
    
    // اولین باری که title تغییر می‌کند، defaultTitle را ست کن
    if (currentItem && originalCol && !currentItem.defaultTitle && originalCol.title !== title) {
      const defaultTitleValue = typeof originalCol.title === 'string' 
        ? originalCol.title 
        : String(originalCol.title);
      
      updateContentChange(uniqueId, { title, defaultTitle: defaultTitleValue });
    } else {
      updateContentChange(uniqueId, { title });
    }
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
    console.log("requestSetSetting");

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
      onGetData(data);
    } catch (err) {
      console.log("Post request faild!:", err);
      return null;
    }
  };

  const handleSave = () => {
    console.log("apiConfigData first of handleSave:", apiConfigData);
    console.log("items:", items);
    const changedColumns = items.filter(
      (col) => col.visible === true || col.excel === true,
    );

    console.log("changedColumns:", changedColumns);

    if (changedColumns && changedColumns.length <= 0) {
      console.warn("هیچ ستونی برای ذخیره وجود ندارد");
      toggle();
      return;
    }

    const newCommonColumns = changedColumns
      .map((changedCol) => {
        const originalCol = columns.find(
          (col) => col.uniqueId === changedCol.uniqueId,
        );
        if (!originalCol) return null;
        if (originalCol.title !== changedCol.title) {
          return {
            ...changedCol,
            defaultTitle: changedCol.defaultTitle || originalCol.title,
          };
        }
        return changedCol;
      })
      .filter(Boolean);

    console.log("newCommonColumns:", newCommonColumns);

    const finalColumns: FinalColumnProps = {
      [tableName]: {
        columns: [...newCommonColumns],
      },
    };

    // apiConfigData from api
    console.log(
      "apiConfigData before !apiConfigData?.result[0]:",
      apiConfigData,
    );
    if (!apiConfigData?.result[0]) {
      toggle();
      return;
    }
    const currentSetting = apiConfigData.result[0]?.setting;
    if (currentSetting?.tables && typeof currentSetting.tables === "object") {
      // find related table
      requestSetSetting({
        setting: {
          ...apiConfigData.result[0].setting,
           tables: {
            ...apiConfigData.result[0].setting.tables,
            ...finalColumns,
          },
        },
      });
    } else {
      requestSetSetting({
        setting: {
          ...currentSetting,
          tables: {
            [tableName]: {
              columns: [],
            },
          },
        },
      });
    }

    toggle();
  };

  const filteredItems = searchTerm
    ? items.filter(
        (item) =>
          (typeof item.title === "string" && item.title.includes(searchTerm)) ||
          (typeof item.defaultTitle === "string" &&
            item.defaultTitle.includes(searchTerm)),
      )
    : items;

  console.log("apiConfigData inside component:", apiConfigData);

  return (
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
      <ModalBody className={styles.modal_body}>
        <Row>
          <Col xs="12" className={`${styles.search_setting}`}>
            <div className={styles.search_wrapper}>
              <Input
                name="search"
                type="text"
                placeholder="جستجو..."
                value={searchTerm}
                onChange={(e: {
                  target: { value: React.SetStateAction<string> };
                }) => setSearchTerm(e.target.value)}
              />
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
                items={filteredItems.map((i) => i.uniqueId)}
                strategy={verticalListSortingStrategy}
              >
                {filteredItems.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    ستونی با این عنوان یافت نشد
                  </div>
                ) : (
                  filteredItems.map((field) => (
                    <SortableItem
                      key={field.uniqueId}
                      id={field.uniqueId}
                      tableId={tableName}
                      row={field}
                      onChangeTitle={handleChangeTitle}
                      onChangeWidth={handleChangeWidth}
                      onChangeVisibility={handleChangeVisibility}
                      onChangeExcelExport={handleChangeExcelExport}
                      config={apiConfigData}
                    />
                  ))
                )}
              </SortableContext>
            </DndContext>
          </Col>
        </Row>
      </ModalBody>
      <ModalFooter className={styles.modal_footer}>
        <Button
          color="secondary"
          className={styles.cancel_btn}
          type="button"
          onClick={toggle}
        >
          انصراف
        </Button>
        <Button
          color="primary"
          className={styles.save_btn}
          type="button"
          onClick={handleSave}
        >
          تایید
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default SettingModal;
