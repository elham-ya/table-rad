import React from 'react';
import {ButtonProps, TableColumn} from '../../types';

const Button: React.FC<ButtonProps> = ({data, cols}) => {

  const actionColumn : TableColumn = 
    {
      uniqueId:"action",
      title: "عملیات",
      key: "actions",
      width: "200",
      type: "function"
    }
  
  return (
    <div>Button</div>
  )
}

export default Button;