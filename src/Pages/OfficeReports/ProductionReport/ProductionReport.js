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
import { CSVLink, CSVDownload } from "react-csv";
import downloadIcon from "../../../Assets/Images/download_icon.png";

import { getAllFranchisee } from "../../../Helpers/apiCalls/franchiseeApi";
import { searchProductionReport, searchProductionReportPotato } from "../../../Helpers/apiCalls/Reports/ProductionReportApi";
import { getAllBranches } from "../../../Helpers/apiCalls/Manage/Branches";
import { getAllItems } from "../../../Helpers/apiCalls/itemsApi";


export default function ProductionReport() {
    let navigate = useNavigate();
    var dateToday = getTodayDate();
    const accountType = getType();
    const [inactive, setInactive] = useState(true);
    const [filterConfig, setFilterConfig] = useState({})
    const [branches, setBranches] = useState([]);
    const [showLoader, setShowLoader] = useState(false);
    const [expenses, setExpenses] = useState([]);
    const [expensesCsv, setExpensesCsv] = useState([]);
    const [totalQuantity, setTotalQuantity] = useState(0);
    const [averagePrice, setAveragePrice] = useState([]);
    const [totalAmount, setTotalAmount] = useState([]);
    const [items, setItems] = useState([]);

     /* delete modal handler */
     const [showDeleteModal, setShowDeleteModal] = useState(false);
     const handleShowDeleteModal = () => setShowDeleteModal(true);
     const handleCloseDeleteModal = () => setShowDeleteModal(false); 
     const [selectedRow, setSelectedRow] = useState([]);
     const excelHeaders = [
        { label: "Total Quantity", key: "total_quantity" },
        { label: "Item Name", key: "item_name" },
        { label: "Unit", key: "unit" },
        { label: "Quantity", key: "total_qty" },
        { label: "Average Yield", key: "avg_yield" },
        { label: "Raw Materials", key: "raw_materials" },
    ];

    const dummy = [
        {
            id: "1",
            branch_name: "SM CITY CEBU",
            date: "December 2022",
            amount: "1000",
            added_by: "JOSE RIZAL",
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
                window.open('/dailyexpenses/view/' + row.id ,'_blank')
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
                    <option value="delete" className="color-red">
                        Delete
                    </option>
                    ): null
                }
            </Form.Select>
        );
    }

    function materialsList(row) {
        console.log(row)
        var split = row.raw_materials.split("/").slice(0, -1)
        
         return (
            <Row>{
                split.map((data) => {
                    return (
                        <>
                            <label>{data}</label><br/>
                        </>
                    );
                })}
            </Row>
        )
    }

    function ViewBtn(row) {
        return (
            <button
                name="action"
                className="btn btn-sm view-btn-table"
                id={row.id}
                onClick={() => handlePrint(row)}
            >
                View
            </button>
        );
    }
    function handlePrint(row) {
        {
            window.open('/transferhistory/view/' + row.id ,'_blank')
        };
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

    async function fetchData() {
        setShowLoader(true);
        setExpenses([])
        setTotalQuantity(0);
        var allData = [];
        var total = {
            total_quantity: "",
        }

        const response = await searchProductionReport(filterConfig);
        console.log(response)
        if (response.error) {
        } else {
            var allBills = response.data.data.map((bill) => {
                var info = bill;
                let raw_materials = "";
                bill.raw_materials?.map((data) => {
                    raw_materials +=
                        numberFormat(data.qty) +
                        " " +
                        data.unit +
                        " - " +
                        data.name + "/" ;
                });
                info.raw_materials = raw_materials;
                info.avg_yield = numberFormat(bill.avg_yield);
                info.expense_date = Moment(bill.expense_date).format("MM-DD-YYYY");
                allData.push(info);
                return info;
            });

            var qty = response.data.all_items_total_qty? response.data.all_items_total_qty : "0";
            total["total_quantity"] = numberFormat(qty);
            setTotalQuantity(qty);
        }
        
        // const response2 = await searchProductionReportPotato(filterConfig);
        // console.log(response2)
        // if (response2.error) {
        // } else {
        //     var allBills = response2.data.data.map((bill) => {
        //         var info = bill;
        //         let raw_materials = "";
        //         bill.raw_materials?.map((data) => {
        //             raw_materials +=
        //                 numberFormat(data.qty) +
        //                 " " +
        //                 data.unit +
        //                 " - " +
        //                 data.name + "/" ;
        //         });
        //         info.raw_materials = raw_materials;
        //         info.avg_yield = numberFormat(bill.avg_yield);
        //         info.expense_date = Moment(bill.expense_date).format("MM-DD-YYYY");
        //         allData.push(info);
        //         return info;
        //     });

        //     var qty = response2.data.all_items_total_qty? response2.data.all_items_total_qty + totalQuantity : "0";
        //     total["total_quantity"] = numberFormat(qty);
        //     setTotalQuantity(qty);
        // }
        setExpenses(allData)
        setExpensesCsv([total, ...allData])
        setShowLoader(false);
    }

    // async function handleDeleteExpense() {
    //     const response = await deleteProductionReport(selectedRow.id);
    //     if (response.data) {
    //         toast.success("Production Report Deleted Successfully!", {
    //             style: toastStyle(),
    //         });
    //         setTimeout(() => refreshPage(), 1000);
    //     } else {
    //         toast.error("Error Deleting Production Report", {
    //             style: toastStyle(),
    //         });
    //     }
    // }

    React.useEffect(() => {
        fetchBranches();
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
                    active={"OFFICE REPORTS"}
                />
            </div>

            <div
                className={`manager-container ${
                    inactive ? "inactive" : "active"
                }`}
            >
                {/* headers */}
                <Row className="mb-2">
                    <Col xs={6}>
                        <h1 className="page-title"> PRODUCTION REPORT </h1>
                    </Col>
                </Row>

                <Row>
                    <Col className="d-flex justify-content-end mb-3">
                        <div className="justify-content-center align-items-center ">
                            <CSVLink
                                className="button-primary px-3 py-3 justify-content-center align-items-center download-csv"
                                data={expensesCsv}
                                headers={excelHeaders}
                                target="_blank"
                                filename={`${getTodayDateISO()} 'ProductionReport'`}
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
                                  backgroundColor: state.isSelected ? 'white' : '#169422',
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
                        {/* <Form.Select
                            name="item_id"
                            className="date-filter me-2"
                            defaultValue={filterConfig.item_id}
                            onChange={(e) => handleOnSearch(e)}
                        >
                            <option value="" selected>
                                All Items
                            </option>
                            {items.length > 0 ? (
                                items.map((data) => {
                                    return (
                                        <option value={data.id}>
                                            {data.name}
                                        </option>
                                    );
                                })
                            ) : (
                                <option value="" disabled>
                                    (No item found)
                                </option>
                            )}
                        </Form.Select> */}

                        <span className="me-4 align-middle mt-2 ps-label">
                            From:
                        </span>
                        <DatePicker
                            selected={filterConfig.date_from}
                            name="date_from"
                            placeholderText={"Select Date"}
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
                            placeholderText={"Select Date"}
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
                                "ITEM NAME",
                                "UNIT",
                                "QTY",
                                "AVERAGE YIELD",
                                "RAW MATERIALS",
                            ]}
                            headerSelector={[
                                "item_name",
                                "unit",
                                "total_qty",
                                "avg_yield",
                                // "raw_materials",
                            ]}
                            tableData={expenses}
                            materialsList={(row) => materialsList(row)}
                            showLoader={showLoader}
                        />
                    </div>
                    <div className="mb-2" />
                </div>
            </div>

            {/* modals */}
            {/* <Delete
                show={showDeleteModal}
                onHide={handleCloseDeleteModal}
                text="expeses"
                onDelete={handleDeleteExpense}
            /> */}
        </div>
    );
}
