import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Input,
  Label,
  Badge,
} from "reactstrap";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SortableItemProps, rowProps } from "../../types/index";
import styles from "./setting.module.scss";
import IconFilter from "../../assets/icons/IconFilter.svg";

const SortableItem = React.forwardRef<HTMLDivElement, SortableItemProps>(
  ({ id, tableId, row, config, onChangeTitle, onChangeWidth, onChangeVisibility, onChangeExcelExport }, ref) => {
    const {
      attributes,
      listeners,
      setNodeRef: sortableSetNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    const [inputValue, setInputValue] = useState({
      title: "",
      width: row.width || '200',
      excel: row.excel,
      visible: row.visible
    })

    const [badgeValue, setBadgeValue] = useState(row.title);
    
    useEffect(() => {
      const allTables = config.result[0].setting;
      if(row && row.defaultTitle) {
        setBadgeValue(row.defaultTitle)
      } else {
        setBadgeValue(row.title)
      }

      if(config.result[0] && config.result[0].setting.tables[tableId]) {
        setInputValue((prev) => ({
          ...prev,
          title: allTables.tables[tableId].columns.find((x: rowProps) => x.uniqueId == row.uniqueId)?.title,
          width: allTables.tables[tableId].columns.find((x: rowProps) => x.uniqueId == row.uniqueId)?.width,
          excel: allTables.tables[tableId].columns.find( (x: rowProps) => x.uniqueId === row.uniqueId)?.excel,
          visible: allTables.tables[tableId].columns.find( (x: rowProps) => x.uniqueId === row.uniqueId)?.visible,
        }))
      } else {
        setInputValue((prev) => ({
          ...prev,
          title: "" ,
          width: row.width || '200',
          excel: row.excel,
          visible: row.visible,
        }))
      } 
    } , [])

    const IconExcel = ({ isActive }: { isActive: boolean }) => (
      isActive ? (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="0.666667" y="0.666667" width="30.6667" height="30.6667" rx="7.33333" fill="#43A824" fill-opacity="0.12"/>
          <rect x="0.666667" y="0.666667" width="30.6667" height="30.6667" rx="7.33333" stroke="#B2E0C7" stroke-width="1.33333"/>
          <path d="M10.5792 14.9731L12.8829 11.0718H14.7114L11.5582 16.2491L14.7978 21.4998H12.9404L10.5792 17.5398L8.21793 21.4998H6.375L9.61453 16.2491L6.44699 11.0718H8.27552L10.5792 14.9731Z" fill="#03B958"/>
          <path d="M17.6629 21.5H16.1367V10.5H17.6629V21.5Z" fill="#03B958"/>
          <path d="M22.2705 16.4399L23.8399 13.7559H25.5388L23.1488 17.5692L25.6252 21.4999H23.9262L22.2849 18.7132L20.6435 21.4999H18.9302L21.4066 17.5692L19.0166 13.7559H20.7155L22.2705 16.4399Z" fill="#03B958"/>
        </svg>
      ) : (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="0.666667" y="0.666667" width="30.6667" height="30.6667" rx="7.33333" stroke="#99DDC4" stroke-width="1.33333"/>
          <path d="M10.5792 14.9731L12.8829 11.0718H14.7114L11.5582 16.2491L14.7978 21.4998H12.9404L10.5792 17.5398L8.21793 21.4998H6.375L9.61453 16.2491L6.44699 11.0718H8.27552L10.5792 14.9731Z" fill="#99DDC4"/>
          <path d="M17.6629 21.5H16.1367V10.5H17.6629V21.5Z" fill="#99DDC4"/>
          <path d="M22.2705 16.4399L23.8399 13.7559H25.5388L23.1488 17.5692L25.6252 21.4999H23.9262L22.2849 18.7132L20.6435 21.4999H18.9302L21.4066 17.5692L19.0166 13.7559H20.7155L22.2705 16.4399Z" fill="#99DDC4"/>
        </svg>
      )
    );

    const IconVisible = ({isActive} : {isActive: boolean}) => (
      isActive ? (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 0.5H24C28.1421 0.5 31.5 3.85786 31.5 8V24C31.5 28.1421 28.1421 31.5 24 31.5H8C3.85786 31.5 0.5 28.1421 0.5 24V8C0.5 3.85786 3.85786 0.5 8 0.5Z" fill="#E8E6FE"/>
          <path d="M8 0.5H24C28.1421 0.5 31.5 3.85786 31.5 8V24C31.5 28.1421 28.1421 31.5 24 31.5H8C3.85786 31.5 0.5 28.1421 0.5 24V8C0.5 3.85786 3.85786 0.5 8 0.5Z" stroke="#B6B0FF"/>
          <g clip-path="url(#clip0_58_41089)">
          <path opacity="0.4" d="M19.5799 15.9999C19.5799 17.9799 17.9799 19.5799 15.9999 19.5799C14.0199 19.5799 12.4199 17.9799 12.4199 15.9999C12.4199 14.0199 14.0199 12.4199 15.9999 12.4199C17.9799 12.4199 19.5799 14.0199 19.5799 15.9999Z" stroke="#6155F5" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M16.0001 24.2702C19.5301 24.2702 22.8201 22.1902 25.1101 18.5902C26.0101 17.1802 26.0101 14.8102 25.1101 13.4002C22.8201 9.80021 19.5301 7.72021 16.0001 7.72021C12.4701 7.72021 9.18009 9.80021 6.89009 13.4002C5.99009 14.8102 5.99009 17.1802 6.89009 18.5902C9.18009 22.1902 12.4701 24.2702 16.0001 24.2702Z" stroke="#6155F5" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </g>
          <defs>
          <clipPath id="clip0_58_41089">
          <rect width="24" height="24" fill="white" transform="translate(4 4)"/>
          </clipPath>
          </defs>
        </svg>
      ) : (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 0.5H24C28.1421 0.5 31.5 3.85786 31.5 8V24C31.5 28.1421 28.1421 31.5 24 31.5H8C3.85786 31.5 0.5 28.1421 0.5 24V8C0.5 3.85786 3.85786 0.5 8 0.5Z" fill="white"/>
          <path d="M8 0.5H24C28.1421 0.5 31.5 3.85786 31.5 8V24C31.5 28.1421 28.1421 31.5 24 31.5H8C3.85786 31.5 0.5 28.1421 0.5 24V8C0.5 3.85786 3.85786 0.5 8 0.5Z" stroke="#BCBBEF"/>
          <g clip-path="url(#clip0_58_41067)">
          <path d="M18.5299 13.4699L13.4699 18.5299C12.8199 17.8799 12.4199 16.9899 12.4199 15.9999C12.4199 14.0199 14.0199 12.4199 15.9999 12.4199C16.9899 12.4199 17.8799 12.8199 18.5299 13.4699Z" stroke="#BCBBEF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M21.8201 9.76998C20.0701 8.44998 18.0701 7.72998 16.0001 7.72998C12.4701 7.72998 9.18009 9.80998 6.89009 13.41C5.99009 14.82 5.99009 17.19 6.89009 18.6C7.68009 19.84 8.60009 20.91 9.60009 21.77" stroke="#BCBBEF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12.4199 23.5302C13.5599 24.0102 14.7699 24.2702 15.9999 24.2702C19.5299 24.2702 22.8199 22.1902 25.1099 18.5902C26.0099 17.1802 26.0099 14.8102 25.1099 13.4002C24.7799 12.8802 24.4199 12.3902 24.0499 11.9302" stroke="#BCBBEF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M19.5099 16.7002C19.2499 18.1102 18.0999 19.2602 16.6899 19.5202" stroke="#BCBBEF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M13.47 18.5298L6 25.9998" stroke="#BCBBEF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M26 6L18.53 13.47" stroke="#BCBBEF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </g>
          <defs>
          <clipPath id="clip0_58_41067">
          <rect width="24" height="24" fill="white" transform="translate(4 4)"/>
          </clipPath>
          </defs>
        </svg>
      )
    )

    const combinedRef = (node: HTMLDivElement | null) => {
      sortableSetNodeRef(node);
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };

    const handleChangeWidth = (event: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue((prev) => ({
        ...prev,
        width: event.target.value
      }))
      onChangeWidth(event.target.value, row.uniqueId)
    };
    

    const handleChangeTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue((prev) => ({
        ...prev,
        title: event.target.value,
      }))
      onChangeTitle(event.target.value, row.uniqueId) 
    }

    const handleChangeExcelExport = () => {
      setInputValue((prev) => ({
        ...prev,
        excel: !inputValue.excel
      }))
      onChangeExcelExport(!inputValue.excel, row.uniqueId)
    };

    const handleChangeFieldVisibility = () => {
      setInputValue((prev) => ({
        ...prev,
        visible: !inputValue.visible
      }))
      onChangeVisibility(!inputValue.visible, row.uniqueId)
    };

    return (
      <div ref={combinedRef} className={styles.border_bottom_}>
        <Row
          style={style}
          className={`${styles.dargableItem_wrapper} ${
            isDragging ? styles.isDragging : ""
          }`}
        >
          <Col
            xs="6"
            className="d-flex align-items-center justify-content-between py-3"
          >
            <div className={styles.first_field_wrapper}>
              <div
                {...attributes}
                {...listeners}
                className={styles.drag_icon}
                style={{ cursor: "grab" }}
              >
                <img src={IconFilter} alt="drag handle" />
              </div>
              <div className={styles.input_badge_wrapper}>
                <Input
                  name="field"
                  className={styles.inputItem_title}
                  placeholder="نام فیلد"
                  disabled={!inputValue.visible && !inputValue.excel}
                  onChange={handleChangeTitle}
                  value={inputValue.title}
                />
                <Badge className={styles.badgeItem} color="light" pill>
                  { badgeValue }
                </Badge>
              </div>
            </div>
          </Col>
          <Col xs="4" className="d-flex align-items-center">
            <div className="p-0 text-right ml-3">
              <Label for="selectwidth" className={styles.column_label_width}>
                عرض ستون
              </Label>
            </div>
            <div className={`p-0 ${styles.t_px_input}`}>
              <Input
                id="selectwidth"
                type="text"
                className={styles.column_input_width}
                onChange={handleChangeWidth}
                value={inputValue.width}
                disabled={!inputValue.visible && !inputValue.excel}
              ></Input>
              <span>px</span>
            </div>
          </Col>
          <Col xs="2" className="d-flex align-items-center justify-content-end">
            <div className={styles.setting_icons}>
              <button onClick={handleChangeExcelExport}>
                <IconExcel isActive={inputValue.excel} />
              </button>
              <button onClick={handleChangeFieldVisibility}>
                <IconVisible isActive={inputValue.visible}  />
              </button>
            </div>
          </Col>
        </Row>
      </div>
    );
  }
);

SortableItem.displayName = "SortableItem";

export default SortableItem;
