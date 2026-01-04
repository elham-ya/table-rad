import React, { useState, useEffect, useMemo } from "react";
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
import Checkbox from "../checkBox";
import ButtonComponent from "../button";
import TablePagination from "../pagination";
import SettingModal from "../setting";
import SettingButtonIcon from "../../assets/icons/SettingButton.svg";
import Xcel from "../../assets/icons/Xcel.svg";
import ExcelJS from "exceljs";

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
}) => {
  
console.log('onExcelExportRequest2:' , onExcelExportRequest);

  // just keeping index
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string | number>>(
    new Set()
  );

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(size);
  const [settingModal, setSettingModal] = useState(false);
  const [configData, setConfigData] = useState<ApiResponse | null>(null);

  // وضعیت دانلود اکسل
  const [isExporting, setIsExporting] = useState(false);
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);
  const [exportStatus, setExportStatus] = useState<"idle" | "exporting" | "success" | "error" | "cancelled">("idle");
  const [allExportData, setAllExportData] = useState([]);
  const [exportProgress, setExportProgress] = useState(0);


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

  useEffect(() => {
    if (allExportData.length > 0 && exportStatus === "success") {
      const generateAndDownloadExcel = async () => {
        try {
          const workbook = new ExcelJS.Workbook();
          const worksheet = workbook.addWorksheet("داده‌ها");

          const excelColumns = cols.filter((col) => col.excel === true);

          if (excelColumns.length === 0) {
            console.warn(
              "هیچ ستونی برای اکسپورت اکسل تعریف نشده (excel: true)"
            );
            return;
          }

          // ردیف عنوان‌ها
          const headerRow = excelColumns.map(
            (col) => col.defaultTitle || col.title || ""
          );
          worksheet.addRow(headerRow);

          // اضافه کردن داده‌ها
          allExportData.forEach((row, rowIndex) => {
            const rowValues = excelColumns.map((col) => {
              if (col.excelFunc && typeof col.excelFunc === "function") {
                return col.excelFunc(row);
              } else if (col.htmlFunc && typeof col.htmlFunc === "function") {
                return col.htmlFunc(row, rowIndex);
              }
              if (col.key) {
                return _.get(row, col.key);
              }
              return "";
            });
            worksheet.addRow(rowValues);
          });

          // استایل فارسی
          worksheet.eachRow({ includeEmpty: true }, (row) => {
            row.eachCell({ includeEmpty: true }, (cell) => {
              cell.alignment = { horizontal: "right", vertical: "middle" };
            });
          });
          worksheet.getRow(1).font = { bold: true };

          // تولید فایل
          const buffer = await workbook.xlsx.writeBuffer();
          const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });

          const baseName = id || "tableData";
          const dateStr = new Date()
            .toLocaleDateString("fa-IR")
            .replace(/\//g, "-");
          const fileName = `${baseName}_${dateStr}.xlsx`;

          // دانلود
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } catch (error) {
          console.error("خطا در ساخت فایل اکسل:", error);
        }
      };

      generateAndDownloadExcel();
    }
  }, [allExportData, exportStatus, cols, id]);

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
        requestConfig
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

  const numberColumn: TableColumn = {
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

  const checkboxColumn: TableColumn | null = checkBox
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
                        .filter((id) => id != null)
                    )
                  : new Set()
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

  // final column for mapping and show data on cells
  const finalColumns = useMemo(() => {
    // change cols to array
    const baseColumns: TableColumn[] = Array.isArray(cols)
      ? [...cols]
      : cols
      ? [cols]
      : [];
    // add default cols
    const withPrefix: TableColumn[] = [...baseColumns];
    if (numberColumn) {
      withPrefix.unshift(numberColumn);
    }
    if (checkBox && checkboxColumn) {
      withPrefix.unshift(checkboxColumn);
    }
    //api setting
    const apiColumns =
      configData !== null &&
      !configData.hasError &&
      configData.result.length > 0 &&
      configData.result[0]?.setting?.tables?.[id]?.columns;

    // if api is empty return default developer cols
    if (!apiColumns || !Array.isArray(apiColumns) || apiColumns.length === 0) {
      return withPrefix;
    }

    const apiColumnMap = new Map<string, any>();

    apiColumns.forEach((saved: any) => {
      if (saved?.uniqueId) {
        apiColumnMap.set(saved.uniqueId, saved);
      }
    });

    // final columns
    const resultColumns: TableColumn[] = [];

    withPrefix.forEach((col) => {
      if (col?.uniqueId?.startsWith("__")) {
        resultColumns.push(col);
        return;
      }

      const savedConfig = apiColumnMap.get(col.uniqueId);

      if (!savedConfig) {
        // column is not in api dont show
        return;
      }

      if (savedConfig.visible !== true) {
        // delete all visible:false
        return;
      }

      // visible: true -> added
      resultColumns.push({
        ...col,
        visible: true,
        width: savedConfig.width ?? col.width,
        title: savedConfig.title ?? col.title,
        excel: savedConfig.excel ?? col.excel,
        // other props is maintened from cols except these 4 fields
      });
    });
    return resultColumns;
  }, [checkBox, checkboxColumn, cols, selectedRowIds, configData]);

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

  const generateAndDownloadExcel = async (fullData: unknown[]) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("داده‌ها");

    const excelColumns = cols.filter((col) => col.excel === true);
    if (excelColumns.length === 0) return;

    const headerRow = excelColumns.map(
      (col) => col.defaultTitle || col.title || ""
    );
    worksheet.addRow(headerRow);

    fullData.forEach((row, rowIndex) => {
      const rowValues = excelColumns.map((col) => {
        if (col.excelFunc && typeof col.excelFunc === "function")
          return col.excelFunc(row);
        if (col.htmlFunc && typeof col.htmlFunc === "function")
          return col.htmlFunc(row, rowIndex);
        if (col.key) return _.get(row, col.key);
        return "";
      });
      worksheet.addRow(rowValues);
    });

    // استایل فارسی
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
      setIsExporting(false);
      setAllExportData([]);
    }, timeout);
  };

  const handleExportExcel = async () => {
    if (!onExcelExportRequest) {
      console.warn("onExcelExportRequest تعریف نشده است");
      return;
    }

    if (!totalCount || totalCount === 0) {
      console.warn("totalCount تعریف نشده است");
      return;
    }
    
    setIsExporting(true);
    setExportStatus("exporting");
    setExportProgress(0);
    setAllExportData([]);
    const controller = new AbortController();
    setAbortController(controller);

    handleExcelExportRequest();

  };

  const fetchPageWithRetry = async () => {
    if (!onExcelExportRequest) {
      console.warn("onExcelExportRequest تعریف نشده است");
      return;
    }
    console.log('page fetchPageWithRetry:' , page);
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const offset = (page - 1) * 50;
        const fullData = await onExcelExportRequest(offset);
        if (!fullData || fullData.length === 0) {
          cleanup();
          return;
        }
        await generateAndDownloadExcel(fullData);
        setExportStatus("success");
        cleanup(4000);
  
      } catch (error: any) {
        if (error.name === "AbortError") {
          setExportStatus("cancelled");
        } else {
          setExportStatus("error");
        }
        cleanup(4000);
      }
    }
  }

