import React, { Fragment, useEffect, useState } from "react";
import { Button, Col, Container, Form, Row, Table } from "react-bootstrap";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import Navbar from "../../../Components/Navbar/Navbar";
import trash from "./../../../Assets/Images/trash.png";
import Select from "react-select";
import signature from "../../../Assets/Images/signature.png";
import "./../Franchise.css";
import {
    formatDate,
    formatDateNoTime,
    numberFormat,
    refreshPage,
    toastStyle,
    getName,
    dateFormat,
} from "../../../Helpers/Utils/Common";
import {
    getAllTransfers,
    getTransfer,
    createTransfer,
    updateTransfer,
} from "../../../Helpers/apiCalls/Inventory/TransferApi";
import {
    getAllItemList,
    getItemHistory,
} from "../../../Helpers/apiCalls/Inventory/ItemListApi";
import { getAllBranches } from "../../../Helpers/apiCalls/Purchases/purchaseOrderApi";
import {
    getAllItems,
    getAllBranchItem,
} from "../../../Helpers/apiCalls/itemsApi";
import { getAllEmployees } from "../../../Helpers/apiCalls/employeesApi";
import { validateTransfer } from "../../../Helpers/Validation/Inventory/TransferValidation";
import InputError from "../../../Components/InputError/InputError";
import toast from "react-hot-toast";
import Moment from "moment";

import cleanLogo from "../../../Assets/Images/Login/logo.png";
import FranchiseModal from "./Components/FranchiseModal";
import { validateFranchiseSaleBilling } from "../../../Helpers/Validation/Franchise/FranchiseSaleBillingPaymentValidation";
import {
    getFranchise,
    createFranchiseeSaleBillingPayment,
    getAllFranchiseSaleBillingPayment,
    updateFranchiseSaleBilling,
    updateFranchiseSaleBillingDiscount,
} from "../../../Helpers/apiCalls/Franchise/FranchiseSaleBillingApi";
import { getAllBanks } from "../../../Helpers/apiCalls/banksAPi";
import PaymentTable from "../../Sales/PaymentTable";

/**
 *  COMPONENT: FORM TO ADD OR EDIT PAYMENT
 */
