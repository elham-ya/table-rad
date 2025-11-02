import React, { useState, useEffect, useMemo } from "react";
import _ from "lodash";
import { TableColumn, TableProps } from "../../types/index";
import styles from "./table.module.scss";
import { Table as ReactstrapTable } from 'reactstrap';

const Table: React.FC<TableProps> = ({
  data,
  cols,
  checkBox = false,
  onRowSelect,
}) => {
  // --- فقط ایندکس‌ها رو نگه می‌داریم ---
  const [selectedRowIndices, setSelectedRowIndices] = useState<Set<number>>(
    new Set()
  );

  // --- وقتی data عوض شد، انتخاب‌ها رو ریست کن ---
  useEffect(() => {
    setSelectedRowIndices(new Set());
  }, [data]);

  // --- به والد بگو کدوم ردیف‌ها انتخاب شدن (داده واقعی) ---
  useEffect(() => {
    if (onRowSelect) {
      const selectedData = Array.from(selectedRowIndices)
        .sort((a, b) => a - b)
        .map((i) => data[i])
        .filter(Boolean);
      onRowSelect(selectedData);
    }
  }, [selectedRowIndices, data, onRowSelect]);
// تابع کمکی — بالای کامپوننت
const isTwoArgRender = (
  value: TableColumn['type']
): value is (row: unknown, index: number) => React.ReactNode => {
  return typeof value === 'function' && value.length === 2;
};
  // --- کامپوننت چک‌باکس (ساده و کارکردی) ---
  const Checkbox = ({
    checked,
    onChange,
  }: {
    checked: boolean;
    onChange: () => void;
  }) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      style={{
        width: "16px",
        height: "16px",
        cursor: "pointer",
        accentColor: "#007bff",
      }}
    />
  );

  // --- ستون چک‌باکس ---
  const checkboxColumn: TableColumn = {
    uniqueId: "__row_selector__",
    title: (
      <Checkbox
        checked={data.length > 0 && selectedRowIndices.size === data.length}
        onChange={() => {
          setSelectedRowIndices((prev) =>
            prev.size === data.length
              ? new Set()
              : new Set(data.map((_, i) => i))
          );
        }}
      />
    ),
    key: "__row_selector__",
    width: "50",
    type: (_row: unknown, rowIndex: number) => (
      <Checkbox
        checked={selectedRowIndices.has(rowIndex)}
        onChange={() => {
          setSelectedRowIndices((prev) => {
            const next = new Set(prev);
            if (next.has(rowIndex)) {
              next.delete(rowIndex);
            } else {
              next.add(rowIndex);
            }
            return next;
          });
        }}
      />
    ),
  };

  // --- ستون‌های نهایی ---
  const finalColumns = useMemo(() => {
    return checkBox ? [checkboxColumn, ...cols] : cols;
  }, [checkBox, cols]);

  // --- رندر ---
  return (
    <ReactstrapTable
      className={styles.tableContainer}
    >
      <thead className={styles.theader_container}>
        <tr className={styles.tr_container}>
          {finalColumns.map((col) => (
            <th
              key={col.uniqueId}
              className={styles.th_container}
            >
              {col.title}
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
              key={rowIndex} // مهم: key باید rowIndex باشه
              className={styles.tr_container}
            >
              {finalColumns.map((col) => {
                let cellContent: React.ReactNode = "-";

                if (col.type) {
                  if (typeof col.type === "function") {
                    if (isTwoArgRender(col.type)) {
                      cellContent = col.type(row, rowIndex);
                    } else {
                      cellContent = (
                        col.type as (row: unknown) => React.ReactNode
                      )(row);
                    }
                  } else {
                    cellContent = col.type;
                  }
                } else if (col.htmlFunc) {
                  cellContent = col.htmlFunc(row);
                } else {
                  cellContent = _.get(row, col.key, "-");
                }

                return (
                  <td
                    key={col.uniqueId}
                    className={styles.td_container}
                  >
                    {cellContent}
                  </td>
                );
              })}
            </tr>
          ))
        )}
      </tbody>
    </ReactstrapTable>
  );
};

export default Table;
