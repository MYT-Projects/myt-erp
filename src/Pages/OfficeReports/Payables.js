import React, { useState, useEffect } from "react";
import { Col, Form, Row, Tab, Tabs } from "react-bootstrap";
import toast from "react-hot-toast";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import Delete from "../../Components/Modals/DeleteModal";
import Navbar from "../../Components/Navbar/Navbar";
import Table from "../../Components/TableTemplate/Table";
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
    getTodayDateISO,
} from "../../Helpers/Utils/Common";
import DatePicker from "react-datepicker";
import Moment from "moment";
import { CSVLink, CSVDownload } from "react-csv";
import downloadIcon from "../../Assets/Images/download_icon.png";

import { getAllFranchisee } from "../../Helpers/apiCalls/franchiseeApi";
import {
    getAllPayables,
    getAllPayablesPotato
} from "../../Helpers/apiCalls/Reports/PayablesApi";
import ViewModal from "../../Components/Modals/ViewModal";
import { getAllSuppliers } from "../../Helpers/apiCalls/suppliersApi";
import { getAllSuppliersPotato } from "../../Helpers/apiCalls/PotatoCorner/suppliersApi";
import { getAllVendors } from "../../Helpers/apiCalls/Manage/Vendors";
import { getAllVendorsPotato } from "../../Helpers/apiCalls/PotatoCorner/VendorsApi";

