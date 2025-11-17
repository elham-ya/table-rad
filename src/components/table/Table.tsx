import React, { useState, useEffect, useMemo, useRef } from "react";
import _, { size, uniqueId } from "lodash";
import { TableColumn, TableProps, ContentType } from "../../types/index";
import styles from "./table.module.scss";
import {
  Table as ReactstrapTable,
  Row,
  Col,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import Checkbox from "../checkBox";
import ButtonComponent from "../button";
import TablePagination from "../pagination";
import SettingModal from '../setting'
import SettingButtonIcon from "../../assets/icons/SettingButton.svg";

const Table: React.FC<TableProps> = ({
  data,
  cols,
  checkBox = false,
  onRowSelect,
  onPageChange,
  onSizeChange,
}) => {
  // just keeping index
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string | number>>(
    new Set()
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [settingModal, setSettingModal] = useState(false);

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

  const numberColumn: TableColumn = {
    uniqueId: "__number__selector__",
    key: "__number__selector__",
    width: "50",
    type: ContentType.Function,
    title: "#",
    htmlFunc: (row: any, rowIndex: number) => {
      console.log("rowIndex:", rowIndex);

      return rowIndex + 1;
    },
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
              uniqueId={`checkbox-${rowId}`}
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
      }
    : null;

  // final column for mapping and show data on cells
  const finalColumns = useMemo(() => {
    const base = [numberColumn, ...cols];
    return checkBox && checkboxColumn ? [checkboxColumn, ...base] : base;
  }, [checkBox, checkboxColumn, cols, selectedRowIds]);

  const handlePageChange = (pageNumber: number) => {
    setPage(pageNumber);
    onPageChange?.(pageNumber);
    // می‌توانید اینجا درخواست داده جدید را انجام دهید
  };

  const handleSizeChange = (pageSize: number) => {
    setPageSize(pageSize);
    onSizeChange?.(pageSize)
    // می‌توانید اینجا درخواست داده جدید را انجام دهید
  };

  const toggleSetting = () => {
    setSettingModal(!settingModal);
  };

  return (
    <Row>
      <Col xs="6"></Col>
      <Col xs="6" className={`py-2 ${styles.modal_Setting}`}>
        <Button onClick={toggleSetting} className={styles.btn_setting}>
          <img width={30} src={SettingButtonIcon} />
        </Button>
        <SettingModal
          isOpen={settingModal}
          toggle={toggleSetting}
          columns={cols}
          value={data}
        />
      </Col>
      <Col xs="12">
        <ReactstrapTable className={styles.tableContainer}>
          <thead className={styles.theader_container}>
            <tr className={styles.tr_container}>
              {finalColumns.map((colItem) => (
                <th
                  key={colItem.uniqueId}
                  className={styles.th_container}
                  style={{ width: `${colItem.width}px` }}
                >
                  {colItem.title}
                </th>
              ))}
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
                    return (
                      <td key={col.uniqueId} className={styles.td_container}>
                        {(() => {
                          // 1. متن ساده
                          if (!col.type || col.type === ContentType.Text) {
                            return <span>{val ?? "-"}</span>;
                          }
                          // 2. عدد با کاما
                          if (col.type === ContentType.Number) {
                            return (
                              <span className="font-mono">
                                {val?.toLocaleString?.() ?? "-"}
                              </span>
                            );
                          }
                          // 3. بج
                          if (col.type === ContentType.Badge) {
                            const variant = (col as any).badgeVariant || "info";
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

                          // 4. دکمه
                          if (col.type === ContentType.Button) {
                            console.log("col sss:", col);

                            return (
                              <ButtonComponent
                                buttonList={col.buttons ?? []}
                                data={data}
                              />
                            );
                          }

                          // 5. تصویر
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

                          // 6. نقشه
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

                          // 7. تابع سفارشی
                          if (col.type === ContentType.Function) {
                            if (col.htmlFunc) {
                              // اگر دو آرگومان داره
                              if (
                                typeof col.htmlFunc === "function" &&
                                col.htmlFunc.length === 2
                              ) {
                                return (col.htmlFunc as any)(row, rowIndex);
                              }
                              // فقط یک آرگومان
                              return (col.htmlFunc as any)(row);
                            }
                            return "-";
                          }

                          // پیش‌فرض
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
          totalCount={240}
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
};

export default Table;
