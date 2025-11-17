import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Table as ReactstrapTable,
  Row,
  Col,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,Input
} from "reactstrap";
import SearchIcon from '../../assets/icons/IconSearch.svg'
import styles from './setting.module.scss';
import ColumnItem from './columnItem';

export default function SettingModal({
  isOpen = false,
  toggle = () => {},
  columns = [],
  value = []
}) {

  return (
    <Row>
      <Col xs='12'>
        <Modal isOpen={isOpen} size='lg' toggle={toggle} className={styles.modal_wrapper}>
          <ModalHeader toggle={toggle} className={styles.modal_itemheader}>تنظیمات ستون</ModalHeader>
          <ModalBody>
            <Row>
              <Col xs='12'>
                <div className={styles.search_wrapper}>
                  <Input name="search" type='text' placeholder="جستجو..." />
                  <button className={styles.search_btn}>
                    <img src={SearchIcon} />
                  </button>
                </div>
              </Col>
              <Col xs='12' className='py-3'>
                <ColumnItem columns={columns} />
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" className={styles.cancel_btn} onClick={toggle}>
              انصراف
            </Button>
            <Button color="primary" className={styles.save_btn} onClick={toggle} >
              تایید
            </Button>
          </ModalFooter>
        </Modal>
      </Col>
    </Row>
  );
};