export default function Payables() {
    let navigate = useNavigate();
    const accountType = getType();

    /* delete modal handler */
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const handleShowDeleteModal = () => setShowDeleteModal(true);
    const handleCloseDeleteModal = () => refreshPage();
    const [paymentDeets, setPaymentDeets] = useState({ id: "", payment: "" });
    const today = Moment().format("MM-DD-YYYY");

    // VIEW SALES MODAL
    const [showViewSaleModal, setShowViewSaleModal] = useState(false);
    const handleShowViewSaleModal = (id) => {
        setShowViewSaleModal(true);
    };
    const handleCloseViewSaleModal = () => setShowViewSaleModal(false);

    // VIEW SALES BILLING MODAL
    const [showViewSaleBillingModal, setShowViewSaleBillingModal] =
        useState(false);
    const handleShowViewSaleBillingModal = (id) => {
        setShowViewSaleBillingModal(true);
    };
    const handleCloseViewSaleBillingModal = () =>
        setShowViewSaleBillingModal(false);

    const dummy = [
        {
            id: "1",
            franchise: "FRANCHISE",
            franchise_name: "FRANCHISE NAME",
            contract: "10000",
            sales: "50000",
            sale_billing: "10000",
            total: "160000",
        },
        {
            id: "2",
            franchise: "FRANCHISE 2",
            franchise_name: "FRANCHISE NAME 2",
            contract: "1000",
            sales: "5000",
            sale_billing: "1000",
            total: "7000",
        },
    ];

    const [payablesMango, setPayablesMango] = useState([]);
    const [payablesPotato, setPayablesPotato] = useState([]);
    const [payables, setPayables] = useState([]);

    const [csvMango, setCsvMango] = useState([]);
    const [csvPotato, setCsvPotato] = useState([]);
    const [payablesCsv, setPayablesCsv] = useState([]);

    const [filterConfig, setFilterConfig] = useState({
        supplier_id: "",
        vendor_id: "",
        type: "",
        date_from: "",
        date_to: "",
        payable: "1",
    });

    const excelHeaders = [
        { label: "DOC No.", key: "id" },
        { label: "Date", key: "date" },
        { label: "Supplier", key: "name" },
        { label: "Invoice No.", key: "invoice_no" },
        { label: "Dr No.", key: "dr_no" },
        { label: "Grand Total", key: "amount" },
        { label: "Amount Paid", key: "paid_amount" },
        { label: "Balance", key: "balance" },
        { label: "", key: "" },
        { label: "Grand Total", key: "grand_total" },
        { label: "Total Paid Amount", key: "total_paid_amount" },
        { label: "Total Balance", key: "total_balance" },
    ];

    const [inactive, setInactive] = useState(true);
    const [dateto, setDateto] = useState("");
    const [datefrom, setDatefrom] = useState("");
    const [suppliers, setSuppliers] = useState([]);

    const [supplierList, setSupplierList] = useState ([]);
    const [selectedSupplier, setSelectedSupplier] = useState("");

    const [showLoader, setShowLoader] = useState(false);
    const [grandTotal, setGrandTotal] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [totalBalance, setTotalBalance] = useState(0);
    
    function handleFilterChange(e) {
        const { name, value } = e.target;
        if (name === "supplier") {
            var id = value.split("|")[0];
            var type = value.split("|")[1];
            var by = value.split("|")[2];
            if (by === "supplier") {
                setFilterConfig((prev) => {
                    return {
                        ...prev,
                        ["supplier"]: id,
                        ["supplier_id"]: id,
                        ["vendor_id"]: "",
                        ["type"]: type,
                    };
                });
            } else {
                setFilterConfig((prev) => {
                    return {
                        ...prev,
                        ["supplier"]: "",
                        ["supplier_id"]: "",
                        ["vendor_id"]: id,
                        ["type"]: type,
                    };
                });
            }
        } else {
            setFilterConfig((prev) => {
                return {
                    ...prev,
                    [name]: value,
                };
            });
        }
    }

    function handleSelectChange(e, row) {

        if (e.target.value === "edit-ps") {
            navigate(
                "/se/paysuppliers/edit/" + row.id + "/" + row.payment_mode
            );
        } else if (e.target.value === "delete-ps") {
            handleShowDeleteModal();
            setPaymentDeets({ id: row.id, payment: row.payment_mode });
        } else if (e.target.value === "view-ps") {
            navigate(
                "/se/paysuppliers/view/" + row.id + "/" + row.payment_mode
            );
        } else if (e.target.value === "approve-ps") {
            navigate("/se/paysuppliers/approve/" + row.id);
        }
    }

    function ActionBtn(row, type) {
        return (
            <Form.Select
                name="action"
                role={row.payment_mode}
                id={row.id}
                className="PO-select-action"
                onChange={(e) => handleSelectChange(e, row)}
            >
                <option value="" selected hidden>
                    Select
                </option>
                {type === "pending" ? (
                    <option value="edit-ps" className="color-options">
                        Edit
                    </option>
                ) : null}
                <option value="view-ps" className="color-options">
                    View
                </option>
                {type === "approved" ? (
                    <option value="reprint-ps" className="color-options">
                        Reprint
                    </option>
                ) : null}
                <option value="delete-ps" className="color-red">
                    Delete
                </option>
            </Form.Select>
        );
    }

    function ContractBtn(row) {
        return (
            <span
                className="me-4 align-middle ps-label"
                onClick={() => handleViewContract(row.id)} 
            >
                {row.contract}
            </span>
        );
    }
    function handleViewContract(id) {
        {
            window.open("/franchise/print/" + id);
        }
    }

    async function fetchAllPayables() {
        console.log(filterConfig)
        setGrandTotal("");
        setTotalAmount("");
        setTotalBalance("");
        setShowLoader(true);
        var array = []
        var array2 = []
        var data = []
        var data2 = []
        var total = {
                grand_total: "",
                total_paid_amount: "",
                total_balance: "",
            }
        
        if (filterConfig.store === "mango") {
            const response = await getAllPayables(filterConfig);

            if (response.data) {
                data = response.data.receivables.map((data) => {
                    var info = data;
                    info.date = Moment(data.date).format("MM-DD-YYYY");
                    info.name = data.supplier_name? data.supplier_name : data.vendor_name;
                    info.amount = numberFormat(data.amount);
                    info.paid_amount = numberFormat(data.paid_amount);
                    info.balance = numberFormat(data.balance);
                    info.shop = "mango";
                    return info;
                })

                var gtotal = response.data.summary? response.data.summary.grand_total : "0";
                var amountTotal = response.data.summary? response.data.summary.total_paid : "0";
                var balanceTotal = response.data.summary? response.data.summary.total_balance : "0";

                total["grand_total"] = numberFormat(gtotal);
                total["total_paid_amount"] = numberFormat(amountTotal);
                total["total_balance"] = numberFormat(balanceTotal);

                setGrandTotal(gtotal);
                setTotalAmount(amountTotal);
                setTotalBalance(balanceTotal);
                
                setPayablesMango(data);
            } else {
            }
            array = [
                ...data.sort((a, b) =>
                    new Date(...a.date?.split('/').reverse()) - new Date(...b.date?.split('/').reverse())
                ).reverse(), 
                ...data2.sort((a, b) =>
                    new Date(...a.date?.split('/').reverse()) - new Date(...b.date?.split('/').reverse())
                ).reverse()
            ]
            array2 = [
                total,
                ...data.sort((a, b) =>
                    new Date(...a.date?.split('/').reverse()) - new Date(...b.date?.split('/').reverse())
                ).reverse(), 
                ...data2.sort((a, b) =>
                    new Date(...a.date?.split('/').reverse()) - new Date(...b.date?.split('/').reverse())
                ).reverse()
            ]

            setPayables(array);
            setPayablesCsv(array2)

        } else if (filterConfig.store === "potato") {
            const response2 = await getAllPayablesPotato(filterConfig);
            if (response2.data) {
                data2 = response2.data.receivables.map((data) => {
                    var info = data;
                    info.date = Moment(data.date).format("MM-DD-YYYY");
                    info.name = data.supplier_name? data.supplier_name : data.vendor_name;
                    info.amount = numberFormat(data.amount);
                    info.paid_amount = numberFormat(data.paid_amount);
                    info.balance = numberFormat(data.balance);
                    info.shop = "potato";
                    return info;
                })

                var gtotal = response2.data.summary? response2.data.summary.grand_total : "0";
                var amountTotal = response2.data.summary? response2.data.summary.total_paid : "0";
                var balanceTotal = response2.data.summary? response2.data.summary.total_balance : "0";

                total["grand_total"] = numberFormat(gtotal);
                total["total_paid_amount"] = numberFormat(amountTotal);
                total["total_balance"] = numberFormat(balanceTotal);

                setGrandTotal(gtotal);
                setTotalAmount(amountTotal);
                setTotalBalance(balanceTotal);

                setPayablesPotato(data2);
            } else {
            }

            array = [
                ...data.sort((a, b) =>
                    new Date(...a.date?.split('/').reverse()) - new Date(...b.date?.split('/').reverse())
                ).reverse(), 
                ...data2.sort((a, b) =>
                    new Date(...a.date?.split('/').reverse()) - new Date(...b.date?.split('/').reverse())
                ).reverse()
            ]
            array2 = [
                total,
                ...data.sort((a, b) =>
                    new Date(...a.date?.split('/').reverse()) - new Date(...b.date?.split('/').reverse())
                ).reverse(), 
                ...data2.sort((a, b) =>
                    new Date(...a.date?.split('/').reverse()) - new Date(...b.date?.split('/').reverse())
                ).reverse()
            ]
            
            setPayables(array);
            setPayablesCsv(array2)

        } else {
            const response = await getAllPayables(filterConfig);
            var array = [];
            var data = [];
            var data2 = [];
            var gtotal = 0;
            var amountTotal = 0;
            var balanceTotal = 0;
            if (response.data) {
                data = response.data.receivables.map((data) => {
                    var info = data;
                    info.date = Moment(data.date).format("MM-DD-YYYY");
                    info.name = data.supplier_name? data.supplier_name : data.vendor_name;
                    info.amount = numberFormat(data.amount);
                    info.paid_amount = numberFormat(data.paid_amount);
                    info.balance = numberFormat(data.balance);
                    info.shop = "mango";
                    return info;
                })

                gtotal = response.data.summary? response.data.summary.grand_total : "0";
                amountTotal = response.data.summary? response.data.summary.total_paid : "0";
                balanceTotal = response.data.summary? response.data.summary.total_balance : "0";

                total["grand_total"] = numberFormat(gtotal);
                total["total_paid_amount"] = numberFormat(amountTotal);
                total["total_balance"] = numberFormat(balanceTotal);

                setGrandTotal(gtotal);
                setTotalAmount(amountTotal);
                setTotalBalance(balanceTotal);

                setPayablesMango(data);
            } else {
            }

            const response2 = await getAllPayablesPotato(filterConfig);
            if (response2.data) {
                data2 = response2.data.receivables.map((data) => {
                    var info = data;
                    info.date = Moment(data.date).format("MM-DD-YYYY");
                    info.name = data.supplier_name? data.supplier_name : data.vendor_name;
                    info.amount = numberFormat(data.amount);
                    info.paid_amount = numberFormat(data.paid_amount);
                    info.balance = numberFormat(data.balance);
                    info.shop = "potato";
                    return info;
                })

                gtotal = response2.data.summary? parseFloat(gtotal) + parseFloat(response2.data.summary.grand_total) : gtotal;
                amountTotal = response2.data.summary? parseFloat(amountTotal) + parseFloat(response2.data.summary.total_paid) : amountTotal;
                balanceTotal = response2.data.summary? parseFloat(balanceTotal) + parseFloat(response2.data.summary.total_balance) : balanceTotal;

                total["grand_total"] = numberFormat(gtotal);
                total["total_paid_amount"] = numberFormat(amountTotal);
                total["total_balance"] = numberFormat(balanceTotal);

                setGrandTotal(gtotal);
                setTotalAmount(amountTotal);
                setTotalBalance(balanceTotal);
                
                setPayablesPotato(data2);
            } else {
            }

            array = [
                ...data.sort((a, b) =>
                    new Date(...a.date?.split('/').reverse()) - new Date(...b.date?.split('/').reverse())
                ).reverse(), 
                ...data2.sort((a, b) =>
                    new Date(...a.date?.split('/').reverse()) - new Date(...b.date?.split('/').reverse())
                ).reverse()
            ]
            array2 = [
                total,
                ...data.sort((a, b) =>
                    new Date(...a.date?.split('/').reverse()) - new Date(...b.date?.split('/').reverse())
                ).reverse(), 
                ...data2.sort((a, b) =>
                    new Date(...a.date?.split('/').reverse()) - new Date(...b.date?.split('/').reverse())
                ).reverse()
            ]
            
            setPayables(array);
            setPayablesCsv(array2)
        }
        setShowLoader(false);
    }

    async function fetchSuppliers() {
        setSuppliers([]);

        const suppliersResponse = await getAllSuppliers();
        const suppliersPotatoResponse = await getAllSuppliersPotato();
        const vendorsResponse = await getAllVendors();
        const vendorsPotatoResponse = await getAllVendorsPotato();

        if (suppliersResponse.error) {
            TokenExpiry(suppliersResponse);
        } else {

            suppliersResponse.data.data.map((supplier) => {
                var info = supplier;
                info.type = "mango|supplier";
                setSuppliers((prev) => [...prev, info]);
            });
        }

        if (suppliersPotatoResponse.error) {
            TokenExpiry(suppliersPotatoResponse);
        } else {

            suppliersPotatoResponse.response.data.map((supplier) => {
                var info = supplier;
                info.type = "potato|supplier";
                setSuppliers((prev) => [...prev, info]);
            });
        }

        if (vendorsResponse.error) {
            TokenExpiry(vendorsResponse);
        } else {

            vendorsResponse.response.data.map((vendor) => {
                var info = vendor;
                info.type = "mango|vendor";
                setSuppliers((prev) => [...prev, info]);
            });
        }

        if (vendorsPotatoResponse.error) {
            TokenExpiry(vendorsPotatoResponse);
        } else {

            vendorsPotatoResponse.response.data.map((vendor) => {
                var info = vendor;
                info.type = "potato|vendor";
                setSuppliers((prev) => [...prev, info]);
            });
        }
    }

    function PrintBtn(row) {
        return (
            <button
                name="action"
                className="btn btn-sm view-btn-table"
                id={row.id}
                onClick={() => handlePrint(row.id, row.type, row.shop)}
            >
                View
            </button>
        );
    }
    function handlePrint(id, type, shop) {

        if(type === "receive"){
            window.open("/purchaseinvoices/print/" + id + "/" + shop);
        } else if(type === "supplies_receive"){
            window.open("se/purchaseinvoices/print/" + id);
        } else {
        }
    }

    function handleSupplierChange(e){
        setSelectedSupplier(e.name)
        const toFilter = {target: {name: "supplier", value: e.value}};
        handleFilterChange(toFilter);
    }

    useEffect(() => {
        fetchAllPayables();
        fetchSuppliers();
    }, []);

    useEffect(() => {
        fetchAllPayables();
    }, [filterConfig]);

    
    useEffect(()=>{
        // console.log(suppliers)
        setSupplierList(suppliers.map((supplier)=>{
            return {label: supplier.trade_name, value:supplier.id + "|" + supplier.type};
        }))
        setSupplierList((branches)=>{
            var newBranches = [{label: "All Suppliers", value:""}, ...branches];
            // newBranches.push({label: "All Suppliers", value:""})
            return newBranches;
        });

        // console.log(branches);
    },[suppliers])

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
                    <Col xs={6}>
                        <h1 className="page-title"> SUPPLIER AND VENDOR PAYABLES </h1>
                    </Col>
                    <Col xs={6} className="d-flex justify-content-end">
                        <input
                            type="search"
                            name="invoice_no"
                            placeholder="Search Invoice or Dr No..."
                            value={filterConfig.invoice_no}
                            onChange={(e) => handleFilterChange(e)}
                            className="search-bar"
                        />
                    </Col>
                </Row>

                <Row>
                    <Col className="d-flex justify-content-end mb-3">
                        <div className="justify-content-center align-items-center ">
                            <CSVLink
                                className="button-primary px-3 py-3 justify-content-center align-items-center download-csv"
                                data={payablesCsv}
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
                            placeholder="Select Supplier"
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
                            value={selectedSupplier}
                            options={supplierList}
                            onChange={handleSupplierChange}
                        />
                        {/* <Form.Select
                            name="supplier"
                            className="date-filter me-2"
                            onChange={(e) => handleFilterChange(e)}

                        >
                            <option value="" selected>
                                All Supplier
                            </option>
                            {suppliers.length > 0 ? (
                                suppliers.map((supplier) => {
                                    return (
                                        <option
                                            value={supplier.id + "|" + supplier.type}
                                        >
                                            {supplier.trade_name}
                                        </option>
                                    );
                                })
                            ) : (
                                <option value="" disabled>
                                    (No franchisee found)
                                </option>
                            )}
                        </Form.Select> */}
                        <Form.Select
                            name="store"
                            className="date-filter me-3"
                            onChange={(e) => handleFilterChange(e)}
                            value={filterConfig.store}
                        >
                            <option value="" hidden selected>
                                All store
                            </option>
                            <option value="">All</option>
                            <option value="mango">Mango Magic</option>
                            <option value="potato">Potato Corner</option>
                        </Form.Select>

                        <Form.Select
                            name="payable"
                            className="date-filter me-3"
                            onChange={(e) => handleFilterChange(e)}
                            value={filterConfig.payable}
                        >
                            <option value="" hidden selected>
                                All status
                            </option>
                            <option value="">All</option>
                            <option value="1">Open</option>
                            <option value="0">Close</option>
                        </Form.Select>
                        
                        <span className="me-4 align-middle mt-2 ps-label">
                            From:
                        </span>
                        <DatePicker
                            name="date_from"
                            placeholderText={"Select Date"}
                            className="ps-label-content me-3 form-control"
                            selected={filterConfig.date_from}
                            onChange={(date) => {
                                setFilterConfig((prev) => {
                                    return { ...prev, date_from: date };
                                });
                            }}
                            showYearDropdown
                            dateFormatCalendar="MMMM"
                            yearDropdownItemNumber={20}
                            scrollableYearDropdown
                        />

                        <span className="me-4 align-middle mt-2 ps-label">
                            To:
                        </span>
                        <DatePicker
                            name="date_to"
                            placeholderText={"Select Date"}
                            className="ps-label-content me-3 form-control"
                            selected={filterConfig.date_to}
                            onChange={(date) => {
                                setFilterConfig((prev) => {
                                    return { ...prev, date_to: date };
                                });
                            }}
                            showYearDropdown
                            dateFormatCalendar="MMMM"
                            yearDropdownItemNumber={20}
                            scrollableYearDropdown
                        />
                    </div>

                    <div className=" PO-filters d-flex justify-content-center">
                        <span className="me-4 ml-4 mt-2 ps-label">
                            Grand Total: {numberFormat(grandTotal)}
                        </span>

                        <span className="me-4 ml-4 mt-2 ps-label">
                            Total Paid Amount: {numberFormat(totalAmount)}
                        </span>

                        <span className="me-4 ml-4 mt-2 ps-label">
                            Total Balance: {numberFormat(totalBalance)}
                        </span>
                    </div>

                    <div className="below">
                        {/* table */}
                        <Table
                            tableHeaders={[
                                "-",
                                "DOC. NO",
                                "DATE",
                                "SUPPLIER",
                                "INVOICE NO.",
                                "DR NO",
                                "GRAND TOTAL",
                                "AMOUNT PAID",
                                "BALANCE",
                            ]}
                            headerSelector={[
                                "-",
                                "id",
                                "date",
                                "name",
                                "invoice_no",
                                "dr_no",
                                "amount",
                                "paid_amount",
                                "balance",
                            ]}
                            tableData={payables}
                            ViewBtn={(row) => PrintBtn(row)}
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
                text="payment"
            />
        </div>
    );
}
