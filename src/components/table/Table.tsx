import React, { useState, useEffect, useMemo, useRef } from "react";
import _ from "lodash";
import { TableColumn, TableProps } from "../../types/index";
import styles from "./table.module.scss";
import { Table as ReactstrapTable } from 'reactstrap';
import Checkbox from "../checkBox";

const Table: React.FC<TableProps> = ({
  data,
  cols,
  checkBox = false,
  onRowSelect,
}) => {
  // just keeping index
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string | number>>(new Set());

  console.log('🟠 INITIAL STATE:', {
    dataLength: data.length,
    initialSelectedIds: Array.from(selectedRowIds)
  });

  console.log('🟡 COMPONENT RENDER - selectedRowIds:', Array.from(selectedRowIds));
  console.log('🟡 COMPONENT RENDER - data ids:', data.map(item => (item as any)?.id));



  // selection of rows send to parent
  useEffect(() => {
    if (onRowSelect) {
      const selectedData = data.filter(row => {
        const rowId = (row as any)?.id;
        return rowId != null && selectedRowIds.has(rowId);
      });
      onRowSelect(selectedData);
    }
  }, [selectedRowIds, data, onRowSelect]);


  // helper function
  const isTwoArgRender = (
    value: TableColumn['type']
  ): value is (row: unknown, index: number) => React.ReactNode => {
    return typeof value === 'function' && value.length === 2;
  };
  

  const checkboxColumn: TableColumn = {
    uniqueId: "__row_selector__",
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
            checked ? new Set(
                data.map(row => (row as any)?.id).filter(id => id != null)
              ) : new Set()
          );
        }}
      />
    ),
    key: "__row_selector__",
    width: "50",
    type: (row: any, rowIndex: number) => {
      const rowId = row?.id;
      console.log('🔴 ROW DEBUG:', {
        rowId,
        row,
        selectedRowIds: Array.from(selectedRowIds),
        isChecked: rowId !== undefined && selectedRowIds.has(rowId)
      });
      return (
        <Checkbox
          uniqueId={`checkbox-${rowId}`}
          checked={rowId !== undefined && selectedRowIds.has(rowId)}
          onChange={(checked) => {
            setSelectedRowIds(prev => {
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
      )
    },
  };


  // final column
  const finalColumns = useMemo(() => {
    return checkBox ? [checkboxColumn, ...cols] : cols;
  }, [checkBox, cols]);


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
