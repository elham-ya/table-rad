import React, { useState, useEffect, useMemo, useRef } from "react";
import _ from "lodash";
import {
  TableColumn,
  TableProps,
  ContentType,
  ApiResponse,
} from "../../types/index";
import styles from "./table.module.scss";
import {
  Table as ReactstrapTable,
  Row,
  Col,
  Button,
  Progress,
  Badge,
} from "reactstrap";
import moment from "moment-jalaali";
import Checkbox from "../checkBox";
import ActionRenderer from "../actionRenderer";
import TablePagination from "../pagination";
import SettingModal from "../setting";
import SettingButtonIcon from "../../assets/icons/SettingButton.svg";
import Xcel from "../../assets/icons/Xcel.svg";
import ExcelJS from "exceljs";
import DateTime from "./DateTime";
import Text from "./Text";
import Tag from "./Tag";
import Number from "./Number";
import Price from "./Price";

const Table: React.FC<TableProps> = ({
  id,
  data,
  cols,
  checkBox = false,
  onRowSelect,
  onPageChange,
  onSizeChange,
  requestConfig,
  totalCount = 0,
  pageSizeOptions = [10, 20, 25, 30, 40, 50],
  onExcelExportRequest,
  size = 10,
  translates = null,
}) => {
  // just keeping index
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string | number>>(
    new Set(),
  );
  console.log("main data for table:", data);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(size);
  const [settingModal, setSettingModal] = useState(false);
  const [configData, setConfigData] = useState<ApiResponse | null>(null);

  // وضعیت دانلود اکسل
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);
  const [exportStatus, setExportStatus] = useState<
    "idle" | "exporting" | "success" | "error" | "cancelled"
  >("idle");
  const [exportProgress, setExportProgress] = useState(0);

  const paginationRef = useRef<HTMLDivElement>(null);
  const [showStickyPagination, setShowStickyPagination] = useState(false);

  useEffect(() => {
    if (totalCount <= 0) {
      setShowStickyPagination(false);
      return;
    }
    if (!paginationRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyPagination(!entry.isIntersecting);
      },
      {
        threshold: 0.25,
      },
    );

    observer.observe(paginationRef.current);

    return () => observer.disconnect();
  }, [configData]);

  // selection of rows send to parent
  useEffect(() => {
    if (onRowSelect) {
      const selectedData = data.filter((row) => {
        const rowId = (row as any)?.id;
        return rowId != null && selectedRowIds.has(rowId);
      });
      onRowSelect(selectedData);
    }
  }, [selectedRowIds, data, onRowSelect]);

  useEffect(() => {
    if (requestConfig?.url && requestConfig["Access-Token"]) {
      requestGetSetting();
    }
  }, [requestConfig]);

  // get all settings
  const requestGetSetting = async () => {
    if (
      !requestConfig ||
      !requestConfig.url ||
      !requestConfig["Access-Token"] ||
      !requestConfig["Client-Id"]
    ) {
      console.warn(
        "requestConfig ناقص است یا وجود ندارد. درخواست تنظیمات ارسال نشد.",
        requestConfig,
      );
      return;
    }
    try {
      const res = await fetch(requestConfig.url, {
        method: "GET",
        headers: {
          "Access-Token": requestConfig["Access-Token"],
          "Client-Id": requestConfig["Client-Id"],
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw new Error(`Error: ${res.statusText}`);
      }
      const data = await res.json();
      setConfigData(data);
    } catch (error) {
      console.log("error fetching setting:", error);
    }
  };

  // final column for mapping and show data on cells
  const finalColumns = useMemo(() => {
    // change cols to array
    const baseColumns: TableColumn[] = Array.isArray(cols)
      ? [...cols]
      : cols
        ? [cols]
        : [];

    // remove columns start with __
    const baseColumnsWithoutSpecials = baseColumns.filter(
      (col) => !col.uniqueId?.startsWith("__"),
    );

    // withPrefix without number and checkbox
    const withPrefix: TableColumn[] = [...baseColumnsWithoutSpecials];

    // number column
    const numberColumnForRender: TableColumn = {
      uniqueId: "__number__selector__",
      key: "__number__selector__",
      width: "50",
      type: ContentType.Function,
      title: "#",
      htmlFunc: (row: any, rowIndex: number) => {
        return (page - 1) * pageSize + rowIndex + 1;
      },
      visible: true,
      excel: false,
    };

    // checkboxColumn
    const checkboxColumnForRender: TableColumn | null = checkBox
      ? {
          uniqueId: "__row_selector__",
          key: "__row_selector__",
          width: "50",
          type: ContentType.Function,
          title: (
            <Checkbox
              checked={data.length > 0 && selectedRowIds.size === data.length}
              indeterminate={
                data.length > 0 &&
                selectedRowIds.size > 0 &&
                selectedRowIds.size < data.length
              }
              onChange={(checked: boolean) => {
                setSelectedRowIds(
                  checked
                    ? new Set(
                        data
                          .map((row) => (row as any)?.id)
                          .filter((id) => id != null),
                      )
                    : new Set(),
                );
              }}
            />
          ),
          htmlFunc: (row: any, rowIndex: number) => {
            const rowId = row?.id;
            return (
              <Checkbox
                uniqueId={rowId}
                checked={rowId !== undefined && selectedRowIds.has(rowId)}
                onChange={(checked) => {
                  setSelectedRowIds((prev) => {
                    const next = new Set(prev);
                    const id = row?.id;
                    if (id === undefined || id === null) return next;
                    if (checked) {
                      next.add(id);
                    } else {
                      next.delete(id);
                    }
                    return next;
                  });
                }}
              />
            );
          },
          visible: true,
          excel: false,
        }
      : null;

    //api setting columns
    const apiColumns =
      configData !== null &&
      !configData.hasError &&
      configData.result.length > 0 &&
      configData.result[0]?.setting?.tables?.[id]?.columns;

    // return default columns if api is empty
    if (!apiColumns || !Array.isArray(apiColumns) || apiColumns.length === 0) {
      const defaultResult: TableColumn[] = [];
      if (checkboxColumnForRender) {
        defaultResult.push(checkboxColumnForRender);
      }
      defaultResult.push(numberColumnForRender);
      defaultResult.push(...withPrefix);
      return defaultResult;
    }

    const apiColumnMap = new Map<string, any>();
    apiColumns.forEach((saved: any) => {
      if (saved?.uniqueId) {
        apiColumnMap.set(saved.uniqueId, saved);
      }
    });

    // order of columns from api columns
    const orderedApiColumns = apiColumns.filter(
      (saved: any) => saved?.uniqueId && !saved.uniqueId.startsWith("__"),
    );

    const resultColumns: TableColumn[] = [];

    // adding number and checkbox column
    if (checkboxColumnForRender) {
      resultColumns.push(checkboxColumnForRender);
    }
    resultColumns.push(numberColumnForRender);

    // process columns from api
    orderedApiColumns.forEach((savedColumn: any) => {
      const uniqueId = savedColumn.uniqueId;
      const originalCol = withPrefix.find((col) => col.uniqueId === uniqueId);

      // no columns in developer cols
      if (!originalCol) {
        return;
      }

      // dont show visible: false
      if (savedColumn.visible !== true) {
        return;
      }

      // visible columns to show
      resultColumns.push({
        ...originalCol,
        visible: true,
        width: savedColumn.width ?? originalCol.width,
        title: savedColumn.title ?? originalCol.title,
        excel: savedColumn.excel ?? originalCol.excel,
      });
    });

    // adding new columns is not in api
    withPrefix.forEach((originalCol) => {
      // ignore special columns, recently has been added
      if (originalCol.uniqueId?.startsWith("__")) {
        return;
      }

      // check if this column is added before by api
      const alreadyAdded = resultColumns.some(
        (col) => col.uniqueId === originalCol.uniqueId,
      );
      if (!alreadyAdded) {
        // column is new, will added within visible:false(do not show so user can active visibility in modal)
        resultColumns.push({
          ...originalCol,
          visible: false,
        });
      }
    });

    return resultColumns;
  }, [
    checkBox,
    cols,
    data.length,
    selectedRowIds,
    configData,
    id,
    page,
    pageSize,
  ]);

  const handlePageChange = (pageNumber: number) => {
    setPage(pageNumber);
    onPageChange?.(pageNumber);
  };

  const handleSizeChange = (pageSize: number) => {
    setPageSize(pageSize);
    onSizeChange?.(pageSize);
  };

  const toggleSetting = () => {
    setSettingModal(!settingModal);
  };

  const handleGetDataAfterChange = (data: any) => {
    setConfigData(data);
  };

  const formatDateForExcel = (
    value: any,
    type?: string,
    format?: string,
  ): string => {
    if (!value) return "";

    const momentObj = moment(value);
    if (!momentObj.isValid()) return String(value);

    let defaultFormat = "";
    switch (type) {
      case "date":
        defaultFormat = "jYYYY/jMM/jDD";
        break;
      case "time":
        defaultFormat = "HH:mm:ss";
        break;
      case "datetime":
        defaultFormat = "jYYYY/jMM/jDD HH:mm:ss";
        break;
      default:
        return String(value);
    }

    const finalFormat = format || defaultFormat;
    return momentObj.format(finalFormat);
  };

  const generateAndDownloadExcel = async (fullData: unknown[]) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("داده‌ها");

    const excelColumns = cols.filter((col) => col.excel === true);
    if (excelColumns.length === 0) return;

    const headerRow = excelColumns.map(
      (col) => col.defaultTitle || col.title || "",
    );
    worksheet.addRow(headerRow);

    fullData.forEach((row, rowIndex) => {
      const rowValues = excelColumns.map((col) => {
        console.log("excelColumns:", excelColumns);

        if (col.excelFunc && typeof col.excelFunc === "function") {
          return col.excelFunc(row);
        }

        if (col.htmlFunc && typeof col.htmlFunc === "function") {
          return col.htmlFunc(row, rowIndex);
        }

        let rawValue = "";
        if (col.key) {
          rawValue = _.get(row, col.key);
        }

        if (
          col.type === "date" ||
          col.type === "time" ||
          col.type === "datetime"
        ) {
          return formatDateForExcel(rawValue, col.type, col.format);
        }

        return rawValue;
      });
      worksheet.addRow(rowValues);
    });

    worksheet.eachRow({ includeEmpty: true }, (row) => {
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.alignment = { horizontal: "right", vertical: "middle" };
      });
    });
    worksheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const baseName = id || "tableData";
    const dateStr = new Date().toLocaleDateString("fa-IR").replace(/\//g, "-");
    const fileName = `${baseName}_${dateStr}.xlsx`;

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const cleanup = (timeout = 0) => {
    setTimeout(() => {
      setExportStatus("idle");
      setExportProgress(0);
      setAbortController(null);
    }, timeout);
  };

  const fetchPageWithRetry = async (
    offset: number,
    signal: AbortSignal,
  ): Promise<unknown[] | null> => {
    console.log("page fetchPageWithRetry:", offset);

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        if (signal.aborted) {
          return null;
        }

        if (!onExcelExportRequest) return null;

        console.log("offset at fetchPageWithRetry:", offset);

        const response = await onExcelExportRequest(offset, signal);

        if (response.hasError) {
          console.warn(`تلاش ${attempt}: hasError = true`, response.message);
          if (attempt === 3) return null;
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
          continue;
        }

        return response.result ?? [];
      } catch (error: any) {
        if (error.name === "AbortError") {
          setExportStatus("cancelled");
          return null;
        }
        console.warn(`تلاش ${attempt} ناموفق`, error);
        if (attempt === 3) return null;
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
    return null;
  };

  const handleExportExcel = async () => {
    if (!onExcelExportRequest) {
      console.warn("onExcelExportRequest تعریف نشده است");
      return;
    }

    if (totalCount === 0) {
      setExportStatus("error");
      setTimeout(() => setExportStatus("idle"), 4000);
      return;
    }

    const controller = new AbortController();
    setAbortController(controller);

    setExportStatus("exporting");
    setExportProgress(0);
    console.log("start export page:", page);

    let collectedData: unknown[] = [];
    const totalPages = Math.ceil(totalCount / 50);

    try {
      for (let page = 1; page <= totalPages; page++) {
        if (controller.signal.aborted) {
          throw new DOMException("Aborted", "AbortError");
        }

        const offset = (page - 1) * 50;
        const pageData = await fetchPageWithRetry(offset, controller.signal);

        if (pageData === null) {
          throw new Error("دریافت داده ناموفق پس از تلاش‌ها");
        }

        collectedData = [...collectedData, ...pageData];

        const progress = Math.round((page / totalPages) * 100);
        setExportProgress(progress);
      }

      // ساخت و دانلود فایل
      await generateAndDownloadExcel(collectedData);

      setExportStatus("success");
      cleanup(4000);
    } catch (error: any) {
      if (error.name === "AbortError") {
        setExportStatus("cancelled");
        return;
      } else {
        console.error("خطا در اکسپورت:", error);
        setExportStatus("error");
      }
      cleanup(4000);
    }
  };

  const handleCancelExport = () => {
    if (abortController) {
      abortController.abort();
    }
    setExportStatus("cancelled");
    cleanup(4000);
  };

  const renderExportButton = () => {
    if (exportStatus === "exporting") {
      return (
        <div>
          <Button
            color="success"
            size="sm"
            disabled
            className={styles.btn_xcel}
          >
            <img src={Xcel} alt="در حال تهیه" width={30} />
          </Button>
          <Progress value={exportProgress} className={styles.progressBar}>
            <span className="fw-bold text-dark">{exportProgress}%</span>
          </Progress>
          <Button
            color="danger"
            size="sm"
            outline
            onClick={handleCancelExport}
            className={styles.cancel_btn}
          >
            X
          </Button>
        </div>
      );
    }
    return (
      <Button
        color="success"
        size="sm"
        onClick={handleExportExcel}
        className={styles.btn_xcel}
      >
        <img src={Xcel} alt="دانلود اکسل" width={30} />
      </Button>
    );
  };

  const renderExportMessage = () => {
    if (exportStatus === "success")
      return (
        <Badge color="success" pill>
          فایل با موفقیت دانلود شد
        </Badge>
      );
    if (exportStatus === "error")
      return (
        <Badge color="danger" pill>
          دانلود ناموفق بود
        </Badge>
      );
    if (exportStatus === "cancelled")
      return (
        <Badge color="secondary" pill>
          دانلود توسط کاربر لغو شد
        </Badge>
      );
    return null;
  };
  const shouldShowPagination = totalCount > 0;
  if (configData === null || configData?.hasError === true) {
    return null;
  } else {
    return (
      <Row>
        <Col xs="6"></Col>
        <Col xs="6" className={`py-2 ${styles.modal_Setting}`}>
          <Button onClick={toggleSetting} className={styles.btn_setting}>
            <img width={30} src={SettingButtonIcon} />
          </Button>
          {/* start excel download */}
          <div className={styles.download_Excel_wrapper}>
            {renderExportButton()}
            {renderExportMessage()}
          </div>
          {/* end excel download */}
          <SettingModal
            tableName={id}
            isOpen={settingModal}
            toggle={toggleSetting}
            columns={cols}
            apiConfigData={configData}
            requestConfig={requestConfig}
            onGetData={handleGetDataAfterChange}
          />
        </Col>
        <div className={styles.table_wrapper}>
          <div className={styles.table_outer_wrapper}>
            <div className={styles.table_inner_wrapper}>
              <ReactstrapTable bordered className={styles.tableContainer}>
                <thead className={styles.theader_container}>
                  <tr className={styles.tr_container}>
                    {finalColumns.map((colItem) => {
                      return (
                        <th
                          key={colItem.uniqueId}
                          className={styles.th_container}
                          style={{
                            width: `${colItem.width ? colItem.width : "120"}px`,
                          }}
                        >
                          {colItem.title}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 ? (
                    <tr>
                      <td
                        colSpan={finalColumns.length}
                        className={styles.td_container}
                      >
                        داده‌ای وجود ندارد.
                      </td>
                    </tr>
                  ) : (
                    data.map((row, rowIndex) => (
                      <tr
                        key={(row as any).id ?? rowIndex}
                        className={styles.tr_container}
                      >
                        {finalColumns.map((col) => {
                          const val = col?.key ? _.get(row, col.key) : "";
                          return (
                            <td
                              key={col.uniqueId}
                              className={styles.td_container}
                            >
                              {(() => {
                                switch (col.type) {
                                  case "text":
                                    return (
                                      <Text
                                        value={val}
                                        strings={translates}
                                        translate={col?.translate}
                                      />
                                    );

                                  case "price":
                                    return (
                                      <Price value={val} strings={translates} />
                                    );

                                  case "number":
                                    return <Number value={val} />;

                                  case "badge":
                                    return (
                                      <Tag
                                        value={val}
                                        strings={translates}
                                        translate={col?.translate}
                                      />
                                    );
                                  case "button":
                                    return (
                                      <ActionRenderer
                                        row={row}
                                        rowIndex={rowIndex}
                                        actions={col.buttonList || (() => [])}
                                        strings={translates}
                                      />
                                    );
                                  case "img":
                                    return val ? (
                                      <img
                                        src={val as string}
                                        alt="تصویر"
                                        className="w-10 h-10 object-cover rounded"
                                      />
                                    ) : (
                                      <div className="w-10 h-10 bg-gray-200 border-2 border-dashed rounded" />
                                    );

                                  case "map":
                                    return val ? (
                                      <a
                                        href={`https://www.google.com/maps?q=${val}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 underline text-xs"
                                      >
                                        نمایش روی نقشه
                                      </a>
                                    ) : (
                                      "-"
                                    );
                                  case "function": {
                                    if (typeof col?.htmlFunc !== "function") {
                                      return <span>{val ?? " "}</span>;
                                    }

                                    try {
                                      if (col.htmlFunc.length === 2) {
                                        return (col.htmlFunc as any)(
                                          row,
                                          rowIndex,
                                        );
                                      } else {
                                        return (col.htmlFunc as any)(row);
                                      }
                                    } catch (error) {
                                      console.error(
                                        "خطا در اجرای htmlFunc:",
                                        error,
                                        col.uniqueId,
                                      );
                                      return (
                                        <span className="text-red-600">
                                          خطا!
                                        </span>
                                      );
                                    }
                                  }
                                  case "datetime":
                                  case "time":
                                  case "date":
                                    return (
                                      <DateTime
                                        value={val}
                                        format={col.format}
                                        type={col.type}
                                        strings={translates}
                                      />
                                    );

                                  default:
                                    return <span>{val ?? ""}</span>;
                                }
                              })()}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </ReactstrapTable>
            </div>
          </div>
          {shouldShowPagination && (
            <div ref={paginationRef}>
              <TablePagination
                totalCount={totalCount}
                pageNumber={page}
                size={size}
                onPageChange={handlePageChange}
                onSizeChange={handleSizeChange}
                pageSizeOptions={pageSizeOptions}
                showTotal
                showSizeChanger
              />
            </div>
          )}

          {shouldShowPagination && showStickyPagination && (
            <div className={styles.stickyPagination}>
              <TablePagination
                totalCount={totalCount}
                pageNumber={page}
                size={size}
                onPageChange={handlePageChange}
                onSizeChange={handleSizeChange}
                pageSizeOptions={pageSizeOptions}
                showTotal
                showSizeChanger
              />
            </div>
          )}
        </div>
      </Row>
    );
  }
};

export default Table;