const handleExcelExportRequest = async () => {
  let collectedData: unknown[] = [];
  const totalPages = Math.ceil(totalCount / pageSize);

  for (let page = 1; page <= totalPages; page++) {

    const pageData = await fetchPageWithRetry();

    if (pageData === null) {
      throw new Error("دریافت داده ناموفق پس از تلاش‌ها");
    }

    collectedData = [...collectedData, ...pageData];

    const progress = Math.round((page / totalPages) * 100);

    console.log('collectedData:', collectedData);
  }
  return collectedData;
};

  const handleCancelExport = () => {
    if (abortController) {
      abortController.abort();
    }
    setExportStatus("cancelled");
    setIsExporting(false);
    setExportProgress(0);
    setAbortController(null);
    setAllExportData([]);
    cleanup(4000);
  };

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
          {isExporting ? (
            <div className=" gap-3">
              <Button
                color="success"
                size="sm"
                disabled
                className={styles.btn_xcel}
              >
                <img src={Xcel} alt="در حال تهیه" width={30} />
              </Button>
              <Progress
                animated
                striped
                value={exportProgress}
                className={styles.progressBar}
              >
                <span className="fw-bold text-dark">{exportProgress}%</span>
              </Progress>
              <Button
                color="danger"
                size="sm"
                outline
                title="انصراف"
                onClick={handleCancelExport}
                className={styles.cancel_btn}
              >
                X
              </Button>
            </div>
          ) : (
            <Button onClick={handleExportExcel} className={styles.btn_xcel}>
              <img src={Xcel} alt="دانلود اکسل" width={30} />
            </Button>
          )}
          {exportStatus === "success" && (
            <Badge
              color="success"
              pill
              className={`px-3 py-2 ${styles.badge_action_download}`}
            >
              فایل اکسل با موفقیت دانلود شد
            </Badge>
          )}
          {exportStatus === "error" && (
            <Badge
              color="danger"
              pill
              className={`px-3 py-2 ${styles.badge_action_download}`}
            >
              دانلود ناموفق بود
            </Badge>
          )}
          {exportStatus === "cancelled" && (
            <Badge
              color="secondary"
              pill
              className={`px-3 py-2 ${styles.badge_action_download}`}
            >
              دانلود توسط کاربر لغو شد
            </Badge>
          )}
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
        <Col xs="12">
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
                          style={{ width: `${colItem.width}px` }}
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
                          const val = col?.key ? _.get(row, col.key) : null;
                          return (
                            <td
                              key={col.uniqueId}
                              className={styles.td_container}
                            >
                              {(() => {
                                if (
                                  col.type === ContentType.Text ||
                                  col.type === "text"
                                ) {
                                  return <span>{val ?? "-"}</span>;
                                }
                                if (
                                  col.type === ContentType.Price ||
                                  col.type === "price"
                                ) {
                                  return (
                                    <span className="font-mono">
                                      {val?.toLocaleString?.() ?? "-"}
                                    </span>
                                  );
                                }
                                if (
                                  col.type === ContentType.Number ||
                                  col.type === "number"
                                ) {
                                  return (
                                    <span className="font-mono">
                                      {val ?? "-"}
                                    </span>
                                  );
                                }
                                if (
                                  col.type === ContentType.Badge ||
                                  col.type === "badge"
                                ) {
                                  const variant =
                                    (col as any).badgeVariant || "info";
                                  const badgeStyles: Record<string, string> = {
                                    success: "bg-green-100 text-green-800",
                                    warning: "bg-yellow-100 text-yellow-800",
                                    danger: "bg-red-100 text-red-800",
                                    info: "bg-blue-100 text-blue-800",
                                  };
                                  return (
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-medium ${badgeStyles[variant]}`}
                                    >
                                      {val ?? "-"}
                                    </span>
                                  );
                                }
                                if (
                                  col.type === ContentType.Button ||
                                  col.type === "button"
                                ) {
                                  return (
                                    <ButtonComponent
                                      buttonList={col.buttons ?? []}
                                      data={data}
                                    />
                                  );
                                }
                                if (
                                  col.type === ContentType.Image ||
                                  col.type === "img"
                                ) {
                                  return val ? (
                                    <img
                                      src={val as string}
                                      alt="تصویر"
                                      className="w-10 h-10 object-cover rounded"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 bg-gray-200 border-2 border-dashed rounded" />
                                  );
                                }
                                if (
                                  col.type === ContentType.Map ||
                                  col.type === "map"
                                ) {
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
                                }
                                if (
                                  String(col?.type || "")
                                    .trim()
                                    .toLowerCase() === "function" &&
                                  typeof col?.htmlFunc === "function"
                                ) {
                                  let cellContent: React.ReactNode = (
                                    <span>--</span>
                                  );
                                  if (typeof col.htmlFunc === "function") {
                                    try {
                                      if (col.htmlFunc.length === 2) {
                                        cellContent = (col.htmlFunc as any)(
                                          row,
                                          rowIndex
                                        );
                                      } else {
                                        cellContent = (col.htmlFunc as any)(
                                          row
                                        );
                                      }
                                    } catch (error) {
                                      console.error(
                                        "خطا در اجرای htmlFunc:",
                                        error,
                                        col.uniqueId
                                      );
                                      cellContent = (
                                        <span className="text-red-600">
                                          خطا!
                                        </span>
                                      );
                                    }
                                  } else {
                                    cellContent = <span>{val ?? "-"}</span>;
                                  }
                                  return cellContent;
                                }
                                return <span>{val ?? "-"}</span>;
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
        </Col>
        <Col xs="12">
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
        </Col>
      </Row>
    );
  }
};

export default Table;
