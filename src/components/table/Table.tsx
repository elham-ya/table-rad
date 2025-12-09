import React, { useState, useEffect, useMemo } from "react";
import _ from "lodash";
import {
  TableColumn,
  TableProps,
  ContentType,
  ApiResponse,
} from "../../types/index";
import styles from "./table.module.scss";
import { Table as ReactstrapTable, Row, Col, Button } from "reactstrap";
import Checkbox from "../checkBox";
import ButtonComponent from "../button";
import TablePagination from "../pagination";
import SettingModal from "../setting";
import SettingButtonIcon from "../../assets/icons/SettingButton.svg";

const Table: React.FC<TableProps> = ({
  id,
  data,
  cols,
  checkBox = false,
  onRowSelect,
  onPageChange,
  onSizeChange,
  requestConfig,
  totalCount = 0
}) => {
  // just keeping index
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string | number>>(
    new Set()
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [settingModal, setSettingModal] = useState(false);
  const [configData, setConfigData] = useState<ApiResponse | null>(null);

  console.log("configData for table:", configData);  
  console.log("developer cols for table:", cols);
  console.log("requestConfig:", requestConfig);

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
      return rowIndex + 1;
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
    let base = [];
    const apiCol =
      configData !== null && configData.result.length > 0
        ? configData.result[0].setting.tables[id]?.columns
        : [];

    if (apiCol !== undefined && apiCol.length > 0) {
      base = [numberColumn, ...apiCol];
    } else {
      base = [numberColumn, ...cols];
    }

    return checkBox && checkboxColumn ? [checkboxColumn, ...base] : base;
  }, [checkBox, checkboxColumn, cols, selectedRowIds, configData]);

  console.log("finalColumns at parent:", finalColumns);

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
                    colItem.visible && (
                      <th
                        key={colItem.uniqueId}
                        className={styles.th_container}
                        style={{ width: `${colItem.width}px` }}
                      >
                        {colItem.title}
                      </th>
                    )
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
                      const val = col.key ? _.get(row, col.key) : null;
                      if (col.visible) {
                        return (
                          <td
                            key={col.uniqueId}
                            className={styles.td_container}
                          >
                            {(() => {
                              if (col.type === ContentType.Text) {
                                return <span>{val ?? "-"}</span>;
                              }
                              if (col.type === ContentType.Price) {
                                return (
                                  <span className="font-mono">
                                    {val?.toLocaleString?.() ?? "-"}
                                  </span>
                                );
                              }
                              if (col.type === ContentType.Number) {
                                return (
                                  <span className="font-mono">
                                    {val ?? "-"}
                                  </span>
                                );
                              }
                              if (col.type === ContentType.Badge) {
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
                              if (col.type === ContentType.Button) {
                                return (
                                  <ButtonComponent
                                    buttonList={col.buttons ?? []}
                                    data={data}
                                  />
                                );
                              }
                              if (col.type === ContentType.Image) {
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
                              if (col.type === ContentType.Map) {
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
                              if (col.type === ContentType.Function) {
                                if (col.htmlFunc) {
                                  if (
                                    typeof col.htmlFunc === "function" &&
                                    col.htmlFunc.length === 2
                                  ) {
                                    console.log('11',col.htmlFunc, row, rowIndex);
                                    
                                    return (col.htmlFunc as any)(row, rowIndex);
                                  }
                                  console.log('222',col.htmlFunc, row);
                                  return (col.htmlFunc as any)(row);
                                }
                                return "-";
                              }
                              return <span>{val ?? "-"}</span>;
                            })()}
                          </td>
                        );
                      }
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
            size={pageSize}
            onPageChange={handlePageChange}
            onSizeChange={handleSizeChange}
            pageSizeOptions={[10, 25, 50, 100]}
            showTotal
            showSizeChanger
          />
        </Col>
      </Row>
    );
  }
};

export default Table;
