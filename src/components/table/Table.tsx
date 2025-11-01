import React from 'react';
import {TableProps} from '../../types/index'
import styles from "../../styles/table.module.scss";
import { Table as ReactstrapTable } from 'reactstrap';
import _ from 'lodash';
import PaginationView from '../pagination'


const TableView: React.FC<TableProps> = ({data, cols }) => {
  {console.log('cols:', cols);
    console.log('data:',data);
  }
    return (
      <>
     
          <ReactstrapTable className={styles.tableContainer}>
            <thead className={styles.theader_container}>
              <tr className={styles.tr_container}>
                {cols.map((col, index) => (
                  <th className={styles.th_container} key={index}>{col.title}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {
                data.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {
                      cols.map((col) => (
                        <td 
                          key={col.uniqueId}
                          className={styles.td_container}
                        >
                          {col.htmlFunc
                          ? col.htmlFunc(row) // اگر htmlFunc وجود داشته باشد، از آن استفاده کن
                          : _.get(row, col.key, '-') || '-' // در غیر این صورت، مقدار را از data بگیر
                        }
                        </td>
                      ))
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