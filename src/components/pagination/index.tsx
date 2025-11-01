
import React from 'react';
import {
  Pagination,
  PaginationItem,
  PaginationLink
} from 'reactstrap';
import { PaginationProps } from '../../types/index';


const PaginationView: React.FC<PaginationProps> = () => {
    return (
    <Pagination>
      <PaginationItem>
        <PaginationLink previous href="#" />
      </PaginationItem>
      <PaginationItem>
        <PaginationLink href="#">
          1
        </PaginationLink>
      </PaginationItem>
      <PaginationItem>
        <PaginationLink href="#">
          2
        </PaginationLink>
      </PaginationItem>
      <PaginationItem>
        <PaginationLink next href="#" />
      </PaginationItem>
    </Pagination>
    )
}

export default PaginationView;