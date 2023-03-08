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
import { getAllPurchasedItemsSummary, getAllPurchasedItemsSummaryPotato } from "../../../Helpers/apiCalls/Reports/BillingFeeSales";
import { getAllItems } from "../../../Helpers/apiCalls/itemsApi";
import { getAllItemsPotato } from "../../../Helpers/apiCalls/PotatoCorner/Inventory/ItemApi";

export default function PurchasedItemsSummary() {
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
    const [totalAmount, setTotalAmount] = useState([]);
    const [items, setItems] = useState([]);
    const excelHeaders = [
        { label: "Total Quantity", key: "total_quantity" },
        { label: "Total Amount", key: "total_amount" },
        { label: "Receive Date", key: "receive_date" },
        { label: "Purchase Date", key: "purchase_date" },
        { label: "Invoice/DR No.", key: "dr_no" },
        { label: "Item Name", key: "item_name" },
        { label: "Supplier/Vendor", key: "supplier_name" },
        { label: "Quantity", key: "quantity" },
        { label: "Unit", key: "unit" },
        { label: "Price", key: "price" },
        { label: "Amount", key: "amount" },
    ];
    const [itemOptions, setItemOptions] = useState([]);

    // SEARCH USER
    function handleOnSearch(e) {
        const { name, value } = e.target;
        if(name === "item_id") {
            var id = value.split("-")[0]
            var shop = value.split("-")[1]
            setFilterConfig((prev) => {
                return { 
                    ...prev, 
                    item_id: id,
                    type: shop
                };
            });
        }
        else {
            setFilterConfig((prev) => {
                return { ...prev, [name]: value };
            });
        }
        
    }

    function handleSelectChange(e, row) {

        if (e.target.value === "mark_as_done") {
            // handleShowApproveModal();
        } else if (e.target.value === "void") {
            // handleShowDeleteModal();
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
            </Form.Select>
        );
    }

    function PrintBtn(row) {
        console.log(row)
        return (
            <button
                name="action"
                className="btn btn-sm view-btn-table"
                id={row.po_id}
                onClick={() => handlePrint(row.po_id, row.type)}
            >
                View
            </button>
        );
    }
    function handlePrint(id, type) {
        {
            window.open('purchaseorders/review/1/' + type + "/" + type + "-" + id ,'_blank')
        };
    }

    function handleItemChange(e){
        const toFilter = {target: {name: "item_id", value: e.value}};
        handleOnSearch(toFilter);
    }

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

        var array1 = []
        var array2 = []
        var array3 = []
        var total = {
            total_amount: "",
            total_quantity: "",
        }

        if(filterConfig.type === "mango") {
            const response = await getAllPurchasedItemsSummary(filterConfig);
            if (response.error) {
            } else {

                var allItems = response.data.purchase_items.map((item) => {
                    var info = item;
                    info.type = "mango";
                    info.po_id = item.po_id;
                    info.receive_date = Moment(item.receive_date).format("MM-DD-YYYY");
                    info.purchase_date = Moment(item.purchase_date).format("MM-DD-YYYY");
                    info.quantity = numberFormat(item.quantity)
                    info.price = numberFormat(item.price)
                    info.amount = numberFormat(item.total_amount)
                    info.total_amount = ""
                    return info;
                });

                var quantity = response.data.summary? response.data.summary.total_quantity : "0";
                var amount = response.data.summary? response.data.summary.total_amount : "0";
                total["total_amount"] = numberFormat(amount);
                total["total_quantity"] = numberFormat(quantity);
                setTotalQuantity(quantity);
                setTotalAmount(amount);

                setSales(allItems.sort((a, b) =>
                    new Date(...a.purchase_date?.split('/').reverse()) - new Date(...b.purchase_date?.split('/').reverse())
                ).reverse())
                setSalesCsv([total, ...allItems.sort((a, b) =>
                    new Date(...a.purchase_date?.split('/').reverse()) - new Date(...b.purchase_date?.split('/').reverse())
                ).reverse()])
        }
        } else if(filterConfig.type === "potato") {
            const response = await getAllPurchasedItemsSummaryPotato(filterConfig);

            if (response.error) {
            } else {

                var allItems = response.data.purchase_items.map((item) => {
                    var info = item;
                    info.type = "potato";
                    info.po_id = item.po_id;
                    info.receive_date = Moment(item.receive_date).format("MM-DD-YYYY");
                    info.purchase_date = Moment(item.purchase_date).format("MM-DD-YYYY");
                    info.quantity = numberFormat(item.quantity)
                    info.price = numberFormat(item.price)
                    info.amount = numberFormat(item.total_amount)
                    info.total_amount = ""
                    return info;
                });

                var quantity = response.data.summary? response.data.summary.total_quantity : "0";
                var amount = response.data.summary? response.data.summary.total_amount : "0";
                total["total_amount"] = numberFormat(amount);
                total["total_quantity"] = numberFormat(quantity);
                setTotalQuantity(quantity);
                setTotalAmount(amount);

                setSales(allItems.sort((a, b) =>
                    new Date(...a.purchase_date?.split('/').reverse()) - new Date(...b.purchase_date?.split('/').reverse())
                ).reverse())
                setSalesCsv([total, ...allItems.sort((a, b) =>
                    new Date(...a.purchase_date?.split('/').reverse()) - new Date(...b.purchase_date?.split('/').reverse())
                ).reverse()])
            }
        } else {
            const response = await getAllPurchasedItemsSummary(filterConfig);

            if (response.error) {
            } else {

                var allItems = response.data.purchase_items.map((item) => {
                    var info = item;
                    console.log(item)

                    info.type = "mango";
                    info.po_id = item.po_id;
                    info.receive_date = Moment(item.receive_date).format("MM-DD-YYYY");
                    info.purchase_date = Moment(item.purchase_date).format("MM-DD-YYYY");
                    info.quantity = numberFormat(item.quantity)
                    info.price = numberFormat(item.price)
                    info.amount = numberFormat(item.total_amount)
                    info.total_amount = ""
                    return info;
                });

                var quantity = response.data.summary? response.data.summary.total_quantity : "0";
                var amount = response.data.summary? response.data.summary.total_amount : "0";
                total["total_amount"] = numberFormat(amount);
                total["total_quantity"] = numberFormat(quantity);
                setTotalQuantity(quantity);
                setTotalAmount(amount);

                array1 = array1.concat(allItems)
            }

            const response2 = await getAllPurchasedItemsSummaryPotato(filterConfig);

            if (response2.error) {
            } else {

                var allItemsPotato = response2.data.purchase_items.map((item) => {
                    var info = item;

                    info.type = "potato";
                    info.po_id = item.po_id;
                    info.receive_date = Moment(item.receive_date).format("MM-DD-YYYY");
                    info.purchase_date = Moment(item.purchase_date).format("MM-DD-YYYY");
                    info.quantity = numberFormat(item.quantity)
                    info.price = numberFormat(item.price)
                    info.amount = numberFormat(item.total_amount)
                    info.total_amount = ""
                    return info;
                });

                var quantity = response2.data.summary? response2.data.summary.total_quantity + quantity : "0";
                var amount = response2.data.summary? response2.data.summary.total_amount + amount : "0";
                total["total_amount"] = numberFormat(amount);
                total["total_quantity"] = numberFormat(quantity);
                setTotalQuantity(quantity);
                setTotalAmount(amount);

                array2 = array2.concat(allItemsPotato)
            }
            array3 = array1.concat(array2)
            setSales(array3.sort((a, b) =>
                new Date(...a.purchase_date?.split('/').reverse()) - new Date(...b.purchase_date?.split('/').reverse())
            ).reverse())
            setSalesCsv([total, ...array3.sort((a, b) =>
                new Date(...a.purchase_date?.split('/').reverse()) - new Date(...b.purchase_date?.split('/').reverse())
            ).reverse()])

        }
        
        setShowLoader(false);
    }
    console.log(sales)

    async function fetchAllItems() {
        const response = await getAllItems();
        const response2 = await getAllItemsPotato();

        var array1 = []
        var array2 = []
        var array3 = []

        if (response.response.data && response2.response.data) {
            var data = response.response.data.map((item) => {
                var info = item;
                info.id = item.id + "-mango"
                return info;
            });
            array1 = array1.concat(data)

            var data2 = response2.response.data.map((item) => {
                var info = item;
                info.id = item.id + "-potato"
                return info;
            });
            array2 = array2.concat(data2)
        } else {
        }
        array3 = array1.concat(array2)
        setItems(array3);
    }

    React.useEffect(() => {
        fetchFranchisee();
        fetchAllItems();
    }, []);

    React.useEffect(() => {
        fetchData();
    }, [filterConfig]);

    React.useEffect(()=>{
        setItemOptions(items.map((_item)=>{
            var retval = {label: _item.name, value:_item.id}
            return retval;
        }))
        setItemOptions((itemOptions)=>{
            var newBranches = [{label: "All Items", value:""}, ...itemOptions];
            // newBranches.push()
            return newBranches;
        });
        // setBranches((branches)=>{
    },[items])

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
                <Row className="mb-1">
                    <Col >
                        <h1 className="page-title"> SUMMARY OF PURCHASED ITEMS </h1>
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
                                filename={`${getTodayDateISO()} SupplierAndVendorPayables`}
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
                            options={itemOptions}
                            onChange={handleItemChange}
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

                        <Form.Select
                            name="type"
                            className="date-filter me-3"
                            onChange={(e) => handleOnSearch(e)}
                            value={filterConfig.type}
                        >
                            <option value="" hidden selected>
                                Select Type
                            </option>
                            <option value="">All</option>
                            <option value="mango">Mango Magic</option>
                            <option value="potato">Potato Corner</option>
                        </Form.Select>

                        <span className="me-4 align-middle mt-2 ps-label">
                            From:
                        </span>
                        <DatePicker
                            selected={filterConfig.purchase_date_from}
                            name="purchase_date_from"
                            placeholderText={"Select Date"}
                            onChange={(date) => {
                                setFilterConfig((prev) => {
                                    return { ...prev, purchase_date_from: date };
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
                            selected={filterConfig.purchase_date_to}
                            name="purchase_date_to"
                            placeholderText={"Select Date"}
                            onChange={(date) => {
                                setFilterConfig((prev) => {
                                    return { ...prev, purchase_date_to: date };
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
                            Quantity: {numberFormat(totalQuantity)}
                        </span>

                        <span className="me-4 ml-8 align-middle mt-2 ps-label">
                            Amount: {numberFormat(totalAmount)}
                        </span>

                    </div>

                    <div className="below">
                        {/* table */}
                        <Table
                            tableHeaders={[
                                "-",
                                "RECEIVED DATE",
                                "PURCHASED DATE",
                                "INVOICE/DR NO.",
                                "ITEM NAME",
                                "SUPPLIER/VENDOR",
                                "QTY",
                                "UNIT",
                                "PRICE",
                                "AMOUNT",
                            ]}
                            headerSelector={[
                                "-",
                                "receive_date",
                                "purchase_date",
                                "dr_no",
                                "item_name",
                                "supplier_name",
                                "quantity",
                                "unit",
                                "price",
                                "amount",
                            ]}
                            tableData={sales}
                            ActionBtn={(row) => ActionBtn(row, "open")}
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
