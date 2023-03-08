import React, { useState, useEffect } from "react";
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
import { getAllSalesByItem } from "../../../Helpers/apiCalls/Reports/BillingFeeSales";
import { getAllItems } from "../../../Helpers/apiCalls/itemsApi";
import { getAllItemPrices } from "../../../Helpers/apiCalls/Manage/ItemPrice";

export default function SalesByItem() {
    let navigate = useNavigate();
    var dateToday = getTodayDate();
    const accountType = getType();
    const [inactive, setInactive] = useState(true);
    const [filterConfig, setFilterConfig] = useState({})
    const [franchisees, setFranchisees] = useState([]);
    const [showLoader, setShowLoader] = useState(false);
    const [sales, setSales] = useState([]);
    const [salesCsv, setSalesCsv] = useState([]);
    const [totalQuantity, setTotalQuantity] = useState([]);
    const [averagePrice, setAveragePrice] = useState([]);
    const [totalAmount, setTotalAmount] = useState([]);
    const [items, setItems] = useState([]);

    const excelHeaders = [
        { label: "Total Quantity", key: "total_quantity" },
        { label: "Total Amount", key: "total_amount" },
        { label: "Sales Date", key: "sales_date" },
        { label: "Invoice No.", key: "invoice_no" },
        { label: "Franchisee Name", key: "franchisee_name" },
        { label: "Branch Name", key: "branch_name" },
        { label: "Item Name", key: "item_name" },
        { label: "Quantity", key: "quantity" },
        { label: "Unit", key: "unit" },
        { label: "Price", key: "price" },
        { label: "Amount", key: "amount" },
    ];

    // SEARCH USER
    function handleOnSearch(e) {
        const { name, value } = e.target;
        setFilterConfig((prev) => {
            return { ...prev, [name]: value };
        });
    }

    function PrintBtn(row) {
        return (
            <button
                name="action"
                className="btn btn-sm view-btn-table"
                id={row.id}
                onClick={() => handlePrint(row.id, row.franchisee_id, row.payable_id, row.type)}
            >
                View
            </button>
        );
    }
    function handlePrint(id, type, shop) {

    }

    async function fetchAllItems() {
        setItems([])
        const response = await getAllItemPrices();
        console.log(response)
        if (response.data) {
            var sorted = response.data.data.sort((a, b) =>
                a.item_name > b.item_name ? 1 : b.item_name > a.item_name ? -1 : 0
            );
            var data = sorted.map((item) => {
                var info = item
                info.label = item.item_name
                info.value = item.item_id
                return info
            });
            setItems([{name: "item_id", label: "All Items", value:""}, ...data]);
        } else {
            setItems([])
        }
    }
    console.log(items)

    async function fetchFranchisee() {
        setShowLoader(true);

        const response = await getAllFranchisee();
        if (response.error) {
        } else {
            setFranchisees(response.data.data);
            var allFranchisee = response.data.data.map((data) => {
                var franchise = data;
                franchise.franchise_name = data.name;
                franchise.franchise = data.name;
                franchise.contract = "0";
                franchise.sale = "0";
                franchise.sale_billing = "0";
                franchise.total = "0";
                return franchise;
            });
            setFranchisees(allFranchisee);
        }
        setShowLoader(false);
    }

    async function fetchData() {
        setShowLoader(true);
        setSales([])
        setSalesCsv([])
        var total = {
            total_amount: "",
            total_quantity: "",
        }

        const response = await getAllSalesByItem(filterConfig);

        if (response.error) {
        } else {
            var sorted = response.data.summary.sort((a, b) =>
                a.item_name > b.item_name ? 1 : b.item_name > a.item_name ? -1 : 0
            );
            var allBills = sorted.map((bill) => {
                var info = bill;
                info.sales_date = Moment(bill.sales_date).format("MM-DD-YYYY");
                info.invoice_no = bill.invoice_no;
                info.franchisee_name = bill.franchisee_name;
                info.branch_name = bill.buyer_branch_name;
                info.item_name = bill.item_name;
                info.quantity = bill.total_quantity;
                info.total_quantity = "";
                info.unit = bill.inventory_unit;
                info.price = numberFormat(bill.average_price);
                info.amount = numberFormat(bill.total_subtotal);
                return info;
            });

            var amount = response.data.general_summary? response.data.general_summary.total_amount : "0";
            var quantity = response.data.general_summary? response.data.general_summary.total_quantity : "0";
            var average = response.data.general_summary? response.data.general_summary.average_price : "0";
            total["total_amount"] = numberFormat(amount);
            total["total_quantity"] = numberFormat(quantity);
            setTotalQuantity(quantity);
            setAveragePrice(average);
            setTotalAmount(amount);

            setSales(allBills)
            setSalesCsv([total, ...allBills])
        }
        setShowLoader(false);
    }

    // console.log(sales);
    // console.log(salesCsv);


    React.useEffect(() => {
        fetchFranchisee();
        fetchAllItems();
    }, []);

    const [branchOptions, setBranchOptions] = useState ([]);

    React.useEffect(()=>{
        // console.log("franchisees", franchisees);
        const tmp = franchisees.filter((v, i) => {
            return franchisees.map((val) => val.name).indexOf(v.name) == i;
        });
        const t = tmp.map((fr)=>{
            return {label: fr.name, value:fr.name};
        });
        t.push({label: "All Franchisees", value:""})
        setBranchOptions(t.reverse());
    }, [franchisees]);

    function handleBranchChange(e){
        // setBranch(e.name);
        const toFilter = {target: {name: "franchisee_name", value: e.value}};
        handleOnSearch(toFilter);
    }
    const [itemOptions, setItemOptions] = useState([]);

    function handleItemChange(e){
        const toFilter = {target: {name: "item_id", value: e.value}};
        handleOnSearch(toFilter);
    }

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
                    active={"FRANCHISE REPORTS"}
                />
            </div>

            <div
                className={`manager-container ${
                    inactive ? "inactive" : "active"
                }`}
            >
                {/* headers */}
                <Row className="mb-1">
                    <Col xs={6}>
                        <h1 className="page-title"> SALES BY ITEM </h1>
                    </Col>
                </Row>

                <Row>
                    <Col className="d-flex justify-content-end mb-3">
                        <div className="justify-content-center align-items-center ">
                            <CSVLink
                                className="button-primary px-3 py-3 justify-content-center align-items-center download-csv"
                                data={salesCsv}
                                headers={excelHeaders}
                                target="_blank"
                                filename={`${getTodayDateISO()} 'SalesByItem'`}
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
                            // defaultValue={{label: "All Items", value:""}}
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
                            onChange={handleItemChange}
                        />
                        <Select
                            className="dropsearch-filter px-0 py-0 me-2"
                            classNamePrefix="react-select"
                            placeholder="Select Franchisee"
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
                            options={branchOptions}
                            onChange={handleBranchChange}
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

                        {/* <Form.Select
                            name="franchisee_name"
                            className="date-filter me-2"
                            onChange={(e) => handleOnSearch(e)}
                        >
                            <option value="" selected>
                                All Franchisee
                            </option>
                            {franchisees.length > 0 ? (
                                franchisees.filter((v, i) => {
                                    return franchisees.map((val) => val.name).indexOf(v.name) == i;
                                })
                                .map((franchisee) => {
                                    return (
                                        <option
                                            value={franchisee.name}
                                        >
                                            {franchisee.name}
                                        </option>
                                    );
                                })
                            ) : (
                                <option value="" disabled>
                                    (No franchisee found)
                                </option>
                            )}
                        </Form.Select> */}

                        <span className="me-4 align-middle mt-2 ps-label">
                            From:
                        </span>
                        <DatePicker
                            selected={filterConfig.sales_date_from}
                            name="sales_date_from"
                            placeholderText={"Select Date"}
                            onChange={(date) => {
                                setFilterConfig((prev) => {
                                    return { ...prev, sales_date_from: date };
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
                            selected={filterConfig.sales_date_to}
                            name="sales_date_to"
                            placeholderText={"Select Date"}
                            onChange={(date) => {
                                setFilterConfig((prev) => {
                                    return { ...prev, sales_date_to: date };
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

                        {/* <span className="me-4 ml-8 align-middle mt-2 ps-label">
                            Average Price: {numberFormat(averagePrice)}
                        </span> */}

                        <span className="me-4 ml-4 align-middle mt-2 ps-label">
                            Total Amount: {numberFormat(totalAmount)}
                        </span>

                    </div>

                    <div className="below">
                        {/* table */}
                        <Table
                            tableHeaders={[
                                "SALES DATE",
                                "INVOICE NO.",
                                "FRANCHISEE",
                                "BRANCH",
                                "ITEM NAME",
                                "QUANTITY",
                                "UNIT",
                                "PRICE",
                                "AMOUNT",
                            ]}
                            headerSelector={[
                                "sales_date",
                                "franchisee_sale_id",
                                "franchisee_name",
                                "branch_name",
                                "item_name",
                                "quantity",
                                "unit",
                                "price",
                                "amount",
                            ]}
                            tableData={sales}
                            ViewBtn={(row) => PrintBtn(row)}
                            showLoader={showLoader}
                        />
                    </div>
                    <div className="mb-2" />
                </div>
            </div>
        </div>
    );
}
