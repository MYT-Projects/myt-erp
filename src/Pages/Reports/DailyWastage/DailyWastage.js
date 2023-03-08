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
    TokenExpiry
} from "../../../Helpers/Utils/Common";
import DatePicker from "react-datepicker";
import Moment from "moment";

import { getAllFranchisee } from "../../../Helpers/apiCalls/franchiseeApi";
import { searchWastage, deleteWastage } from "../../../Helpers/apiCalls/Reports/DailyWastageApi";
import { getAllBranches } from "../../../Helpers/apiCalls/Manage/Branches";

export default function SalesByItem() {
    let navigate = useNavigate();
    var dateToday = getTodayDate();
    const accountType = getType();
    const [inactive, setInactive] = useState(true);
    const [filterConfig, setFilterConfig] = useState({})
    const [branches, setBranches] = useState([]);
    const [showLoader, setShowLoader] = useState(false);
    const [wastage, setWastage] = useState([]);
    const [totalQuantity, setTotalQuantity] = useState([]);
    const [averagePrice, setAveragePrice] = useState([]);
    const [totalAmount, setTotalAmount] = useState([]);
    const [selectedRow, setSelectedRow] = useState([]);

    /* delete modal handler */
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const handleShowDeleteModal = () => setShowDeleteModal(true);
    const handleCloseDeleteModal = () => setShowDeleteModal(false);
    const today = Moment().format("MM/DD/YYYY");

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

    async function fetchBranches() {
        setShowLoader(true);

        const response = await getAllBranches();
        if (response.error) {
        } else {
            var allBranches = response.data.data.data.map((data) => {
                var branch = data;
                branch.label = data.name
                branch.value = data.id
                return branch;
            });
            setBranches([{label: "All Branches", value:""}, ...allBranches]);
        }
        setShowLoader(false);
    }

    async function fetchData() {
        setShowLoader(true);
        setWastage([])

        const response = await searchWastage(filterConfig);
        console.log(response)

        if (response.error) {
        } else {

            var allBills = response.data.data.map((bill) => {
                var info = bill;
                info.wastage_date = Moment(bill.wastage_date).format("MM-DD-YYYY")
                return info;
            });
            console.log(allBills)
            setWastage(allBills)
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
        fetchBranches();
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
                <Row className="mb-4">
                    <Col xs={6}>
                        <h1 className="page-title"> DAILY WASTAGE </h1>
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

                <div className="tab-content">
                    {/* filters */}
                    <div className="my-2 px-2 PO-filters d-flex">
                        <span className="me-4 align-middle mt-2 ps-label">
                            Filter By:
                        </span>
                        <Select
                            className="dropsearch-filter px-0 py-0 me-2"
                            classNamePrefix="react-select"
                            placeholder="Select Branch"
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
                            options={branches}
                            onChange={(e) => { setFilterConfig((prev) => {
                                    return { ...prev, "branch_id": e.value };
                                });}}
                        />
                        {/* <Form.Select
                            name="branch_id"
                            className="date-filter me-2"
                            onChange={(e) => handleOnSearch(e)}
                        >
                            <option value="" selected>
                                All Branches
                            </option>
                            {branches.length > 0 ? (
                                branches.filter((v, i) => {
                                    return (
                                        branches.map((val) => val.id).indexOf(v.id) == i
                                    );
                                })
                                .map((branch) => {
                                    return (
                                        <option
                                            value={branch.id}
                                        >
                                            {branch.name}
                                        </option>
                                    );
                                })
                            ) : (
                                <option value="" disabled>
                                    (No branch found)
                                </option>
                            )}
                        </Form.Select> */}

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
                    </div>

                    <div className="below">
                        {/* table */}
                        <Table
                            tableHeaders={[
                                "-",
                                "DATE",
                                "BRANCH",
                                // "REMARKS",
                                "ACTIONS",
                            ]}
                            headerSelector={[
                                "-",
                                "wastage_date",
                                "branch_name",
                                // "remarks",
                            ]}
                            tableData={wastage}
                            ActionBtn={(row) => ActionBtn(row)}
                            ViewBtn={(row) => ViewBtn(row)}
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
