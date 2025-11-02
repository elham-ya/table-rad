import React, { useEffect, useState, useMemo } from 'react';
import { TableProps, TableColumn} from '../../types/index'
import styles from "./table.module.scss";
import { Table as ReactstrapTable } from 'reactstrap';
import _ from 'lodash';
import PaginationView from '../pagination';
import Checkbox from '../checkBox/index';


const TableView: React.FC<TableProps> = ({
  data, 
  cols,
  checkBox = false,
  onRowSelect,}) => {

  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  useEffect(() => {
    setSelectedRows(new Set());
  }, [data]);

  useEffect(() => {
    if (onRowSelect) {
      const selectedData = data.filter((_, i) => selectedRows.has(i));
      onRowSelect(selectedData);
    }
  }, [selectedRows, data, onRowSelect]);

  

  const checkboxColumn: TableColumn = {
    uniqueId: '__row_selector__',
    title: (
      <Checkbox
        checked={data.length > 0 && selectedRows.size === data.length}
        onChange={() => {
          setSelectedRows(prev =>
            prev.size === data.length ? new Set() : new Set(data.map((_, i) => i))
          );
        }}
      />
    ),
    key: '__row_selector__',
    width: '50',
    type: (_row: unknown, rowIndex: number) => (
      <Checkbox
        checked={selectedRows.has(rowIndex)}
        onChange={(a,b) => {
          console.log(a,':a');
          console.log(b,':b');
          
          setSelectedRows(prev => {
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

  const finalColumns = useMemo(() => {
    return checkBox ? [checkboxColumn, ...cols] : cols;
  }, [checkBox, cols]);
 

  
    return (
      <>
        <ReactstrapTable className={styles.tableContainer}>
          <thead className={styles.theader_container}>
            <tr className={styles.tr_container}>
              {finalColumns.map((col, index) => (
                <th className={styles.th_container} key={index}>{col.title}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {
              data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {


                    finalColumns.map(col => {
                // رندر بر اساس type, htmlFunc, یا key
                let cellContent: React.ReactNode;

                if (col.type) {
                  if (typeof col.type === 'function') {
                    // اگر تابع دو آرگومان می‌گیره (row, index)
                    if (col.type.length === 2) {
                      cellContent = (col.type as (row: unknown, index: number) => React.ReactNode)(
                        row,
                        rowIndex
                      );
                    } else {
                      cellContent = (col.type as (row: unknown) => React.ReactNode)(row);
                    }
                  } else {
                    cellContent = col.type; // string یا React.FC
                  }
                } else if (col.htmlFunc) {
                  cellContent = col.htmlFunc(row);
                } else {
                  cellContent = _.get(row, col.key, '-');
                }

                return (
                  <td
                  className={styles.td_container}
                    key={col.uniqueId}
                    
                  >
                    {cellContent}
                  </td>
                );
              })


                  }
                </tr>
              ))
            }
          </tbody>
        </ReactstrapTable>
        <PaginationView />
      </>
  );
}
export default TableView;