function FranchiseBillingView({ add, edit }) {
    const [inactive, setInactive] = useState(true);
    const [showLoader, setShowLoader] = useState(false);
    const { id, type } = useParams();
    const { state } = useLocation();

    let navigate = useNavigate();

    const [totalAmount, setTotalAmount] = useState(0);
    const [transactionFee, setTransactionFee] = useState("");
    const [grandTotal, setGrandTotal] = useState(0);
    const [selectedEntry, setSelectedEntry] = useState("");

    // DATA HANDLERS
    const [branchTo, setBranchTo] = useState([]);
    const [branchFrom, setBranchFrom] = useState([]);
    const [entries, setEntries] = useState([]);
    const [entriesList, setEntriesList] = useState([]);
    const [items, setItems] = useState([]);
    const [banks, setBanks] = useState([]);
    const [fromBanks, setFromBanks] = useState([]);
    const [toBanks, setToBanks] = useState([]);
    const [itemsData, setItemsData] = useState([]);
    const [employeeOptions, setEmployeeOptions] = useState([]);
    const [employeesData, setEmployeesData] = useState([]);

    const [newTransfer, setNewTransfer] = useState({
        transfer_date: "",
        transfer_number: "",
        branch_from: "",
        branch_to: "",
        remarks: "",
        dispatcher: "0",
    });

    const [transferData, setTransferData] = useState({});
    const [itemData, setItemData] = useState({});

    // FRANCHISEE INVOICE DETAILS HANDLER
    const [franchiseeInvoice, setFranchiseeInvoice] = useState({
        fs_billing_id: "",
        franchisee_id: "",
        payment_type: "",
        payment_date: Moment().format("YYYY-MM-DD"),
        deposit_date: Moment().format("YYYY-MM-DD"),
        remarks: "",
        bank_id: "",
        bank_name: "",
        cheque_number: "",
        cheque_date: "",
        reference_number: "",
        transaction_number: "",
        payment_description: "",
        term_day: "",
        delivery_address: "",
        paid_amount: "",
        grand_total: "",
        subtotal: "",
        service_fee: "",
        delivery_fee: "",
        withholding_tax: "",
        discount: 0,
        discount_remarks: "",
    });
    const [paymentInfo, setPaymentInfo] = useState([]);

    const [branchToValue, setBranchToValue] = useState({
        name: "branch_to",
        label: "",
        value: "",
    });
    const [branchFromValue, setBranchFromValue] = useState({
        name: "branch_from",
        label: "",
        value: "",
    });
    const [employeeValue, setEmployeeValue] = useState({
        name: "dispatcher",
        label: "",
        value: "",
    });
    const [billing, setBilling] = useState([]);
    const [discount, setDiscount] = useState([]);
    const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
    const handleShowAddSupplierModal = () => setShowAddSupplierModal(true);
    const handleCloseAddSupplierModal = () => {
        setShowAddSupplierModal(false);
    };

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    //ERROR HANDLING
    const [isError, setIsError] = useState({
        transfer_date: false,
        transfer_number: false,
        branch_from: false,
        branch_to: false,
        dispatcher: false,
        listInfo: false,
    });

    const [isErrorEdit, setIsErrorEdit] = useState({
        transfer_date: false,
        transfer_number: false,
        branch_from: false,
        branch_to: false,
        dispatcher: false,
        listInfo: false,
    });
    const [sheetData, setSheetData] = useState([]);

    const [printFranchiseBilling, setPrintFranchiseBilling] = useState([]);
    /* print modal handler */
    const [showPrintModal, setShowPrintModal] = useState(false);
    const handleShowPrintModal = () => setShowPrintModal(true);
    const handleClosePrintModal = () => setShowPrintModal(false);

    async function handlePrintFranchiseBilling() {
        toast.loading("Printing Sales Tracking Sheet", { style: toastStyle() });
        handleClosePrintModal();
        setTimeout(() => {
            toast.dismiss();
            Print();
        }, 1000);
    }

    function Print() {
        let printContents = document.getElementById("printablediv").innerHTML;
        let originalContents = document.body.innerHTML;
        document.body.innerHTML = printContents;
        window.print(printContents);
        document.body.innerHTML = originalContents;
        refreshPage();
    }

    const dummy = [
        {
            id: "1",
            month: "SEPTEMBER 2022",
            date_opened: "June 1, 2022",
            branch_name: "SM CITY CEBU",
            franchise_name: "JUAN LUNA",
            contact_person: "JUAN LUNA",
            contact_number: "01234567891",
            franchise_date: "June 1, 2022",
        },
    ];

    const months = [
        {
            id: "0",
            name: "January",
            days: "31",
        },
        {
            id: "1",
            name: "February",
            days: "28",
        },
        {
            id: "2",
            name: "March",
            days: "31",
        },
        {
            id: "3",
            name: "April",
            days: "30",
        },
        {
            id: "4",
            name: "May",
            days: "31",
        },
        {
            id: "5",
            name: "June",
            days: "30",
        },
        {
            id: "6",
            name: "July",
            days: "31",
        },
        {
            id: "7",
            name: "August",
            days: "31",
        },
        {
            id: "8",
            name: "September",
            days: "30",
        },
        {
            id: "9",
            name: "October",
            days: "31",
        },
        {
            id: "10",
            name: "November",
            days: "30",
        },
        {
            id: "11",
            name: "December",
            days: "31",
        },
    ];

    if (newTransfer.transfer_date === "" && add) {
        setNewTransfer({
            transfer_date: Moment().format("YYYY-MM-DD"),
        });
    }

    // SELECT DROPSEARCH CHANGE HANDLER
    function handleSelectChange(e) {
        const newList = newTransfer;
        newList[e.name] = e.value;
        setNewTransfer(newList);

        if (e.name === "branch_to") {
            setBranchToValue({ name: e.name, label: e.label, value: e.value });
        } else if (e.name === "branch_from") {
            fetchAllItems(e.value);
            setBranchFromValue({
                name: e.name,
                label: e.label,
                value: e.value,
            });
        } else if (e.name === "dispatcher")
            setEmployeeValue({ name: e.name, label: e.label, value: e.value });
    }

    const handleChange = (e, isSelect) => {
        if (isSelect) {
            const { name, value } = e.target;
        } else {
            const { name, value } = e.target;
            setFranchiseeInvoice((prevState) => ({
                ...prevState,
                [name]: value,
            }));
        }
    };

    function handleItemChange(e, id) {
        setSelectedEntry(id);
        const { name, label, value } = e.target;
        var newSales = sheetData;

        if (name === "is_closed") {
            var newData = sheetData.map((data, index) => {
                if (data.id === id + 1) {
                    if (data.is_closed === 1) {
                        data["is_closed"] = 0;
                    } else {
                        data["is_closed"] = 1;
                        data["sales"] = "0";
                    }
                }
            });
            setNewSheetData(newSales);
            setItems(newSales);
        } else if (name === "sales") {
            var newData = sheetData.map((data, index) => {
                if (data.id === id + 1) {
                    data["sales"] = value;
                }
                return data;
            });
            setNewSheetData(newSales);
            setItems(newSales);
        }
    }


    // PAYMENT DETAILS CHANGE HANDLER
    function handlePayChange(e) {
        const { name, value } = e.target;
        const newList = newTransfer;
        newList[name] = value;
        setNewTransfer(newList);
    }

    const [date, setDate] = useState("");
    const [year, setYear] = useState("");
    const [newSheetData, setNewSheetData] = useState([]);

    const [sample, setSample] = useState({
        id: "2",
        total_sales: "260,794.00",
        total_net_sales: "232,851.79",
        royalty_fee: "6,985.55",
        royalty_fee_vat: "885.55",
        royalty_fee_net_vat: "7,985.55",
        s_marketing_fee: "2,585.55",
        s_marketing_fee_vat: "385.55",
        s_marketing_fee_net_vat: "2,985.55",
        total_fee: "10,655.00",
        total_amount_due: "20,000.00",
    });

    const [isErrorPayment, setIsErrorPayment] = useState({
        to_bank_id: false,
        paid_amount: false,
        payment_type: false,
        payment_date: false,
        bank_name: false,
        cheque_number: false,
        cheque_date: false,
        reference_number: false,
    });

    // INVOICE REMOVAL HANDLER
    function handleRemoveItem(id) {
        const rowId = id;
        const newItemList = [...items];
        newItemList.splice(rowId, 1);
        setItems(newItemList);
    }

    console.log(billing)

    //PAYMENT FUNCTION
    async function addPayment() {
        if (
            validateFranchiseSaleBilling(franchiseeInvoice, setIsErrorPayment)
        ) {
            const response = await createFranchiseeSaleBillingPayment(
                id,
                franchiseeInvoice,
                billing[0]
            );
            if (response.data) {
                toast.success("Successfully paid!", { style: toastStyle() });
                setTimeout(() => refreshPage(), 1000);
            } else {
                toast.error(response.error.data.messages.error, {
                    style: toastStyle(),
                });
                setTimeout(() => refreshPage(), 1000);

            }
        } else {
            toast.error("Please fill in all fields", { style: toastStyle() });
        }
    }

    async function fetchBilling(id) {

        setPrintFranchiseBilling({});
        const response = await getFranchise(id);

        if (response.data.status === "success") {
            setPrintFranchiseBilling(response.data.data[0]);
            var billing = response.data.data;
            billing.map(async (bill) => {
                var info = bill;

                info.id = bill.id;
                info.month = dateFormat(bill.month);
                info.date_added = dateFormat(bill.added_on);
                info.date_opened = dateFormat(bill.added_on);
                info.branch_id = bill.branch_id;
                info.branch_name = bill.branch_name;
                info.franchise_id = bill.franchisee_id;
                info.franchise_name = bill.franchisee_name;
                info.contact_person = bill.contact_person
                    ? bill.contact_person
                    : "N/A";
                info.contact_number = bill.contact_number
                    ? bill.contact_number
                    : "N/A";
                info.franchise_date = bill.franchise_date
                    ? dateFormat(bill.franchise_date)
                    : " ";
                info.franchise_date = bill.franchise_date;
                info.payment_status = bill.payment_status;
                info.status = bill.status;

                info.balance = bill.balance;
                info.discount = bill.discount;
                info.total_sale = bill.total_sale;
                info.total_net = bill.total_net;
                info.royalty_fee = bill.royalty_fee;
                info.royalty_fee_rate = bill.royalty_fee_rate;
                info.marketing_fee_rate = bill.marketing_fee_rate;
                info.twelve_vat_from_royalty_fee =
                    bill.twelve_vat_from_royalty_fee;
                info.royalty_fee_net_of_vat = bill.royalty_fee_net_of_vat;
                info.s_marketing_fee = bill.s_marketing_fee;
                info.twelve_vat_from_s_marketing_fee =
                    bill.twelve_vat_from_s_marketing_fee;
                info.s_marketing_fee_net_of_vat =
                    bill.s_marketing_fee_net_of_vat;
                info.total_royalty_fee_and_s_marketing_fee =
                    bill.total_royalty_fee_and_s_marketing_fee;
                info.total_amount_due = bill.total_amount_due;
                info.discount_remarks = bill.discount_remarks;

                setDate(new Date(info.month).getMonth());
                setYear(new Date(info.month).getFullYear());
                info.monthYear =
                    new Date(info.month).toLocaleString("en-us", {
                        month: "long",
                    }) +
                    " " +
                    new Date(info.month).getFullYear();
                info.fs_billing_items = bill.fs_billing_items;

                setBilling((prev) => [...prev, info]);
            });
        }
    }

    async function fetchPayment() {
        setShowLoader(true);

        const response = await getAllFranchiseSaleBillingPayment();

        if (response.error) {

        } else {
            var payments = [];

            var billing = response.data.data;

            var allBills = response.data.data.map((bill) => {
                var info = bill;

                info.id = bill.id;
                info.payment_date = dateFormat(bill.payment_date);
                if (bill.payment_type === "check") {
                    info.payment_type =
                        bill.payment_type + "-" + bill.cheque_number;
                }
                info.paid_amount = numberFormat(bill.paid_amount);
                info.added_by = bill.added_by_name;
                info.remarks = bill.remarks;
                info.to_bank_name = bill.to_bank_name;

                return info;
            });

            payments = allBills.filter((bill) => bill.fs_billing_id === id);
            setPaymentInfo(payments);
        }

        setShowLoader(false);
    }

    async function fetchBanks() {
        const response = await getAllBanks();
        if (response.error) {

        } else {
            setBanks(response.data.data);
        }
    }

    function handlefetchBills() {
        billing.map((item) => {
            item.fs_billing_items?.map((bill) => {
                var bill_date = new Date(bill.date).toLocaleDateString(
                    "en-us",
                    { day: "numeric",
                      month:"numeric"}
                );
              
                var otherData = sheetData;
                sheetData.map((data) => {
                    var sheetDate = new Date(data.date).toLocaleDateString(
                        "en-us",
                        { day: "numeric",
                    month: "numeric" }
                    );
                 
                    if (bill_date === sheetDate) {
                        otherData[data.id - 1]["sales"] = bill.sale;
                        otherData[data.id - 1]["is_closed"] = bill.is_closed;
                    }
                });
                setSheetData(otherData);
            });
        });
    }

    //  DISPLAY THE LIST OF ITEMS TABLE
    function renderTable() {
        return (
            <Table className="ps-table">
                <tbody>
                    <tr>
                        <td className="franchise-td-gray">
                            {"TOTAL SALES (VAT INCL)"}
                        </td>
                        <td className="franchise-td-gray text-left">
                            {numberFormat(billing[0]?.total_sale)}
                        </td>
                    </tr>
                    <tr>
                        <td className="franchise-td-gray">
                            {"TOTAL NET SALES (VAT EXCL.)"}
                        </td>
                        <td className="franchise-td-gray text-left">
                            {numberFormat(billing[0]?.total_net)}
                        </td>
                    </tr>
                    <tr>
                        <td className="franchise-td-gray">
                            {"ROYALTY FEE(" + billing[0]?.royalty_fee_rate + "%)"}
                        </td>
                        <td className="franchise-td-gray text-left">
                            {numberFormat(billing[0]?.royalty_fee)}
                        </td>
                    </tr>
                    <tr>
                        <td className="franchise-td-gray">
                            {"PLUS: 12% VAT FROM ROYALTY FEE"}
                        </td>
                        <td className="franchise-td-gray text-left">
                            {numberFormat(
                                billing[0]?.twelve_vat_from_royalty_fee
                            )}
                        </td>
                    </tr>
                    <tr>
                        <td className="franchise-td-gray">
                            {"ROYALTY FEE NET OF VAT"}
                        </td>
                        <td className="franchise-td-gray text-left">
                            {numberFormat(billing[0]?.royalty_fee_net_of_vat)}
                        </td>
                    </tr>
                    <tr>
                        <td className="franchise-td-gray">
                            {"SYSTEM WIDE MARKETING FEE("  + billing[0]?.marketing_fee_rate + "%)" }
                        </td>
                        <td className="franchise-td-gray text-left">
                            {numberFormat(billing[0]?.s_marketing_fee)}
                        </td>
                    </tr>
                    <tr>
                        <td className="franchise-td-gray">
                            {"PLUS: 12% VAT FROM SYSTEM WIDE MARKETING FEE"}
                        </td>
                        <td className="franchise-td-gray text-left">
                            {numberFormat(
                                billing[0]?.twelve_vat_from_s_marketing_fee
                            )}
                        </td>
                    </tr>
                    <tr>
                        <td className="franchise-td-gray">
                            {"SYSTEM WIDE MARKETING FEE NET OF VAT"}
                        </td>
                        <td className="franchise-td-gray text-left">
                            {numberFormat(
                                billing[0]?.s_marketing_fee_net_of_vat
                            )}
                        </td>
                    </tr>
                    <tr>
                        <td className="franchise-td-gray">
                            {"TOTAL ROYALTY FEE AND SYSTEM WIDE MARKETING FEE"}
                        </td>
                        <td className="franchise-td-gray text-left">
                            {numberFormat(
                                billing[0]
                                    ?.total_royalty_fee_and_s_marketing_fee
                            )}
                        </td>
                    </tr>
                    <tr>
                        <td className="franchise-td-green">
                            {"TOTAL AMOUNT DUE TO CHK BUSINESS VENTURES CORP."}
                        </td>
                        <td className="franchise-td-green text-left">
                            {numberFormat(billing[0]?.total_amount_due)}
                        </td>
                    </tr>
                    <tr>
                        <td className="franchise-td-gray">
                            {"DISCOUNT"}
                        </td>
                        <td className="franchise-td-green text-left">
                            {numberFormat(billing[0]?.discount)}
                        </td>
                    </tr>
                    <tr>
                        <td className="franchise-td-gray">
                            {"REMARKS"}
                        </td>
                        <td className="franchise-td-gray text-left">
                            {billing[0]?.discount_remarks}
                        </td>
                    </tr>
                    <tr>
                        <td className="franchise-td-green">
                            {"GRAND TOTAL"}
                        </td>
                        <td className="franchise-td-green text-left">
                            {numberFormat(grandTotal)}
                        </td>
                    </tr>
                    <tr>
                        <td className="franchise-td-green">
                            {"PAID AMOUNT"}
                        </td>
                        <td className="franchise-td-green text-left">
                            {numberFormat(billing[0]?.paid_amount)}
                        </td>
                    </tr>
                    <tr>
                        <td className="franchise-td-green">
                            {"BALANCE"}
                        </td>
                        <td className="franchise-td-green text-left">
                            {numberFormat(billing[0]?.balance)}
                        </td>
                    </tr>
                </tbody>
            </Table>
        );
    }

    function renderSalesTable() {
        return (
            <Table className="ps-table">
                <thead>
                    <tr>
                        <th>Day</th>
                        <th>Date</th>
                        <th>Sales</th>
                        <th>Closed</th>
                    </tr>
                </thead>
                <tbody>
                    {sheetData.map((data, index) => {
                        return (
                            <tr key={index}>
                                <td className="select-cell justify-content-left">{data.id + " - " + data.dayName}</td>
                                <td>{data.date}</td>
                                <td>{numberFormat(data.sales)}</td>
                                <td>
                                    <Col>
                                        {data.is_closed === "1" &&
                                        data.sales === "0.00" ? (
                                            <>
                                                <Form.Group controlId="formBasicCheckbox">
                                                    <Form.Check
                                                        type="checkbox"
                                                        name="is_closed"
                                                        value="1"
                                                        disabled
                                                        checked
                                                        onChange={(e) =>
                                                            handleItemChange(
                                                                e,
                                                                index
                                                            )
                                                        }
                                                    />
                                                </Form.Group>
                                            </>
                                        ) : (
                                            <>
                                                <Form.Group controlId="formBasicCheckbox">
                                                    <Form.Check
                                                        type="checkbox"
                                                        name="is_closed"
                                                        disabled
                                                        value="1"
                                                        onChange={(e) =>
                                                            handleItemChange(
                                                                e,
                                                                index
                                                            )
                                                        }
                                                    />
                                                </Form.Group>
                                            </>
                                        )}
                                    </Col>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        );
    }

    //  DISPLAY THE LIST OF ITEMS TABLE
    function renderPrintTable() {
        return (
            <Table className="ps-table">
                <tbody>
                    <tr>
                        <td colSpan={9} className="franchise-td-gray">
                            {"TOTAL SALES (VAT INCL)"}
                        </td>
                        <td className="franchise-td-gray text-left">
                            {billing[0]?.total_sale}
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={9} className="franchise-td-gray">
                            {"TOTAL NET SALES (VAT EXCL.)"}
                        </td>
                        <td className="franchise-td-gray text-left">
                            {billing[0]?.total_net}
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={9} className="franchise-td-gray">
                            {"ROYALTY FEE(3%)"}
                        </td>
                        <td colSpan={9}></td>
                        <td  className="franchise-td-gray text-left">
                            {billing[0]?.royalty_fee}
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={9} className="franchise-td-gray">
                            {"PLUS: 12% VAT FROM ROYALTY FEE"}
                        </td>
                        <td colSpan={9}></td>
                        <td className="franchise-td-gray text-left">
                            {billing[0]?.twelve_vat_from_royalty_fee}
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={9} className="franchise-td-gray">
                            {"ROYALTY FEE NET OF VAT"}
                        </td>
                        <td colSpan={9}></td>
                        <td className="franchise-td-gray text-left">
                            {billing[0]?.royalty_fee_net_of_vat}
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={9} className="franchise-td-gray">
                            {"SYSTEM WIDE MARKETING FEE(1%)"}
                        </td>
                        <td colSpan={9}></td>
                        <td className="franchise-td-gray text-left">
                            {billing[0]?.s_marketing_fee}
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={9} className="franchise-td-gray">
                            {"PLUS: 12% VAT FROM SYSTEM WIDE MARKETING FEE"}
                        </td>
                        <td colSpan={9}></td>
                        <td className="franchise-td-gray text-left">
                            {billing[0]?.twelve_vat_from_s_marketing_fee}
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={9} className="franchise-td-gray">
                            {"SYSTEM WIDE MARKETING FEE NET OF VAT"}
                        </td>
                        <td colSpan={10}></td>
                        <td className="franchise-td-gray text-left">
                            {billing[0]?.s_marketing_fee_net_of_vat}
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={9} className="franchise-td-gray">
                            {"TOTAL ROYALTY FEE AND SYSTEM WIDE MARKETING FEE"}
                        </td>
                        <td colSpan={10}></td>
                        <td className="franchise-td-gray text-left">
                            {billing[0]?.total_royalty_fee_and_s_marketing_fee}
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={9} className="franchise-td-gray">
                            {"TOTAL DISCOUNT OR REIMBURSEMENTS"}
                        </td>
                        <td colSpan={10}></td>
                        <td className="franchise-td-gray text-left">
                            {billing[0]?.discount}
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={9} className="franchise-td-green">
                            {"TOTAL AMOUNT DUE TO CHK BUSINESS VENTURES CORP."}
                        </td>
                        <td colSpan={10}></td>
                        <td className="franchise-td-green text-left">
                            {billing[0]?.total_amount_due}
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={9} className="franchise-td-gray">
                            {"DISCOUNT"}
                        </td>
                        <td colSpan={10}></td>
                        <td className="franchise-td-green text-left">
                            {numberFormat(billing[0]?.discount)}
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={9} className="franchise-td-gray">
                            {"REMARKS"}
                        </td>
                        <td colSpan={10}></td>
                        <td className="franchise-td-gray text-left">
                            {billing[0]?.discount_remarks}
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={9} className="franchise-td-green">
                            {"GRAND TOTAL"}
                        </td>
                        <td colSpan={10}></td>
                        <td className="franchise-td-green text-left">
                            {numberFormat(grandTotal)}
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={9} className="franchise-td-green">
                            {"PAID AMOUNT"}
                        </td>
                        <td colSpan={10}></td>
                        <td className="franchise-td-green text-left">
                            {numberFormat(billing[0]?.paid_amount)}
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={9} className="franchise-td-green">
                            {"BALANCE"}
                        </td>
                        <td colSpan={10}></td>
                        <td className="franchise-td-green text-left">
                            {numberFormat(billing[0]?.balance)}
                        </td>
                    </tr>
                </tbody>
            </Table>
        );
    }

    //  FETCH INVENTORY ITEMS   //
    async function fetchAllItems(id) {
        setEntries([]);
        setShowLoader(true);
        const response = await getAllItemList(id);
        if (response.data.data) {
            var itemsList = response.data.data;
            var clean = itemsList.map((entry) => {
                var info = {};
                info.name = "item_id";
                info.value = entry.item_id;
                info.label = entry.item_name;
                info.entry = {
                    name: "item_id",
                    value: entry.item_id,
                    label: entry.item_name,
                };
                info.unit = entry.inventory_unit_name;
                info.prices = entry.price;
                info.current_qty = parseInt(entry.current_qty);
                entry.item_units
                    ? entry.item_units.map((i) => {
                          info.unit = i.inventory_unit_name;
                          info.prices = i.price;
                          info.current_qty = parseInt(i.current_qty);
                      })
                    : (info.units = "");
                return info;
            });
            setEntries(clean);
            setEntriesList(clean);
        } else {
            setItemsData([]);
        }
        setShowLoader(false);
    }

    async function fetchBranches() {
        setBranchTo([]);
        setBranchFrom([]);
        const response = await getAllBranches();

        if (response) {
            let to = response.data.data.map((a) => {
                return {
                    value: a.id,
                    label: a.name,
                    name: "branch_to",
                };
            });
            setBranchTo(to);

            let from = response.data.data.map((a) => {
                return {
                    value: a.id,
                    label: a.name,
                    name: "branch_from",
                };
            });
            setBranchFrom(from);
        }
    }

    async function fetchTransfer(id) {
        const response = await getTransfer(id);

        if (response.data.status === "success") {
            var data = response.data.data[0];
            setNewTransfer({
                transfer_id: data.id,
                transfer_date: data.transfer_date,
                transfer_number: data.transfer_number,
                branch_to: data.branch_to,
                branch_from: data.branch_from,
                remarks: data.remarks,
                status: data.status,
                dispatcher: data.dispatcher,
            });
            setEmployeeValue({
                name: "dispatcher",
                label: data.dispatcher_name,
                value: data.dispatcher,
            });
            var itemEntries = data.transfer_items;
            var clean = itemEntries.map((entry) => {
                var info = {};
                info.name = "item_id";
                info.value = entry.item_id;
                info.label = entry.item_name;
                info.entry = {
                    name: "item_id",
                    value: entry.item_id,
                    label: entry.item_name,
                };
                info.units = entry.unit;
                info.prices = entry.price;
                info.quantities = entry.qty;
                return info;
            });
            setItems(clean);
            var fromInfo = {};
            fromInfo.name = "branch_from";
            fromInfo.label = data.branch_from_name;
            fromInfo.value = data.branch_from;
            setBranchFromValue(fromInfo);
            var toInfo = {};
            toInfo.name = "branch_to";
            toInfo.label = data.branch_to_name;
            toInfo.value = data.branch_to;
            setBranchToValue(toInfo);
            fetchAllItems(data.branch_from);
        }
    }

    useEffect(() => {
        fetchBranches();
        fetchBanks();
        fetchBilling(id);
        fetchPayment();
    }, []);

    useEffect(() => {
        handlefetchBills();
        fetchBranches();
        fetchBanks();
    }, [billing]);

    useEffect(() => {
        months.map((month, index) => {
            if (date === parseInt(month.id)) {

                var sheet = Array(parseInt(month.days) + 1)
                    .fill("")
                    .map((data, d) => {
                        var info = {};
                        var day = new Date(month.name + " " + d + " " + year).getDay()
                        info.id = d;
                        info.day = day;
                        info.date = month.name + " " + d + " " + year;
                        info.dayName = dayNames[day];
                        info.sales = "";
                        info.is_closed = 0;
                        return info;
                    });
                const firstElement = sheet.shift();
                setSheetData(sheet);
            }
        });
    }, [date, year]);

    useEffect(() => {
        setGrandTotal(
            parseFloat(
                billing[0]?.total_amount_due
                    ? billing[0]?.total_amount_due
                    : 0
            ) -
            parseFloat(
                billing[0]?.discount
                    ? billing[0]?.discount
                    : 0
            ) 
        );
    }, [
        billing,
        franchiseeInvoice.discount,
    ]);

    return (
        <div>
            <div className="page">
                <Navbar
                    onCollapse={(inactive) => {
                        setInactive(inactive);
                    }}
                    active={"FRANCHISE"}
                />
            </div>
            <div className={`container ${inactive ? "inactive" : "active"}`}>
                <div className="row">
                    {add ? (
                        <h1 className="page-title mb-4">
                            MONTHLY SALES REPORT{" "}
                        </h1>
                    ) : (
                        <h1 className="page-title mb-4">EDIT TRANSFER</h1>
                    )}
                </div>

                {/* FORM */}

                <div className="edit-form ps-form">
                    <Fragment>
                        <Row className="pt-3 mb-2">
                            <Col xs={6}>
                                <span className="nc-modal-custom-row uppercase">
                                    MONTH
                                </span>
                            </Col>
                            <Col xs={6}>
                                <span className="nc-modal-custom-row uppercase">
                                    BRANCH
                                </span>
                            </Col>
                        </Row>
                        <Row className="align-items-start">
                            <Col xs={6}>
                                <Form.Control
                                    type="text"
                                    name="remarks"
                                    disabled
                                    defaultValue={billing[0]?.monthYear}
                                    className="react-select-container"
                                />
                            </Col>
                            <Col xs={6}>
                                <Form.Control
                                    type="text"
                                    name="remarks"
                                    disabled
                                    defaultValue={billing[0]?.branch_name}
                                    className="react-select-container"
                                />
                            </Col>
                        </Row>
                    </Fragment>

                    {/* SALES TABLE */}
                    <div className="mt-4 pt-3 d-flex flex-column">
                        <Container fluid className="edit-purchased-items">
                            <>{renderSalesTable()}</>
                        </Container>
                    </div>
                    <div className="mt-4 pt-3 d-flex flex-column">
                        <Container fluid className="franchise-table-view">
                            <>{renderTable()}</>
                        </Container>
                    </div>

                    {(billing[0]?.status === "done" && billing[0]?.payment_status === "open_bill") && (
                        <>
                            <div>
                                <Row className="align-right pt-3">
                                    <Col xs={2} className="text-end">
                                        <span className="edit-label color-gray">
                                            Payment Type
                                        </span>
                                    </Col>
                                    <Col xs={1} className="text-end"></Col>
                                    <Col xs={3}>
                                        <Form.Check
                                            inline
                                            label="Cash"
                                            name="payment_type"
                                            value="cash"
                                            type="radio"
                                            defaultChecked={
                                                franchiseeInvoice.payment_type ===
                                                "cash"
                                            }
                                            onClick={(e) => {
                                                handleChange(e);
                                            }}
                                            disabled={edit}
                                        />
                                        <Form.Check
                                            inline
                                            label="Check"
                                            name="payment_type"
                                            type="radio"
                                            value="check"
                                            defaultChecked={
                                                franchiseeInvoice.payment_type ===
                                                "check"
                                            }
                                            onClick={(e) => {
                                                handleChange(e);
                                            }}
                                            disabled={edit}
                                        />
                                        <Form.Check
                                            inline
                                            label="Others"
                                            name="payment_type"
                                            value="others"
                                            defaultChecked={
                                                franchiseeInvoice.payment_type ===
                                                "others"
                                            }
                                            type="radio"
                                            onClick={(e) => {
                                                handleChange(e);
                                            }}
                                            disabled={edit}
                                        />
                                        <InputError
                                            isValid={
                                                isErrorPayment.payment_type
                                            }
                                            message={
                                                "Please select a payment method"
                                            }
                                        />
                                    </Col>
                                </Row>
                                <Row className="align-right pt-3">
                                    <Col xs={2} className="text-end">
                                        <span className="edit-label color-gray">
                                            Paid Amount
                                        </span>
                                    </Col>
                                    <Col xs={1} className="text-end">
                                        <span className="edit-label align-middle">
                                            PHP
                                        </span>
                                    </Col>
                                    <Col xs={3}>
                                        <Form.Control
                                            type="number"
                                            name="paid_amount"
                                            value={
                                                franchiseeInvoice.paid_amount
                                            }
                                            className="align-middle nc-modal-custom-text"
                                            onChange={(e) => handleChange(e)}
                                            disabled={edit}
                                        />
                                        <InputError
                                            isValid={isErrorPayment.paid_amount}
                                            message={"Amount is required"}
                                        />
                                    </Col>
                                </Row>
                            </div>
                        </>
                    )}
                    {/* CASH PAYMENT DETAILS */}
                    {franchiseeInvoice.payment_type === "cash" && (
                        <>
                            <div className="mt-5"></div>
                            <hr />
                            <div className="payment-header-wrapper mb-5">
                                <h5 className="payment-header">
                                    Payment Details
                                </h5>
                            </div>
                            <Row className="mt-4 mb-2">
                                <Col>
                                    <span className="edit-label">
                                        Payment Date
                                        <span className="color-red"> *</span>
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Control
                                        type="date"
                                        name="payment_date"
                                        className="nc-modal-custom-text"
                                        value={franchiseeInvoice.payment_date}
                                        onChange={(e) => handleChange(e)}
                                    />
                                    <InputError
                                        isValid={isErrorPayment.payment_date}
                                        message={"Payment date is required"}
                                    />
                                </Col>
                            </Row>
                            <Row className="mt-4 mb-2">
                                <Col>
                                    <span className="edit-label">
                                        Deposit Date
                                        <span className="color-red"> *</span>
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Control
                                        type="date"
                                        name="deposit_date"
                                        className="nc-modal-custom-text"
                                        defaultValue={
                                            franchiseeInvoice.deposit_date
                                        }
                                        onChange={(e) => handleChange(e)}
                                    />
                                </Col>
                            </Row>
                            <Row className="mt-4 mb-2">
                                <Col>
                                    <span className="edit-label">
                                        Deposited to
                                        <span className="edit-optional px-2"></span>
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Select
                                        type="text"
                                        name="to_bank_id"
                                        className="nc-modal-custom-text"
                                        value={franchiseeInvoice.to_bank_id}
                                        onChange={(e) => handleChange(e)}
                                    >
                                        <option value="">
                                            Select a bank...
                                        </option>
                                        {banks.map((data) => {
                                            return (
                                                <option value={data.id}>
                                                    {data.bank_name}
                                                </option>
                                            );
                                        })}
                                    </Form.Select>
                                    <InputError
                                        isValid={isErrorPayment.to_bank_id}
                                        message={"Deposited to is required is required"}
                                    />
                                </Col>
                            </Row>
                            <Row className="mt-4 mb-2">
                                <Col>
                                    <span className="edit-label">
                                        Term (days)
                                        <span className="edit-optional px-2">
                                            (Optional)
                                        </span>
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Control
                                        type="text"
                                        name="term_day"
                                        className="nc-modal-custom-text"
                                        value={franchiseeInvoice.term_day}
                                        onChange={(e) => handleChange(e)}
                                    />
                                </Col>
                            </Row>
                            <Row className="mt-4 mb-2">
                                <Col>
                                    <span className="edit-label">
                                        Remarks
                                        <span className="edit-optional px-2">
                                            (Optional)
                                        </span>
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Control
                                        as="textarea"
                                        name="remarks"
                                        value={franchiseeInvoice.remarks}
                                        className="nc-modal-custom-text"
                                        onChange={(e) => handleChange(e)}
                                    />
                                </Col>
                            </Row>
                        </>
                    )}

                    {/* CHECK PAYMENT DETAILS */}
                    {franchiseeInvoice.payment_type === "check" && (
                        <>
                            <div className="mt-5"></div>
                            <hr />
                            <div className="payment-header-wrapper mb-5">
                                <h5 className="payment-header">
                                    Payment Details
                                </h5>
                            </div>
                            <Row className="mt-4 mb-2">
                                <Col>
                                    <span className="edit-label">
                                        Payment Date
                                        <label className="badge-required">{` *`}</label>
                                    </span>
                                </Col>
                                <Col>
                                    <span className="edit-label">
                                        Check Date
                                        <label className="badge-required">{` *`}</label>
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Control
                                        type="date"
                                        name="payment_date"
                                        className="nc-modal-custom-text"
                                        defaultValue={
                                            franchiseeInvoice.payment_date
                                        }
                                        onChange={(e) => handleChange(e)}
                                    />
                                    <InputError
                                        isValid={isErrorPayment.payment_date}
                                        message={"Payment date is required"}
                                    />
                                </Col>
                                <Col>
                                    <Form.Control
                                        type="date"
                                        name="cheque_date"
                                        className="nc-modal-custom-text"
                                        value={franchiseeInvoice.cheque_date}
                                        onChange={(e) => handleChange(e)}
                                    />
                                    <InputError
                                        isValid={isErrorPayment.cheque_date}
                                        message={"Check date is required"}
                                    />
                                </Col>
                            </Row>

                            <Row className="mt-4 mb-2">
                                <Col>
                                    <span className="edit-label">
                                        Bank Name
                                        <label className="badge-required">{` *`}</label>
                                    </span>
                                </Col>
                                <Col>
                                    <span className="edit-label">
                                        Check Number
                                        <label className="badge-required">{` *`}</label>
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Control
                                        type="text"
                                        name="bank_name"
                                        className="nc-modal-custom-text"
                                        value={franchiseeInvoice.bank_name}
                                        onChange={(e) => handleChange(e)}
                                    />
                                    <InputError
                                        isValid={isErrorPayment.bank_name}
                                        message={"Bank name is required"}
                                    />
                                </Col>
                                <Col>
                                    <Form.Control
                                        type="text"
                                        name="cheque_number"
                                        className="nc-modal-custom-text"
                                        value={franchiseeInvoice.cheque_number}
                                        onChange={(e) => handleChange(e)}
                                    />
                                    <InputError
                                        isValid={isErrorPayment.cheque_number}
                                        message={"Cheque number is required"}
                                    />
                                </Col>
                            </Row>
                            <Row className="mt-4 mb-2">
                                <Col>
                                    <span className="edit-label">
                                        Deposit Date
                                        <span className="color-red"> *</span>
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Control
                                        type="date"
                                        name="deposit_date"
                                        className="nc-modal-custom-text"
                                        defaultValue={
                                            franchiseeInvoice.deposit_date
                                        }
                                        onChange={(e) => handleChange(e)}
                                    />
                                </Col>
                            </Row>
                            <Row className="mt-4 mb-2">
                                <Col>
                                    <span className="edit-label">
                                        Deposited to
                                        <span className="edit-optional px-2"></span>
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Select
                                        type="text"
                                        name="to_bank_id"
                                        className="nc-modal-custom-text"
                                        value={franchiseeInvoice.to_bank_id}
                                        onChange={(e) => handleChange(e)}
                                    >
                                        <option value="">
                                            Select a bank...
                                        </option>
                                        {banks.map((data) => {
                                            return (
                                                <option value={data.id}>
                                                    {data.bank_name}
                                                </option>
                                            );
                                        })}
                                    </Form.Select>
                                    <InputError
                                        isValid={isErrorPayment.to_bank_id}
                                        message={"Deposited to is required is required"}
                                    />
                                </Col>
                            </Row>
                            <Row className="mt-4 mb-2">
                                <Col>
                                    <span className="edit-label">
                                        Term (days)
                                        <span className="edit-optional px-2">
                                            (Optional)
                                        </span>
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Control
                                        type="text"
                                        name="term_day"
                                        className="nc-modal-custom-text"
                                        value={franchiseeInvoice.term_day}
                                        onChange={(e) => handleChange(e)}
                                    />
                                </Col>
                            </Row>
                            <Row className="mt-4 mb-2">
                                <Col>
                                    <span className="edit-label">
                                        Remarks
                                        <span className="edit-optional px-2">
                                            (Optional)
                                        </span>
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Control
                                        as="textarea"
                                        name="remarks"
                                        value={franchiseeInvoice.remarks}
                                        className="nc-modal-custom-text"
                                        onChange={(e) => handleChange(e)}
                                    />
                                </Col>
                            </Row>
                        </>
                    )}

                    {/* OTHERS PAYMENT DETAILS */}
                    {franchiseeInvoice.payment_type === "others" && (
                        <>
                            <div className="mt-5"></div>
                            <hr />
                            <div className="payment-header-wrapper mb-5">
                                <h5 className="payment-header">
                                    Payment Details
                                </h5>
                            </div>
                            <Row className="mt-4 mb-2">
                                <Col>
                                    <span className="edit-label">
                                        Payment Date
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Control
                                        type="date"
                                        name="payment_date"
                                        className="nc-modal-custom-text"
                                        defaultValue={
                                            franchiseeInvoice.payment_date
                                        }
                                        onChange={(e) => handleChange(e)}
                                    />
                                </Col>
                            </Row>
                            <Row className="mt-4 mb-2">
                                <Col>
                                    <span className="edit-label">
                                        Reference Number
                                        <label className="badge-required">{` *`}</label>
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Control
                                        type="text"
                                        name="reference_number"
                                        className="nc-modal-custom-text"
                                        value={
                                            franchiseeInvoice.reference_number
                                        }
                                        onChange={(e) => handleChange(e)}
                                    />
                                    <InputError
                                        isValid={
                                            isErrorPayment.reference_number
                                        }
                                        message={"Reference number is required"}
                                    />
                                </Col>
                            </Row>
                            <Row className="mt-4 mb-2">
                                <Col>
                                    <span className="edit-label">
                                        Deposit Date
                                        <span className="color-red"> *</span>
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Control
                                        type="date"
                                        name="deposit_date"
                                        className="nc-modal-custom-text"
                                        defaultValue={
                                            franchiseeInvoice.deposit_date
                                        }
                                        onChange={(e) => handleChange(e)}
                                    />
                                </Col>
                            </Row>
                            <Row className="mt-4 mb-2">
                                <Col>
                                    <span className="edit-label">
                                        Deposited to
                                        <span className="edit-optional px-2"></span>
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Select
                                        type="text"
                                        name="to_bank_id"
                                        className="nc-modal-custom-text"
                                        value={franchiseeInvoice.to_bank_id}
                                        onChange={(e) => handleChange(e)}
                                    >
                                        <option value="">
                                            Select a bank...
                                        </option>
                                        {banks.map((data) => {
                                            return (
                                                <option value={data.id}>
                                                    {data.bank_name}
                                                </option>
                                            );
                                        })}
                                    </Form.Select>
                                    <InputError
                                        isValid={isErrorPayment.to_bank_id}
                                        message={"Deposited to is required is required"}
                                    />
                                </Col>
                            </Row>
                            <Row className="mt-4 mb-2">
                                <Col>
                                    <span className="edit-label">
                                        Term (days)
                                        <span className="edit-optional px-2">
                                            (Optional)
                                        </span>
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Control
                                        type="text"
                                        name="term_day"
                                        className="nc-modal-custom-text"
                                        value={franchiseeInvoice.term_day}
                                        onChange={(e) => handleChange(e)}
                                    />
                                </Col>
                            </Row>
                            <Row className="mt-4 mb-2">
                                <Col>
                                    <span className="edit-label">
                                        Remarks
                                        <span className="edit-optional px-2">
                                            (Optional)
                                        </span>
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Control
                                        as="textarea"
                                        name="remarks"
                                        value={franchiseeInvoice.remarks}
                                        className="nc-modal-custom-text"
                                        onChange={(e) => handleChange(e)}
                                    />
                                </Col>
                            </Row>
                        </>
                    )}

                    <Container
                        fluid
                        className="PI-payment-info-wrapper mt-5 py-3 px-3"
                    >
                        <h5 className="PI-payment-info">PAYMENT HISTORY</h5>
                        <div className="sales-tbl justify-content-center">
                            <PaymentTable
                                tableHeaders={[
                                    "PAYMENT DATE",
                                    "TYPE",
                                    "PAID AMOUNT",
                                    "DEPOSIT DATE",
                                    "DEPOSITED TO",
                                    "ADDED BY",
                                    "REMARKS",
                                ]}
                                headerSelector={[
                                    "payment_date",
                                    "payment_type",
                                    "paid_amount",
                                    "deposit_date",
                                    "to_bank_name",
                                    "added_by_name",
                                    "remarks",
                                ]}
                                tableData={paymentInfo}
                            />
                        </div>
                    </Container>

                    <div className="d-flex justify-content-end pt-5 pb-3">
                        <button
                            type="button"
                            className="button-secondary me-3"
                            onClick={() => navigate("/franchisebilling")}
                        >
                            Close
                        </button>
                        <button
                            type="button"
                            className="button-primary me-3"
                            onClick={handleShowPrintModal}
                        >
                            Print
                        </button>

                        {(billing[0]?.status === "done" && billing[0]?.payment_status === "open_bill") && (
                            <>
                                <button
                                    type="button"
                                    className="button-primary me-3"
                                    onClick={() => addPayment()}
                                >
                                    Submit
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <FranchiseModal
                show={showPrintModal}
                hide={handleClosePrintModal}
                type="print"
                page="sales trancking sheet"
                handler={handlePrintFranchiseBilling}
            />
            <div
                className="print-container px-3 py-2 display-none"
                id="printablediv"
            >
                <div className="d-flex justify-content-center py-1">
                    <img src={cleanLogo} className="print-logo" />
                </div>
                <div className="d-flex justify-content-center py-1 print-label">
                    MONTHLY SALES REPORT
                </div>
                <div className="print-body mt-3">
                    <Container fluid>
                        <Row className="review-container py-3">
                            <Col>
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        STORE:
                                    </Col>
                                    <Col xs={7} className="print-data">
                                        {billing[0]?.branch_name}
                                    </Col>
                                </div>
                            </Col>
                            <Col>
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        MONTH:
                                    </Col>
                                    <Col xs={7} className="print-data">
                                        {billing[0]?.monthYear}
                                    </Col>
                                </div>
                            </Col>
                        </Row>
                    </Container>

                    
                    <div className="mt-4 pt-3 d-flex flex-column">
                        <Container fluid className="franchise-table-view">
                            <>{renderPrintTable()}</>
                        </Container>
                    </div>
                    <div className="print-signatures">
                        <div className="d-flex align-items-center justify-content-end flex-column">
                            <span className="text-center text-uppercase print-label fw-bold">
                                {getName()}
                            </span>
                        </div>
                        <div className="d-flex align-items-center justify-content-center flex-column">
                            <img src={signature} className="print-logo" />
                            <span className="text-center text-uppercase print-label fw-bold">
                                KRISTOFFER CHAN
                            </span>
                        </div>
                    </div>
                    <div className="print-signatories pb-4 mb-4">
                        <span>Prepared by</span>
                        <span>Approved by</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

FranchiseBillingView.defaultProps = {
    add: false,
    edit: false,
};

export default FranchiseBillingView;
