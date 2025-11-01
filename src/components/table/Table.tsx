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
        <div className={styles.table}>
          <ReactstrapTable bordered responsive>
            <thead>
              <tr>
                {cols.map((col, index) => (
                  <th key={index}>{col.title}</th>
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
                          style={{ border: '1px solid #ddd', padding: '8px' }}
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
        </div>
        <PaginationView />
      </>
  );
}
export default TableView;