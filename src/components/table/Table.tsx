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
  Tooltip,
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
  onExcelExportClick,
  allDataForExport = [],
  exportProgress = 0,
  isExporting = false,
  exportMessage = null,
  size = 10,
  onCancelExport
}) => {
  
  // just keeping index
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string | number>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(size);
  const [settingModal, setSettingModal] = useState(false);
  const [configData, setConfigData] = useState<ApiResponse | null>(null);
  const [tooltipOpen, setTooltipOpen] = useState(false);

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
    if (allDataForExport.length > 0 && exportMessage === "success") {
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
          allDataForExport.forEach((row) => {
            const rowValues = excelColumns.map((col) => {
              if (col.excelFunc && typeof col.excelFunc === "function") {
                return col.excelFunc(row);
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
  }, [allDataForExport, exportMessage, cols, id]);

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



  const toggleTooltip = () => setTooltipOpen(!tooltipOpen);

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
        width: "20",
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
              <Progress value={exportProgress} className={styles.progressBar}>
                <span className="fw-bold text-dark">{exportProgress}%</span>
              </Progress>
              <Button
                color="danger"
                size="sm"
                outline
                id='cancelbtn'
                tooltip="cancel"
                onClick={() => onCancelExport?.()}
              >
                X
              </Button>
              <Tooltip
                isOpen={tooltipOpen}
                target='cancelbtn'
                toggle={toggleTooltip}
              >
                انصراف
              </Tooltip>
            </div>
          ) : (
            <Button
              onClick={() => onExcelExportClick?.()}
              className={styles.btn_xcel}
            >
              <img src={Xcel} alt="دانلود اکسل" width={30} />
            </Button>
          )}
          {/* پیام موفقیت یا خطا */}
          {exportMessage === "success" && (
            <Badge
              color="success"
              pill
              className={`px-3 py-2 ${styles.badge_action_download}`}
            >
              فایل اکسل با موفقیت دانلود شد
            </Badge>
          )}
          {exportMessage === "error" && (
            <Badge
              color="danger"
              pill
              className={`px-3 py-2 ${styles.badge_action_download}`}
            >
              دانلود ناموفق بود
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
          <ReactstrapTable className={styles.tableContainer}>
            <thead className={styles.theader_container}>
              <tr className={styles.tr_container}>
                {finalColumns.map((colItem) => {
                  return (
                    <th
                      key={colItem.uniqueId}
                      className={styles.th_container}
                      style={{ width: `${colItem.width}px`}}
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
                        <td key={col.uniqueId} className={styles.td_container}>
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
                                <span className="font-mono">{val ?? "-"}</span>
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
                                    cellContent = (col.htmlFunc as any)(row);
                                  }
                                } catch (error) {
                                  console.error(
                                    "خطا در اجرای htmlFunc:",
                                    error,
                                    col.uniqueId
                                  );
                                  cellContent = (
                                    <span className="text-red-600">خطا!</span>
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
