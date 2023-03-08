import React, { useState } from "react";
import { Col, Form, Row, Tab, Tabs } from "react-bootstrap";
import toast from "react-hot-toast";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import Delete from "../../../Components/Modals/DeleteModal";
import Navbar from "../../../Components/Navbar/Navbar";
import Table from "../../../Components/TableTemplate/Table";
import AdjustmentTable from "./../../Inventory/Adjustment/AdjustmentTable";
import {
    dateFormat,
    formatDateNoTime,
    formatDate,
    numberFormat,
    refreshPage,
    toastStyle,
    getTodayDate,
    getType,
    TokenExpiry,
    getTodayDateISO
} from "../../../Helpers/Utils/Common";
import DatePicker from "react-datepicker";
import Moment from "moment";

import { getAllFranchisee } from "../../../Helpers/apiCalls/franchiseeApi";
import { searchWastage, deleteWastage } from "../../../Helpers/apiCalls/Reports/DailyWastageApi";
import { getAllBranches } from "../../../Helpers/apiCalls/Manage/Branches";
import { getAllItems } from "../../../Helpers/apiCalls/itemsApi";

import { CSVLink, CSVDownload } from "react-csv";
import downloadIcon from "../../../Assets/Images/download_icon.png";

export default function SalesByItem() {
    let navigate = useNavigate();
    var dateToday = getTodayDate();
    const accountType = getType();
    const [inactive, setInactive] = useState(true);
    const [filterConfig, setFilterConfig] = useState({})
    const [branches, setBranches] = useState([]);
    const [showLoader, setShowLoader] = useState(false);
    const [wastage, setWastage] = useState([]);
    const [wastageItems, setWastageItems] = useState([]);
    const [totalQuantity, setTotalQuantity] = useState([]);
    const [averagePrice, setAveragePrice] = useState([]);
    const [totalAmount, setTotalAmount] = useState([]);
    const [selectedRow, setSelectedRow] = useState([]);
    const [items, setItems] = useState([]);

    /* delete modal handler */
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const handleShowDeleteModal = () => setShowDeleteModal(true);
    const handleCloseDeleteModal = () => setShowDeleteModal(false);
    const today = Moment().format("MM/DD/YYYY");

    const excelHeaders = [
        { label: "Branch Name", key: "branch_name" },
        { label: "Date", key: "wastage_date" },
        { label: "Item", key: "name" },
        { label: "Quantity", key: "qty" },
        { label: "Unit", key: "unit" },
        { label: "Reason", key: "reason" },
        { label: "Wastage By", key: "wasted_by_name" },
        { label: "Remarks", key: "remarks" },
    ];

    const dummy = [
        {
            id: "1",
            branch_name: "SM CITY CEBU",
            date: "December 2022",
            remarks: "asdfasdf",
        },
    ]

    // SEARCH USER
    function handleOnSearch(e) {
        const { name, value } = e.target;
        setFilterConfig((prev) => {
            return { ...prev, [name]: value };
        });
    }

    function handleSelectChange(e, row) {
        setSelectedRow(row);

        if (e.target.value === "view") {
            {
                window.open('/dailywastage/view/' + row.id ,'_blank')
            };
        } else if (e.target.value === "delete") {
            handleShowDeleteModal();
        }
    }

    function ActionBtn(row, type) {
        return (
            <Form.Select
                name="action"
                className="PO-select-action"
                onChange={(e) => handleSelectChange(e, row)}
            >
                <option value="" hidden selected>
                    Select
                </option>
                { accountType === "admin" ? (
                    <option value="view" className="color-options">
                        View
                    </option>
                    ): null
                }
                { accountType === "admin" ? (
                    <option value="delete" className="color-options">
                        Delete
                    </option>
                    ): null
                }
            </Form.Select>
        );
    }

    function ViewBtn(row) {
        return (
            <button
                name="action"
                className="btn btn-sm view-btn-table"
                id={row.id}
                onClick={() => handleView(row)}
                // value="payment-pi"
            >
                View
            </button>
        );
    }
    function handleView(row) {
        console.log(row)
        {
            window.open('/dailywastage/view/' + row.id ,'_blank')
        };
    }

    async function fetchAllItems() {
        const response = await getAllItems();

        if (response.response.data) {
            var data = response.response.data.map((item) => {
                var info = item;
                info.label = item.name
                info.value = item.id
                return info;
            });
            setItems([{label: "All Items", value:""}, ...data]);
        } else {
        }
    }

    async function fetchBranches() {
        setShowLoader(true);

        const response = await getAllBranches();
        if (response.error) {
        } else {
            var allBranches = response.data.data.data.map((data) => {
                var branch = data;
                return branch;
            });
            setBranches(allBranches);
        }
        setShowLoader(false);
    }

    async function fetchData() {
        setShowLoader(true);
        setWastage([])
        setTotalQuantity(0)
        var array = []

        const response = await searchWastage(filterConfig);
        console.log(response)

        if (response.error) {
        } else {

            var allBills = response.data.data.map((bill) => {
                console.log(bill)
                var info = bill;
                info.wastage_date = Moment(bill.wastage_date).format("MM-DD-YYYY")
                info.wastage_items.map((data) => {
                    var details = data;
                    data.branch_name = bill.branch_name
                    data.wastage_date = bill.wastage_date
                    array.push(data)
                })
                return info;
            });
            console.log(allBills)
            setWastage(allBills)
            setWastageItems(array)

            var qty = response.data.summary?.total_quantity? response.data.summary.total_quantity : "0";
            setTotalQuantity(qty);
        }
        setShowLoader(false);
    }

    async function handleDeleteWastage() {
        const response = await deleteWastage(selectedRow.id);
        if (response.data) {
            toast.success("Wastage Deleted Successfully!", {
                style: toastStyle(),
            });
            setTimeout(() => refreshPage(), 1000);
        } else {
            toast.error("Error Deleting Wastage", {
                style: toastStyle(),
            });
        }
    }

    React.useEffect(() => {
        fetchAllItems();
    }, []);

    React.useEffect(() => {
        fetchData();
    }, [filterConfig]);

    return (
        <div>
            <div className="page">
                <Navbar
                    onCollapse={(inactive) => {
                        setInactive(inactive);
                    }}
                    active={"DS REPORTS"}
                />
            </div>

            <div
                className={`manager-container ${
                    inactive ? "inactive" : "active"
                }`}
            >
                {/* headers */}
                <Row className="mb-3">
                    <Col xs={6}>
                        <h1 className="page-title"> WASTAGE REPORTS </h1>
                    </Col>
                    <Col className="d-flex justify-content-end">
                        <input
                            type="text"
                            name="branch_name"
                            placeholder="Search branch name"
                            className="search-bar"
                            onChange={handleOnSearch}
                        ></input>
                    </Col>
                </Row>

                <Row>
                    <Col className="d-flex justify-content-end mb-3">
                        <div className="justify-content-center align-items-center ">
                            <CSVLink
                                className="button-primary px-3 py-3 justify-content-center align-items-center download-csv"
                                data={wastageItems}
                                headers={excelHeaders}
                                target="_blank"
                                filename={`${getTodayDateISO()} Wastage Reports`}
                            >
                                <span className="me-2">
                                    <img
                                        width={20}
                                        height={20}
                                        src={downloadIcon}
                                    ></img>
                                </span>
                                Download Excel
                            </CSVLink>
                        </div>
                    </Col>
                </Row>

                <div className="tab-content">
                    {/* filters */}
                    <div className="my-2 px-2 PO-filters d-flex">
                        <span className="me-4 align-middle mt-2 ps-label">
                            Filter By:
                        </span>
                        <Select
                            className="dropsearch-filter px-0 py-0 me-2"
                            classNamePrefix="react-select"
                            placeholder="Select Item"
                            styles={{
                                control: (baseStyles, state) => ({
                                  ...baseStyles,
                                  backgroundColor: state.isSelected ? 'white' : '#5ac8e1',
                                  borderRadius: "7px",
                                  border: "0px",
                                  minHeight: "20px",
                                  maxHeight: "35px",
                                }),
                                input: (baseStyles, state) => ({
                                    ...baseStyles,
                                    color: state.isSelected? "white": "white",
                                    
                                  }),
                                  dropdownIndicator: (baseStyles, state) => ({
                                    ...baseStyles,
                                    color: "white"
                                    
                                  }),
                                  singleValue: (baseStyles, state) => ({
                                    ...baseStyles,
                                    color: "white"
                                    
                                  }),
                                  placeholder: (baseStyles, state) => ({
                                    ...baseStyles,
                                    color: "white"
                                    
                                  }),
                                  
                              }}
                            // value={branch}
                            options={items}
                            onChange={(e) => { setFilterConfig((prev) => {
                                    return { ...prev, "item_id": e.value };
                                });}}
                        />

                        <span className="me-4 align-middle mt-2 ps-label">
                            From:
                        </span>
                        <DatePicker
                            selected={filterConfig.date_from}
                            name="date_from"
                            placeholderText={today}
                            onChange={(date) => {
                                setFilterConfig((prev) => {
                                    return { ...prev, date_from: date };
                                });
                            }}
                            fixedHeight
                            className="PI-date-btn me-3 form-control"
                            showYearDropdown
                            dateFormatCalendar="MMMM"
                            yearDropdownItemNumber={20}
                            scrollableYearDropdown
                        />

                        <span className="me-4 align-middle mt-2 ps-label">
                            To:
                        </span>
                        <DatePicker
                            selected={filterConfig.date_to}
                            name="date_to"
                            placeholderText={today}
                            onChange={(date) => {
                                setFilterConfig((prev) => {
                                    return { ...prev, date_to: date };
                                });
                            }}
                            fixedHeight
                            className="PI-date-btn me-3 form-control"
                            showYearDropdown
                            dateFormatCalendar="MMMM"
                            yearDropdownItemNumber={20}
                            scrollableYearDropdown
                        />
                    </div>

                    <div className="my-2 px-2 PO-filters d-flex justify-content-center">
                        <span className="me-4 ml-4 align-middle mt-2 ps-label">
                            Total Quantity: {numberFormat(totalQuantity)}
                        </span>
                    </div>

                    <div className="below">
                        {/* table */}
                        <Table
                            tableHeaders={[
                                // "-",
                                "DATE",
                                "BRANCH",
                                "ITEM",
                                "QUANTITY",
                                "UNIT",
                                "REASON",
                                "WASTAGE BY",
                                "REMARKS",
                            ]}
                            headerSelector={[
                                // "-",
                                "wastage_date",
                                "branch_name",
                                "name",
                                "qty",
                                "unit",
                                "reason",
                                "wasted_by_name",
                                "remarks",
                            ]}
                            tableData={wastageItems}
                            ActionBtn={(row) => ActionBtn(row)}
                            // ViewBtn={(row) => ViewBtn(row)}
                            showLoader={showLoader}
                        />
                    </div>
                    <div className="mb-2" />
                </div>
            </div>

            {/* modals */}
            <Delete
                show={showDeleteModal}
                onHide={handleCloseDeleteModal}
                text="wastage"
                onDelete={handleDeleteWastage}
            />
        </div>
    );
}
