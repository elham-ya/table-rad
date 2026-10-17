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
  Spinner,
  Alert,
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
  ApiResponse,
} from "../../types/index";

// متنِ خطای عمومی: وقتی پاسخ اصلاً نرسید (قطعی شبکه / پاسخِ غیر JSON)
// یا message خالی بود
const GENERIC_ERROR_MESSAGE =
  "ذخیره‌ی تنظیمات ناموفق بود. لطفاً دوباره تلاش کنید.";

// message در پاسخِ API یک آرایه است و هر عضو معمولاً یک رشته. اگر عضوی آبجکت
// بود، متنش را از فیلدهای رایج برمی‌داریم. چند پیام در چند سطر نمایش داده می‌شوند.
const extractErrorMessage = (message: unknown): string => {
  const items = Array.isArray(message) ? message : [message];
  const texts = items
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (item && typeof item === "object") {
        const obj = item as Record<string, unknown>;
        const text = obj.message ?? obj.text ?? obj.title ?? obj.description;
        return typeof text === "string" ? text.trim() : "";
      }
      return "";
    })
    .filter(Boolean);
  return texts.length > 0 ? texts.join("\n") : GENERIC_ERROR_MESSAGE;
};

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
  const [isSaving, setIsSaving] = useState(false); // true = درخواست ذخیره در جریان است
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // خطای ذخیره (نمایش در هشدار)

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setErrorMessage(null);
    }
  }, [isOpen]);

  useEffect(() => {
    initializeItems();
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
    if (
      !apiConfigData ||
      !Array.isArray(apiConfigData.result) ||
      apiConfigData.result.length === 0
    ) {
      return {
        columns: columns.filter((col) => !col.uniqueId?.startsWith("__")),
      };
    } else if (
      apiConfigData &&
      apiConfigData?.result &&
      Array.isArray(apiConfigData?.result) &&
      apiConfigData.result?.length > 0
    ) {
      // const { setting } = apiConfigData?.result[0];
      const setting = apiConfigData?.result?.[0]?.setting;
      if (setting && "tables" in setting) {
        return setting?.tables[tableId] ?? null;
      }
    }
    return null;
  };

  const targetTable = getSetting(tableName);

  const initializeItems = () => {
    // if (!isOpen) return;  //  خط if (!isOpen) return; حذف شد تا همگام‌سازی همیشه انجام شود

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

  // useEffect(() => {
  //   if (targetTable !== null && targetTable?.columns) {
  //     const mergedItems = mergeLists(targetTable.columns, items);
  //     setItems(mergedItems);
  //   }
  // }, [targetTable]);

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
    setItems((prev) => {
      const existingIndex = prev.findIndex((c) => c.uniqueId === uniqueId);

      if (existingIndex === -1) {
        const newItem: TableColumn = {
          uniqueId,
          title: updates.title ?? "",
          width: updates.width ?? "",
          visible: updates.visible ?? true,
          excel: updates.excel ?? true,
          key: updates.key ?? uniqueId,
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

  // متد تست خطای نتورک
  // const requestSetSetting = async (params: any) => {
  //   let data: ApiResponse;

  //   // 🔴🔴🔴 کد موقت فقط برای تست — بعد از تست حتماً حذف کنید 🔴🔴🔴
  //   const FORCE_ERROR_FOR_TEST = true;
  //   if (FORCE_ERROR_FOR_TEST) {
  //     // شبیه‌سازی پاسخ واقعی سرور با خطا
  //     data = {
  //       hasError: true,
  //       errorCode: 1001,
  //       message: ["دسترسی شما برای ذخیره‌ی تنظیمات این جدول مجاز نیست."],
  //       result: [],
  //       refId: "test-123",
  //       referenceNumber: 0,
  //       count: 0,
  //       aggregations: 0,
  //       metaData: [],
  //     } as unknown as ApiResponse;
  //   } else {
  //     // کد اصلی
  //     try {
  //       const res = await fetch(requestConfig.url, {
  //         method: "POST",
  //         headers: {
  //           "Access-Token": `${requestConfig["Access-Token"]}`,
  //           "Client-Id": requestConfig["Client-Id"],
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(params),
  //       });
  //       data = await res.json();
  //     } catch (err) {
  //       console.log("Post request faild!:", err);
  //       throw new Error(GENERIC_ERROR_MESSAGE);
  //     }
  //   }
  //   // 🔴🔴🔴 پایان کد موقت 🔴🔴🔴

  //   if (data?.hasError !== false) {
  //     throw new Error(extractErrorMessage(data?.message));
  //   }
  //   onGetData(data);
  // };

  // قرارداد: در موفقیت resolve می‌شود (و داده‌ی جدید را به جدول می‌دهد).
  // در هر خطا یک Error پرتاب می‌کند که message آن همان «متنِ قابل‌نمایش به کاربر» است.
  const requestSetSetting = async (params: any) => {
    let data: ApiResponse;
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
      data = await res.json();
      console.log("success data:", data);
      
    } catch (err) {
      // قطعیِ شبکه یا پاسخِ غیر JSON
      console.log("Post request faild!:", err);
      throw new Error(GENERIC_ERROR_MESSAGE);
    }

    // فقط hasError تعیین می‌کند: false یعنی موفق، هر چیز دیگر (true یا بدنه‌ی نامعتبر) خطا.
    // مهم: در خطا نباید onGetData صدا زده شود؛ جدول با hasError: true هیچ چیز رندر نمی‌کند.
    if (data?.hasError !== false) {
      console.log("data 1:",data);
      
      throw new Error(extractErrorMessage(data?.message));
    }

    onGetData(data);
  };

  const saveSettings = async () => {
    const hasResult =
      apiConfigData &&
      Array.isArray(apiConfigData?.result) &&
      apiConfigData.result?.length > 0;

    const newCommonColumns = items
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

    const finalColumns: FinalColumnProps = {
      [tableName]: {
        columns: [...newCommonColumns],
      },
    };

    if (hasResult) {
      const currentSetting = apiConfigData?.result[0]?.setting || {};

      if (currentSetting?.tables && typeof currentSetting.tables === "object") {
        // find related table
        await requestSetSetting({
          setting: {
            ...currentSetting,
            tables: {
              ...currentSetting?.tables,
              ...finalColumns,
            },
          },
        });
      } else {
        await requestSetSetting({
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
    } else {
      await requestSetSetting({
        setting: {
          tables: { ...finalColumns },
        },
      });
    }
  };

  const handleSave = async () => {
    if (isSaving) return; // جلوگیری از ارسال هم‌زمانِ دو درخواست
    setIsSaving(true);
    setErrorMessage(null); // خطای تلاشِ قبلی پاک شود
    try {
      await saveSettings();
      toggle(); // فقط در موفقیت مودال بسته می‌شود
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : GENERIC_ERROR_MESSAGE,
      );
    } finally {
      // در هر حالت (موفق، خطا یا قطعی شبکه) حالت لودینگ باید تمام شود
      setIsSaving(false);
    }
  };

  // در طولِ ذخیره، بستنِ مودال (انصراف، ضربدر) نباید کار کند
  const handleToggle = () => {
    if (isSaving) return;
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

  return (
    <Modal
      isOpen={isOpen}
      size="lg"
      toggle={handleToggle}
      keyboard={!isSaving}
      backdrop="static"
      className={styles.modal_wrapper}
    >
      <ModalHeader
        toggle={handleToggle}
        className={styles.modal_itemheader}
        close={
          isSaving ? (
            <button type="button" className="close" aria-label="Close" disabled>
              <span aria-hidden="true">&times;</span>
            </button>
          ) : undefined
        }
      >
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
      {errorMessage && (
        <div className={styles.save_error}>
          <Alert
            color="danger"
            fade={false}
            className={styles.save_error_alert}
          >
            <span className={styles.save_error_text}>{errorMessage}</span>
            <button
              type="button"
              className="close"
              aria-label="Close"
              onClick={() => setErrorMessage(null)}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </Alert>
        </div>
      )}
      <ModalFooter className={styles.modal_footer}>
        <Button
          color="secondary"
          className={styles.cancel_btn}
          onClick={handleToggle}
          disabled={isSaving}
        >
          انصراف
        </Button>
        <Button
          color="primary"
          className={styles.save_btn}
          onClick={handleSave}
          disabled={isSaving}
          aria-busy={isSaving}
        >
          {isSaving && (
            <Spinner size="sm" tag="span" className={styles.save_spinner}>
              در حال ذخیره...
            </Spinner>
          )}
          تایید
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default SettingModal;
