import React, { Fragment, useState, useEffect } from "react";
import { Button, Col, Container, Form, Row, Table } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../../Components/Navbar/Navbar";
import trash from "./../../../../Assets/Images/trash.png";
import Select from "react-select";
import "../../PurchaseOrders/PurchaseOrders.css";
import "../PaySuppliers.css";
import { formatDateNoTime } from "../../../../Helpers/Utils/Common";
import {
    getAllSuppliers,
    getSupplier,
    createSupplier,
} from "../../../../Helpers/apiCalls/suppliersApi";
import {
    formatDate,
    numberFormat,
    refreshPage,
    TokenExpiry,
    toastStyle,
} from "../../../../Helpers/Utils/Common";
import { createPurchaseOrder } from "../../../../Helpers/apiCalls/Purchases/purchaseOrderApi";
import { createBank } from "../../../../Helpers/apiCalls/Manage/Banks";
import { getAllCheckTemplates } from "../../../../Helpers/apiCalls/Manage/CheckTemplates";
import { validateBanks } from "../../../../Helpers/Validation/Manage/BanksValidation";
import ReactLoading from "react-loading";
import { getAllBanks } from "../../../../Helpers/apiCalls/banksAPi";
import {
    validatePaymentListCash,
    validatePaymentListCheck,
    validatePaymentListBank,
} from "../../../../Helpers/Validation/Supplies/PaymentListValidation";
import InputError from "../../../../Components/InputError/InputError";
import {
    createSeBankPayment,
    createSeCashPayment,
    createSeCheckPayment,
    getSingleBankSe,
    getSingleCashSe,
    getSingleCheckSe,
    updateBankPayment,
    updateCashPayment,
    updateCheckPayment,
} from "../../../../Helpers/apiCalls/Expenses/sePaymentsListApi";
import toast from "react-hot-toast";
import {
    getAllSeReceives,
    getSingleSeReceive,
    getOpenSeReceives,
} from "../../../../Helpers/apiCalls/receiveApi";
import AddModal from "../../../../Components/Modals/AddModal";
import DatePicker from "react-datepicker";
import Moment from "moment";
import { getAllEmployees } from "../../../../Helpers/apiCalls/employeesApi";
import { getAllVendors } from "../../../../Helpers/apiCalls/Manage/Vendors";
import { getAllVendorsPotato } from "../../../../Helpers/apiCalls/PotatoCorner/VendorsApi";

function FormPaySupplier({ add, edit }) {
    const { id, type } = useParams();
    let navigate = useNavigate();
    const [isClicked, setIsClicked] = useState(false);
    const [datetoday, setDatetoday] = useState("");
    const [selectedEntry, setSelectedEntry] = useState("");
    const [inactive, setInactive] = useState(true);
    const [transactionFee, setTransactionFee] = useState("0");
    const [grandTotal, setGrandTotal] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [employees, setEmployees] = useState([]);
    async function fetchEmployees() {
        setEmployees([]);
        const response = await getAllEmployees();
        let result = response.data.data.map((data) => {
            var _middleName = data.middle_name || "";
            return {
                value: data.id,
                label:
                    data.first_name + " " + _middleName + " " + data.last_name,
                name: "acknowledged_by",
            };
        });
        setEmployees(result);
    }
    const [newPayment, setNewPayment] = useState({
        supplier_id: "",
        grand_total: 0,
        payment_date: "",
        check_date: "",
        issued_date: "",
        to_account_no: "",
        to_account_name: "",
        from_account_no: "",
        from_account_name: "",
    });
    const [checkTemplateData, setCheckTemplateData] = useState([]);
    const [employeeValue, setEmployeeValue] = useState({
        name: "acknowledged_by",
        label: "",
        value: "",
    });
    const [fromBankValue, setFromBankValue] = useState({
        name: "bank_from",
        label: "",
        value: "",
    });
    const [toBankValue, setToBankValue] = useState({
        name: "bank_to",
        label: "",
        value: "",
    });

    if (
        (type === "cash" || type === "bank") &&
        (newPayment.payment_date === "") & add
    ) {
        setNewPayment({
            payment_date: Moment().format("YYYY-MM-DD"),
            issued_date: Moment().format("YYYY-MM-DD"),
        });
    }

    if (
        type === "check" &&
        newPayment.check_date === "" &&
        (newPayment.issued_date === "") & add
    ) {
        setNewPayment({
            check_date: Moment().format("YYYY-MM-DD"),
            issued_date: Moment().format("YYYY-MM-DD"),
        });
    }

    function handleTransactionFeeChange(e) {
        var value = e.target.value;
        if (value === "") setTransactionFee("");
        else setTransactionFee(value);
        setNewPayment({ ...newPayment, transaction_fee: value });
    }

    const [items, setItems] = useState([]);
    const [entries, setEntries] = useState([]);
    const [entriesList, setEntriesList] = useState([]);
    const [remove, setRemove] = useState("");

    //ERROR HANDLING
    const [isError, setIsError] = useState({
        payment_date: false,
        supplier_id: false,
        payee: false,
        acknowledged_by: false,
        list: false,
        listInfo: false,
    });

    const [isErrorCheck, setIsErrorCheck] = useState({
        supplier_id: false,
        bank_id: false,
        check_date: false,
        check_no: false,
        issued_date: false,
        payee: false,
        acknowledged_by: false,
        list: false,
        listInfo: false,
    });

    const [isErrorBank, setIsErrorBank] = useState({
        payment_date: false,
        bank_from: false,
        from_account_no: false,
        from_account_name: false,
        bank_to: false,
        to_account_no: false,
        to_account_name: false,
        reference_no: false,
        supplier_id: false,
        payee: false,
        acknowledged_by: false,
        list: false,
        listInfo: false,
    });

    //ERROR HANDLING
    const [isErrorAddBank, setIsErrorAddBank] = useState({
        bank_name: false,
        check_template_id: false,
    });

    // ADD
    const [showAddBankModal, setShowAddBankModal] = useState(false);
    const handleShowAddBankModal = () => setShowAddBankModal(true);
    const handleCloseAddBankModal = () => setShowAddBankModal(false);

    // INVOICE REMOVAL HANDLER
    function handleRemoveItem(e, id) {
        if (id === 0) {
            setSelectedEntry(id);
        } else {
            setSelectedEntry(id - 1);
        }
        setRemove(e.target.value);
        const { name, label, value } = e;
        const rowId = id;
        const newItemList = [...items];
        newItemList.splice(rowId, 1);
        setItems(newItemList);

        var returnitem = entriesList.filter(
            (data) => data.value === e.target.value
        );
        var entriescopy = [...entries];

        entriescopy.push(returnitem[0]);

        entriescopy.sort((a, b) => {
            return a.value - b.value;
        });

        entriescopy.filter((v, i) => {
            return entriescopy.map((val) => val.value).indexOf(v.value) == i;
        });

        setEntries(entriescopy);
    }

    function AddItem() {
        const newItem = { se_ids: "", amount: 0, date: "" };
        setItems((prevItems) => [...prevItems, newItem]);
    }

    const [showLoader, setShowLoader] = useState(false);

    function handleItemChange(e, id) {
        setSelectedEntry(id);
        const { name, label, value } = e;

        if (name === "se_ids") {
            if (selectedEntry === id) {
                var entryData = entries.filter((entry) => {
                    return entry.value === value;
                });
                setEntries(entriesList.filter((data) => data.value != value));
            } else {
                var entryData = entries.filter((entry) => {
                    return entry.value === value;
                });
                setEntries(entries.filter((data) => data.value != value));
            }

            var newItemList = items;
            var newEntries = newItemList.map((item, index) => {
                if (index === id) {
                    var info = {
                        name: name,
                        label: label,
                        value: value,
                    };
                    item.entry = info;
                    item.se_ids = entryData[0].value;
                    item.invoice_date = formatDateNoTime(entryData[0].invoice_date);
                    item.amount = entryData[0].amount;
                }
                return item;
            });
            setItems(newEntries);
        } else {
            const { name, value } = e.target;
            const list = [...items];

            if (name === "amount") {
                items.map((item, index) => {
                    if (index === id) {
                        item[name] = value;
                    }
                });
            }
            setItems(list);
        }
        // console.log(items);
    }

    const [supplierDetails, setSupplierDetails] = useState({
        trade_name: "",
        trade_address: "",
        bir_name: "",
        bir_address: "",
        tin: "",
        terms: "",
        requirements: "",
        phone_no: "",
        email: "",
        contact_person: "",
        bank_primary: "",
        bank_alternate: "",
        payee: "",
    });

    const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
    const handleShowAddSupplierModal = () => setShowAddSupplierModal(true);
    const handleCloseAddSupplierModal = () => {
        setShowAddSupplierModal(false);
    };

    function renderTable() {
        return (
            <Table>
                <thead>
                    <tr>
                        <th>Entry</th>
                        <th>Invoice Date</th>
                        <th>Invoice Details</th>
                        <th>Amount</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => {
                        return (
                            <tr key={index}>
                                <td className="select-cont">
                                    <Select
                                        className="text-start react-select-container"
                                        classNamePrefix="react-select"
                                        placeholder="Select Invoice..."
                                        options={entries}
                                        name="entry"
                                        value={item.entry}
                                        onChange={(e) =>
                                            handleItemChange(
                                                e,
                                                index
                                            )
                                        }
                                    />
                                    <InputError
                                        isValid={isError.listInfo}
                                        message={"Invoice is required"}
                                    />
                                    <InputError
                                        isValid={isErrorCheck.listInfo}
                                        message={"Invoice is required"}
                                    />
                                    <InputError
                                        isValid={isErrorBank.listInfo}
                                        message={"Invoice is required"}
                                    />
                                </td>
                                <td>
                                    {item.invoice_date
                                        ? item.invoice_date
                                        : ""}
                                </td>
                                <td>
                                    <button
                                        type="button"
                                        className="button-primary view-btn me-3"
                                        onClick={() =>
                                            handleViewPayment(
                                                item.entry.value,
                                                0,
                                                type
                                            )
                                        }
                                    >
                                        View
                                    </button>
                                </td>
                                <td className="d-flex align-contents">
                                    <Col>
                                        <Form.Control
                                            type="number"
                                            name="amount"
                                            value={item.amount}
                                            onChange={(e) =>
                                                handleItemChange(e, index)
                                            }
                                        />
                                        <InputError
                                            isValid={isError.listInfo}
                                            message={"Amount is required"}
                                        />
                                        <InputError
                                            isValid={isErrorCheck.listInfo}
                                            message={"Amount is required"}
                                        />
                                        <InputError
                                            isValid={isErrorBank.listInfo}
                                            message={"Invoice is required"}
                                        />
                                    </Col>
                                </td>
                                <td>
                                    <img
                                        src={trash}
                                        onClick={(e) => {
                                            item.entry
                                                ? handleRemoveItem(
                                                      {
                                                          target: {
                                                              value: item.entry
                                                                  .value,
                                                              name: "id",
                                                          },
                                                      },
                                                      index
                                                  )
                                                : handleRemoveItem(e, index);
                                        }}
                                        className="cursor-pointer"
                                    />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        );
    }

    function handleViewPayment(id, bank, type) {
        window.open("/se/purchaseinvoices/print/" + id, "_blank");
    }

    const [suppliers, setSuppliers] = useState([]);
    async function fetchSuppliers() {
        setSuppliers([]);

        const response = await getAllSuppliers();
        const response2 = await getAllVendors();

        if (response.error) {
            TokenExpiry(response);
        } else {
            var suppliers = response.data.data.sort((a, b) =>
                a.trade_name > b.trade_name
                    ? 1
                    : b.trade_name > a.trade_name
                    ? -1
                    : 0
            );

            suppliers.map((supplier) => {
                var info = {};

                info.name = "supplier_id";
                info.label = supplier.trade_name;
                info.value = "supplier-" + supplier.id;
                info.payee = supplier.payee;
                info.type = "supplier";

                setSuppliers((prev) => [...prev, info]);
            });
        }

        if (response2.error) {
            TokenExpiry(response2);
        } else {
            var vendors = response2.response.data.sort((a, b) =>
                a.trade_name > b.trade_name
                    ? 1
                    : b.trade_name > a.trade_name
                    ? -1
                    : 0
            );

            vendors.map((vendor) => {
                var info = {};

                info.name = "supplier_id";
                info.label = vendor.trade_name;
                info.value = "vendor-" + vendor.id;
                info.payee = vendor.payee;
                info.type = "vendor";

                setSuppliers((prev) => [...prev, info]);
            });
        }
    }

    const [banks, setBanks] = useState([]);
    const [fromBanks, setFromBanks] = useState([]);
    const [toBanks, setToBanks] = useState([]);
    async function fetchBanks() {
        const response = await getAllBanks();
        if (response.data) {
            if (response.data.status === "success") {
                var data = response.data.data;
                var allBanks = data.map((bank) => {
                    var info = {};
                    info.name = "bank_id";
                    info.label = bank.bank_name;
                    info.value = bank.id;
                    return info;
                });
                setBanks(allBanks);

                var fromBanks = data.map((bank) => {
                    var info = {};
                    info.name = "bank_from";
                    info.label = bank.bank_name;
                    info.value = bank.id;
                    return info;
                });
                setFromBanks(fromBanks);

                var toBanks = data.map((bank) => {
                    var info = {};
                    info.name = "bank_to";
                    info.label = bank.bank_name;
                    info.value = bank.id;
                    return info;
                });
                setToBanks(toBanks);
            }
        }
    }

    const [supplierValue, setSupplierValue] = useState({
        name: "supplier_id",
        label: "",
        value: "",
        payee: "",
    });
    const [bankValue, setBankValue] = useState({
        name: "bank_id",
        label: "",
        value: "",
    });
    function handleSelectChange(e) {
        console.log(e)
        const newList = newPayment;
        newList[e.name] = e.value;
        setNewPayment(newList);

        if (e.name === "supplier_id") {
            if (e.value.split("-")[0] === "supplier") {
                setSupplierValue({
                    name: e.name,
                    label: e.label,
                    value: e.value,
                    payee: e.payee,
                });
                fetchReceives({
                    supplier_id: e.value.split("-")[1],
                    vendor_id: "",
                });
                const newList = newPayment;
                newList["supplier_id"] = e.value.split("-")[1];
                newList["vendor_id"] = "";
                setNewPayment(newList);
            } else if (e.value.split("-")[0] === "vendor") {
                setSupplierValue({
                    name: e.name,
                    label: e.label,
                    value: e.value,
                    payee: e.payee,
                });
                fetchReceives({
                    vendor_id: e.value.split("-")[1],
                    supplier_id: "",
                });
                const newList = newPayment;
                newList["vendor_id"] = e.value.split("-")[1];
                newList["supplier_id"] = "";
                setNewPayment(newList);
            }
            if (e.payee != undefined || e.payee != "") {
                setNewPayment({
                    ...newPayment,
                    payee: e.payee,
                });
            } else {
                setNewPayment({
                    ...newPayment,
                    payee: "N/A",
                });
            }
        } else if (e.name === "bank_id") {
            setBankValue({ name: e.name, label: e.label, value: e.value });
        } else if (e.name === "bank_from") {
            setFromBankValue({ name: e.name, label: e.label, value: e.value });
            setNewPayment({
                ...newPayment,
                bank_from: e.value,
            });
        } else if (e.name === "bank_to") {
            setToBankValue({ name: e.name, label: e.label, value: e.value });
            setNewPayment({
                ...newPayment,
                bank_to: e.value,
            });
        } else if (e.name === "acknowledged_by") {
            setEmployeeValue({ name: e.name, label: e.label, value: e.value });
            setNewPayment({
                ...newPayment,
                acknowledged_by: e.value,
            });
        }
    }

    function handlePayChange(e) {
        const { name, value } = e.target;
        const newList = newPayment;
        newList[name] = value;
        setNewPayment(newList);
    }

    async function savePayment() {
        if (isClicked) {
            return;
        }
        if (type === "check") {
            console.log(newPayment)
            if (validatePaymentListCheck(newPayment, items, setIsErrorCheck)) {
                setIsClicked(true);
                const check = await createSeCheckPayment(newPayment, items);
                if (check.data?.status === "success") {
                    toast.success(check.data.response, { style: toastStyle() });
                    setTimeout(() => {
                        navigate("/se/paysuppliers");
                        refreshPage();
                    }, 1000);
                } else {
                    toast.error(check.error.data.messages.response, {
                        style: toastStyle(),
                    });
                    refreshPage();
                }
            } else {
                toast.error("Please fill in all required fields", {
                    style: toastStyle(),
                });
            }
        } else if (type === "cash") {
            if (validatePaymentListCash(newPayment, items, setIsError)) {
                setIsClicked(true);
                const cash = await createSeCashPayment(newPayment, items);
                if (cash) {
                    if (cash.data.status === "success") {
                        toast.success(cash.data.response, {
                            style: toastStyle(),
                        });
                        setTimeout(() => {
                            navigate("/se/paysuppliers");
                        }, 1000);
                    } else {
                        toast.error(cash.data.response, {
                            style: toastStyle(),
                        });
                    }
                }
            } else {
                toast.error("Please fill in all required fields", {
                    style: toastStyle(),
                });
            }
        } else if (type === "bank") {
            if (validatePaymentListBank(newPayment, items, setIsErrorBank)) {
                setIsClicked(true);
                const bank = await createSeBankPayment(newPayment, items);
                if (bank) {
                    if (bank.data.status === "success") {
                        toast.success(bank.data.response, {
                            style: toastStyle(),
                        });
                        setTimeout(() => {
                            navigate("/se/paysuppliers");
                            // refreshPage();
                        }, 1000);
                    } else {
                        toast.error(bank.data.response, {
                            style: toastStyle(),
                        });
                        // refreshPage();
                    }
                }
            } else {
                toast.error("Please fill in all required fields", {
                    style: toastStyle(),
                });
            }
        }
    }

    const [addBankData, setAddBankData] = useState({
        bank_name: "",
        check_template_id: "",
    });

    const handleAddChange = (e) => {
        const { name, value } = e.target;
        setAddBankData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    async function addBank() {
        if (validateBanks(addBankData, setIsErrorAddBank)) {
            const response = await createBank(addBankData);

            if (response) {
                if (response?.data?.status === "success") {
                    toast.success(response.data.response, {
                        style: toastStyle(),
                    });
                    setTimeout(() => refreshPage(), 1000);
                } else {
                    toast.error(response.error.data.messages.error, {
                        style: toastStyle(),
                    });
                }
            }
        } else {
            toast.error("Please fill in all required fields", {
                style: toastStyle(),
            });
        }
    }

    async function fetchCheckTemplates() {
        setCheckTemplateData([]);
        const response = await getAllCheckTemplates();

        if (response) {
            let result = response.data.data.data.map((a) => {
                return {
                    id: a.id,
                    name: a.name,
                };
            });
            setCheckTemplateData(result);
        }
    }

    /** POST API - EDIT EXISTING PAYMENT **/
    async function editPayment() {
        if (type === "check") {
            if (validatePaymentListCheck(newPayment, items, setIsErrorCheck)) {
                const response = await updateCheckPayment(
                    newPayment,
                    items,
                    id
                );

                if (response.data) {
                    toast.success("Check payment updated successfully!", {
                        style: toastStyle(),
                    });
                    setTimeout(() => {
                        navigate("/se/paysuppliers");
                        refreshPage();
                    }, 1000);
                } else {
                    toast.error("Error updating check payment", {
                        style: toastStyle(),
                    });
                    setTimeout(() => refreshPage(), 1000);
                }
            } else {
                toast.error("Please fill in all required fields", {
                    style: toastStyle(),
                });
            }
        } else if (type === "cash") {
            if (validatePaymentListCash(newPayment, items, setIsError)) {
                const response = await updateCashPayment(newPayment, items, id);
                if (response.data) {
                    toast.success("Cash payment updated successfully!", {
                        style: toastStyle(),
                    });
                    setTimeout(() => {
                        navigate("/se/paysuppliers");
                        refreshPage();
                    }, 1000);
                } else {
                    toast.error("Error updating cash payment", {
                        style: toastStyle(),
                    });
                    setTimeout(() => refreshPage(), 1000);
                }
            } else {
                toast.error("Please fill in all required fields", {
                    style: toastStyle(),
                });
            }
        } else if (type === "bank") {
            if (validatePaymentListBank(newPayment, items, setIsErrorBank)) {
                const response = await updateBankPayment(
                    newPayment,
                    items,
                    transactionFee,
                    id
                );

                if (response.data) {
                    toast.success("Bank payment updated successfully!", {
                        style: toastStyle(),
                    });
                    setTimeout(() => {
                        navigate("/se/paysuppliers");
                        refreshPage();
                    }, 1000);
                } else {
                    toast.error("Error updating bank payment", {
                        style: toastStyle(),
                    });
                    setTimeout(() => refreshPage(), 1000);
                }
            } else {
                toast.error("Please fill in all required fields", {
                    style: toastStyle(),
                });
            }
        }
    }

    function handleSubmit() {
        if (add) savePayment();
        if (edit) editPayment();
    }

    async function fetchSingleSuppliersPayment(id) {
        if (type === "cash") {
            const cash = await getSingleCashSe(id);
            if (cash.data.status === "success") {
                var data = cash.data.data[0];
                var dataEntries = data.cash_entries;
                if (data.supplier_id !== null) {
                    fetchReceives({
                        supplier_id: data.supplier_id,
                        vendor_id: "",
                    });
                } else {
                    fetchReceives({
                        vendor_id: data.vendor_id,
                        supplier_id: "",
                    });
                }
                setNewPayment({
                    payment_date: data.payment_date,
                    supplier_id: data.supplier_id,
                    payee: data.payee,
                    particulars: data.particulars,
                    acknowledged_by: data.acknowledged_by,
                });
                var cashEntries = dataEntries.map((entry) => {
                    var info = {};
                    info.entry = {
                        name: "receive_id",
                        label:
                            "Invoice No. " + entry.se_id + " - " + entry.amount,
                        value: parseInt(entry.se_id),
                    };
                    info.amount = entry.amount;
                    info.invoice_date = formatDateNoTime(entry.added_on);

                    return info;
                });
                setItems(cashEntries);
                setSupplierValue({
                    name: "supplier_id",
                    label: data.supplier_name,
                    value: parseInt(data.supplier_id),
                    payee: data.payee,
                });
            }
        } else if (type === "check") {
            const check = await getSingleCheckSe(id);
            if (check.data.status === "success") {
                var data = check.data.data[0];
                var dataEntries = data.check_entries;
                if (data.supplier_id !== null) {
                    fetchReceives({
                        supplier_id: data.supplier_id,
                        vendor_id: "",
                    });
                } else {
                    fetchReceives({
                        vendor_id: data.vendor_id,
                        supplier_id: "",
                    });
                }
                setNewPayment({
                    supplier_id: data.supplier_id,
                    bank_id: data.bank_id,
                    bank_name: data.bank_name,
                    check_no: data.check_no,
                    check_date: data.check_date,
                    payee: data.payee,
                    particulars: data.particulars,
                    acknowledged_by: data.acknowledged_by,
                    issued_date: Moment(data.issued_date).format("YYYY-MM-DD"),
                    sig_1: data.sig_1,
                    sig_2: data.sig_2,
                });
                var checkEntries = dataEntries.map((entry) => {
                    var info = {};
                    info.entry = {
                        name: "receive_id",
                        label:
                            "Invoice No. " + entry.se_id + " - " + entry.amount,
                        value: parseInt(entry.se_id),
                    };
                    info.amount = entry.amount;
                    info.invoice_date = formatDateNoTime(entry.added_on);

                    return info;
                });
                setItems(checkEntries);
                setSupplierValue({
                    name: "supplier_id",
                    label: data.supplier_name,
                    value: parseInt(data.supplier_id),
                    payee: data.payee,
                });
                setBankValue({
                    name: "bank_id",
                    label: data.bank_name,
                    value: parseInt(data.bank_id),
                });
            }
        } else if (type === "bank") {
            const bank = await getSingleBankSe(id);
            if (bank.data.status === "success") {
                var data = bank.data.data[0];
                var dataEntries = data.bank_entries;
                if (data.supplier_id !== null) {
                    fetchReceives({
                        supplier_id: data.supplier_id,
                        vendor_id: "",
                    });
                } else {
                    fetchReceives({
                        vendor_id: data.vendor_id,
                        supplier_id: "",
                    });
                }
                setNewPayment({
                    payment_date: data.payment_date,
                    transaction_fee: data.transaction_fee,
                    reference_no: data.reference_no,
                    amount: data.amount,
                    payee: data.payee,
                    particulars: data.particulars,
                    acknowledged_by: data.acknowledged_by,
                    supplier_id: data.supplier_id,

                    bank_from: data.bank_from,
                    from_account_no: data.from_account_no,
                    from_account_name: data.from_account_name,

                    bank_to: data.bank_to,
                    to_account_no: data.to_account_no,
                    to_account_name: data.to_account_name,
                });
                var bankEntries = dataEntries.map((entry) => {
                    var info = {};
                    info.entry = {
                        name: "receive_id",
                        label:
                            "Invoice No. " + entry.se_id + " - " + entry.amount,
                        value: parseInt(entry.se_id),
                    };
                    info.amount = entry.amount;
                    info.invoice_date = formatDateNoTime(entry.added_on);

                    return info;
                });
                setItems(bankEntries);
                setSupplierValue({
                    name: "supplier_id",
                    label: data.supplier_name,
                    value: parseInt(data.supplier_id),
                    payee: data.payee,
                });
                setFromBankValue({
                    name: "bank_from",
                    label: data.bank_from_name,
                    value: parseInt(data.bank_from),
                });
                setToBankValue({
                    name: "bank_to",
                    label: data.bank_to_name,
                    value: parseInt(data.bank_to),
                });
                setTransactionFee(data.transaction_fee);
                setGrandTotal(
                    parseFloat(data.amount) + parseFloat(data.transaction_fee)
                );
            }
        }
    }

    async function fetchInvoiceLabel(se_ids) {
        const response = await getSingleSeReceive(se_ids);
    }

    async function fetchReceives(data) {
        const response = await getOpenSeReceives(data, "open");

        if (response.data) {
            if (response.data.status === "success") {
                var data = response.data.data;
                var clean = data.map((entry) => {
                    var info = {};
                    info.name = "se_ids";
                    info.value = entry.id;
                    info.label =
                        "Invoice No. " + entry.id + " - " + entry.grand_total;
                    info.entry = {
                        name: "se_ids",
                        value: entry.id,
                        label:
                            "Invoice No. " +
                            entry.id +
                            " - " +
                            entry.grand_total,
                    };
                    info.invoice_date = formatDateNoTime(entry.purchase_date);
                    info.amount = entry.balance;
                    return info;
                });
                setEntries(clean);
                setEntriesList(clean);
            } else {
                setEntries([]);
            }
        } else {
            setEntries([]);
        }
    }

    const [newEntry, setNewEntry] = useState({
        name: "",
        value: "",
        label: "",
        entry: {},
        invoice_date: "",
        amount: "",
    });

    async function fetchSingleReceive(receive_id) {
        const response = await getSingleSeReceive(receive_id);

        if (response.data) {
            if (response.data.status === "success") {
                var data = response.data.data[0];
                setNewEntry({
                    name: "se_ids",
                    value: data.id,
                    label: "Invoice No. " + data.id + " - " + data.grand_total,
                    entry: {
                        name: "se_ids",
                        value: data.id,
                        label:
                            "Invoice No. " + data.id + " - " + data.grand_total,
                    },
                    invoice_date: formatDateNoTime(data.purchase_date),
                    amount: data.balance,
                });
                setEntries((prevItems) => [...prevItems, newEntry]);
            } else {
                setNewEntry([]);
            }
        }
    }

    async function handleAddSupplier() {
        const response = await createSupplier(supplierDetails);
        if (response.response) {
            toast.success(response.response.response, { style: toastStyle() });
            handleCloseAddSupplierModal();
        } else {
            toast.error("Error Creating New Supplier", { style: toastStyle() });
        }
    }

    React.useEffect(() => {
        if (edit) {
            fetchSingleSuppliersPayment(id);
        }
        fetchSuppliers();
        fetchBanks();
        fetchCheckTemplates();
        fetchEmployees();
    }, []);

    React.useEffect(() => {
        fetchSingleReceive(remove);
    }, [remove]);

    useEffect(() => {
        var total = 0;
        for (var i = 0; i < items.length; i++) {
            total += parseFloat(items[i].amount);
        }

        setTotalAmount(total);
        if (transactionFee === "") {
            setGrandTotal(total);
        } else {
            setGrandTotal(total + parseFloat(transactionFee));
        }
    }, [items]);

    useEffect(() => {
        if (transactionFee === "") {
            setGrandTotal(totalAmount);
        } else {
            setGrandTotal(totalAmount + parseFloat(transactionFee));
        }
    }, [transactionFee]);

    return (
        <div>
            <div className="page">
                <Navbar
                    onCollapse={(inactive) => {
                        setInactive(inactive);
                    }}
                    active={"SUPPLIES"}
                />
            </div>
            <div className={`container ${inactive ? "inactive" : "active"}`}>
                <div className="row">
                    <h1 className="page-title mb-4">PAY SUPPLIER ({type})</h1>
                </div>


                <div className="edit-form">
                    {type === "check" && (
                        <Fragment>
                            <Row className="pt-3 mb-2">
                                <Col>
                                    <span className="nc-modal-custom-row uppercase">
                                        Bank
                                        <label className="badge-required">{` *`}</label>
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Select
                                        name="bank_from"
                                        className="react-select-container nc-modal-custom-row-grey"
                                        classNamePrefix="react-select"
                                        placeholder="Select Bank..."
                                        value={bankValue}
                                        options={banks}
                                        onChange={(e) => handleSelectChange(e)}
                                    />
                                    <InputError
                                        isValid={isErrorCheck.bank_id}
                                        message={"Bank is required"}
                                    />
                                </Col>
                            </Row>
                            <Row className="click-to-add-prompt f-right mb-0">
                                <Col>
                                    <p className="add-supplier-prompt mb-0">
                                        BANK NOT FOUND?{" "}
                                        <a
                                            className="add-supplier-label"
                                            onClick={handleShowAddBankModal}
                                        >
                                            Click to add bank
                                        </a>
                                    </p>
                                </Col>
                            </Row>
                            <Row className="pt-3 mb-2 mt-4">
                                <Col xs={4}>
                                    <span className="nc-modal-custom-row uppercase">
                                        Check Date
                                        <label className="badge-required">{` *`}</label>
                                    </span>
                                </Col>
                                <Col xs={4}>
                                    <span className="nc-modal-custom-row uppercase">
                                        Check No.
                                        <label className="badge-required">{` *`}</label>
                                    </span>
                                </Col>
                                <Col xs={4}>
                                    <span className="nc-modal-custom-row uppercase">
                                        Issue Date
                                        <label className="badge-required">{` *`}</label>
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={4}>
                                    <Form.Control
                                        type="date"
                                        name="check_date"
                                        defaultValue={newPayment.check_date}
                                        className="nc-modal-custom-row-grey"
                                        onChange={(e) => handlePayChange(e)}
                                    />
                                    <InputError
                                        isValid={isErrorCheck.check_date}
                                        message={"Check date is required"}
                                    />
                                </Col>
                                <Col xs={4}>
                                    <Form.Control
                                        type="text"
                                        name="check_no"
                                        className="nc-modal-custom-input form-control"
                                        defaultValue={newPayment.check_no}
                                        onChange={(e) => handlePayChange(e)}
                                    />
                                    <InputError
                                        isValid={isErrorCheck.check_no}
                                        message={"Check Number is required"}
                                    />
                                </Col>
                                <Col xs={4}>
                                    <Form.Control
                                        type="date"
                                        name="issued_date"
                                        defaultValue={newPayment.issued_date}
                                        className="nc-modal-custom-row-grey"
                                        onChange={(e) => handlePayChange(e)}
                                    />
                                    <InputError
                                        isValid={isErrorCheck.issued_date}
                                        message={"Issued Date is required"}
                                    />
                                </Col>
                            </Row>
                            <Row className="pt-3 mb-2">
                                <Col>
                                    <span className="nc-modal-custom-row uppercase">
                                        Supplier Name
                                        <label className="badge-required">{` *`}</label>
                                    </span>
                                </Col>
                                <Col>
                                    <span className="nc-modal-custom-row uppercase">
                                        Payee
                                        <label className="badge-required">{` *`}</label>
                                    </span>
                                </Col>
                            </Row>
                            <Row className="align-items-start">
                                <Col>
                                    <Row>
                                        <Select
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                            placeholder="Select Supplier..."
                                            value={supplierValue}
                                            options={suppliers}
                                            onChange={(e) =>
                                                handleSelectChange(e)
                                            }
                                        />
                                        <InputError
                                            isValid={isErrorCheck.supplier_id}
                                            message={"Supplier is required"}
                                        />
                                    </Row>
                                    <Row className="click-to-add-prompt f-right">
                                        <p className="add-supplier-prompt">
                                            SUPPLIER NOT FOUND?{" "}
                                            <a
                                                className="add-supplier-label"
                                                onClick={
                                                    handleShowAddSupplierModal
                                                }
                                            >
                                                Click to add supplier
                                            </a>
                                        </p>
                                    </Row>
                                </Col>
                                <Col>
                                    <Form.Control
                                        type="text"
                                        name="payee"
                                        defaultValue={newPayment.payee}
                                        className="nc-modal-custom-input form-control"
                                        onChange={(e) => handlePayChange(e)}
                                    />
                                    <InputError
                                        isValid={isErrorCheck.payee}
                                        message={"Payee is required"}
                                    />
                                </Col>
                            </Row>
                            <Row className="mt-4 mb-2">
                                <Col>
                                    <span className="nc-modal-custom-row uppercase">
                                        Acknowledged By
                                        <label className="badge-required">{` *`}</label>
                                    </span>
                                </Col>
                                <Col>
                                    <span className="nc-modal-custom-row uppercase">
                                        Particulars
                                        <span className="edit-optional px-2">
                                            (Optional)
                                        </span>
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Select
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        placeholder="Select employee..."
                                        value={employeeValue}
                                        options={employees}
                                        onChange={(e) => handleSelectChange(e)}
                                    />
                                    <InputError
                                        isValid={isError.acknowledged_by}
                                        message={"Acknowledge by is required"}
                                    />
                                </Col>
                                <Col>
                                    <Form.Control
                                        type="text"
                                        name="particulars"
                                        className="nc-modal-custom-input form-control"
                                        defaultValue={newPayment.particulars}
                                        onChange={(e) => handlePayChange(e)}
                                    />
                                </Col>
                            </Row>
                        </Fragment>
                    )}
                    {type === "cash" && (
                        <Fragment>
                            <Row className="pt-3 mb-2">
                                <Col>
                                    <span className="nc-modal-custom-row uppercase">
                                        Supplier Name
                                        <label className="badge-required">{` *`}</label>
                                    </span>
                                </Col>
                                <Col xs={4}>
                                    <span className="nc-modal-custom-row uppercase">
                                        Payment Date
                                        <label className="badge-required">{` *`}</label>
                                    </span>
                                </Col>
                            </Row>
                            <Row className="align-items-start">
                                <Col>
                                    <Row>
                                        <Select
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                            placeholder="Select Supplier..."
                                            value={supplierValue}
                                            options={suppliers}
                                            onChange={(e) =>
                                                handleSelectChange(e)
                                            }
                                        />
                                        <InputError
                                            isValid={isError.supplier_id}
                                            message={"Supplier is required"}
                                        />
                                    </Row>
                                    <Row className="click-to-add-prompt f-right">
                                        <p className="add-supplier-prompt">
                                            SUPPLIER NOT FOUND?{" "}
                                            <a
                                                className="add-supplier-label"
                                                onClick={
                                                    handleShowAddSupplierModal
                                                }
                                            >
                                                Click to add supplier
                                            </a>
                                        </p>
                                    </Row>
                                </Col>
                                <Col xs={4}>
                                    <Form.Control
                                        type="date"
                                        name="payment_date"
                                        defaultValue={newPayment.payment_date}
                                        className="nc-modal-custom-row-grey"
                                        onChange={(e) => handlePayChange(e)}
                                    />
                                    <InputError
                                        isValid={isError.payment_date}
                                        message={"Payment Date is required"}
                                    />
                                </Col>
                            </Row>
                            <Row className="mt-4 mb-2">
                                <Col>
                                    <span className="nc-modal-custom-row uppercase">
                                        Payee
                                        <label className="badge-required">{` *`}</label>
                                    </span>
                                </Col>
                                <Col>
                                    <span className="nc-modal-custom-row uppercase">
                                        Acknowledged by
                                        <label className="badge-required">{` *`}</label>
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Control
                                        type="text"
                                        name="payee"
                                        className="nc-modal-custom-input form-control"
                                        defaultValue={newPayment.payee}
                                        onChange={(e) => handlePayChange(e)}
                                    />
                                    <InputError
                                        isValid={isError.payee}
                                        message={"Payee is required"}
                                    />
                                </Col>
                                <Col>
                                    <Select
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        placeholder="Select employee..."
                                        value={employeeValue}
                                        options={employees}
                                        onChange={(e) => handleSelectChange(e)}
                                    />
                                    <InputError
                                        isValid={isError.acknowledged_by}
                                        message={"Acknowledge by is required"}
                                    />
                                </Col>
                            </Row>
                            <Row className="mt-4 mb-2">
                                <Col>
                                    <span className="nc-modal-custom-row uppercase">
                                        Particulars
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
                                        name="particulars"
                                        className="nc-modal-custom-input form-control"
                                        defaultValue={newPayment.particulars}
                                        onChange={(e) => handlePayChange(e)}
                                    />
                                </Col>
                            </Row>
                        </Fragment>
                    )}
                    {type === "bank" && (
                        <Fragment>
                            <Row className="pt-3 mb-2">
                                <Col>
                                    <span className="nc-modal-custom-row uppercase">
                                        From Bank
                                        <label className="badge-required">{` *`}</label>
                                    </span>
                                </Col>
                                <Col>
                                    <span className="nc-modal-custom-row uppercase">
                                        Payment Date
                                        <label className="badge-required">{` *`}</label>
                                    </span>
                                </Col>
                                <Col>
                                    <span className="nc-modal-custom-row uppercase">
                                        Reference No.
                                        <label className="badge-required">{` *`}</label>
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Select
                                        name="bank_from"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        value={fromBankValue}
                                        placeholder="Select Bank..."
                                        options={fromBanks}
                                        onChange={(e) => handleSelectChange(e)}
                                    />
                                    <InputError
                                        isValid={isErrorBank.bank_from}
                                        message={"Bank is required"}
                                    />
                                </Col>
                                <Col>
                                    <Form.Control
                                        type="date"
                                        name="payment_date"
                                        defaultValue={newPayment.payment_date}
                                        className="nc-modal-custom-row-grey"
                                        onChange={(e) => handlePayChange(e)}
                                    />
                                    <InputError
                                        isValid={isErrorBank.payment_date}
                                        message={"Payment Date is required"}
                                    />
                                </Col>
                                <Col>
                                    <Form.Control
                                        type="text"
                                        name="reference_no"
                                        defaultValue={newPayment.reference_no}
                                        className="nc-modal-custom-input form-control"
                                        onChange={(e) => handlePayChange(e)}
                                    />
                                    <InputError
                                        isValid={isErrorBank.reference_no}
                                        message={"Reference number is required"}
                                    />
                                </Col>
                            </Row>
                            <Row className="pt-3 mb-2">
                                <Col xs={4}>
                                    <span className="nc-modal-custom-row uppercase">
                                        Account Number
                                        <label className="badge-required">{` *`}</label>
                                    </span>
                                </Col>
                                <Col xs={4}>
                                    <span className="nc-modal-custom-row uppercase">
                                        Account Name
                                        <label className="badge-required">{` *`}</label>
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={4}>
                                    <Form.Control
                                        type="text"
                                        name="from_account_no"
                                        className="nc-modal-custom-input form-control"
                                        defaultValue={
                                            newPayment.from_account_no
                                        }
                                        onChange={(e) => handlePayChange(e)}
                                    />
                                    <InputError
                                        isValid={isErrorBank.from_account_no}
                                        message={"Account number is required"}
                                    />
                                </Col>
                                <Col xs={4}>
                                    <Form.Control
                                        type="text"
                                        name="from_account_name"
                                        className="nc-modal-custom-input form-control"
                                        defaultValue={
                                            newPayment.from_account_name
                                        }
                                        onChange={(e) => handlePayChange(e)}
                                    />
                                    <InputError
                                        isValid={isErrorBank.from_account_name}
                                        message={"Account name is required"}
                                    />
                                </Col>
                            </Row>
                            <Row className="pt-3 mb-2">
                                <Col>
                                    <span className="nc-modal-custom-row uppercase">
                                        Supplier Name
                                        <label className="badge-required">{` *`}</label>
                                    </span>
                                </Col>
                                <Col>
                                    <span className="nc-modal-custom-row uppercase">
                                        Payee
                                        <label className="badge-required">{` *`}</label>
                                    </span>
                                </Col>
                            </Row>
                            <Row className="align-items-start">
                                <Col>
                                    <Row>
                                        <Select
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                            placeholder="Select Supplier..."
                                            value={supplierValue}
                                            options={suppliers}
                                            onChange={(e) =>
                                                handleSelectChange(e)
                                            }
                                        />
                                        <InputError
                                            isValid={isErrorBank.supplier_id}
                                            message={"Supplier is required"}
                                        />
                                    </Row>
                                    <Row className="click-to-add-prompt f-right">
                                        <p className="add-supplier-prompt">
                                            SUPPLIER NOT FOUND?{" "}
                                            <a
                                                className="add-supplier-label"
                                                onClick={
                                                    handleShowAddSupplierModal
                                                }
                                            >
                                                Click to add supplier
                                            </a>
                                        </p>
                                    </Row>
                                </Col>
                                <Col>
                                    <Form.Control
                                        type="text"
                                        name="payee"
                                        className="nc-modal-custom-input form-control"
                                        defaultValue={newPayment.payee}
                                        onChange={(e) => handlePayChange(e)}
                                    />
                                    <InputError
                                        isValid={isErrorBank.payee}
                                        message={"Payee is required"}
                                    />
                                </Col>
                            </Row>
                            <Row className="pt-3 mb-2 mt-3">
                                <Col>
                                    <span className="nc-modal-custom-row uppercase">
                                        To Bank
                                        <label className="badge-required">{` *`}</label>
                                    </span>
                                </Col>
                                <Col>
                                    <span className="nc-modal-custom-row uppercase">
                                        Account Number
                                        <label className="badge-required">{` *`}</label>
                                    </span>
                                </Col>
                                <Col>
                                    <span className="nc-modal-custom-row uppercase">
                                        Account Name
                                        <label className="badge-required">{` *`}</label>
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Control
                                        type="text"
                                        name="bank_to"
                                        className="nc-modal-custom-input form-control"
                                        defaultValue={
                                            newPayment.bank_to
                                        }
                                        onChange={(e) => handlePayChange(e)}
                                    />
                                    {/* <Select
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        placeholder="Select Bank..."
                                        value={toBankValue}
                                        options={toBanks}
                                        onChange={(e) => handleSelectChange(e)}
                                    /> */}
                                    <InputError
                                        isValid={isErrorBank.bank_to}
                                        message={"Bank is required"}
                                    />
                                </Col>
                                <Col xs={4}>
                                    <Form.Control
                                        type="text"
                                        name="to_account_no"
                                        className="nc-modal-custom-input form-control"
                                        defaultValue={newPayment.to_account_no}
                                        onChange={(e) => handlePayChange(e)}
                                    />
                                    <InputError
                                        isValid={isErrorBank.to_account_no}
                                        message={"Account number is required"}
                                    />
                                </Col>
                                <Col xs={4}>
                                    <Form.Control
                                        type="text"
                                        name="to_account_name"
                                        className="nc-modal-custom-input form-control"
                                        defaultValue={
                                            newPayment.to_account_name
                                        }
                                        onChange={(e) => handlePayChange(e)}
                                    />
                                    <InputError
                                        isValid={isErrorBank.to_account_name}
                                        message={"Account name is required"}
                                    />
                                </Col>
                            </Row>
                            <Row className="mt-4 mb-2">
                                <Col>
                                    <span className="nc-modal-custom-row uppercase">
                                        Acknowledged By
                                        <label className="badge-required">{` *`}</label>
                                    </span>
                                </Col>
                                <Col>
                                    <span className="nc-modal-custom-row uppercase">
                                        Particulars
                                        <span className="edit-optional px-2">
                                            (Optional)
                                        </span>
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Select
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        placeholder="Select employee..."
                                        value={employeeValue}
                                        options={employees}
                                        onChange={(e) => handleSelectChange(e)}
                                    />
                                    <InputError
                                        isValid={isError.acknowledged_by}
                                        message={"Acknowledge by is required"}
                                    />
                                </Col>
                                <Col>
                                    <Form.Control
                                        type="text"
                                        name="particulars"
                                        className="nc-modal-custom-input form-control"
                                        defaultValue={newPayment.particulars}
                                        onChange={(e) => handlePayChange(e)}
                                    />
                                </Col>
                            </Row>
                        </Fragment>
                    )}

                    <div className="mt-3 pt-3 d-flex flex-column">
                        <span className="nc-modal-custom-row mb-2 uppercase">
                            Applied to following invoices
                        </span>
                        <Container fluid className="edit-purchased-items">
                            {items.length === 0 ? (
                                <div className="entries-not-found">
                                    {add &&
                                        "You haven't added any invoices yet."}
                                    {edit && "Entries not found."}
                                </div>
                            ) : (
                                <>{renderTable()}</>
                            )}
                        </Container>
                        <Row className="pt-3 PO-add-item">
                            <InputError
                                isValid={isError.list}
                                message={
                                    "There must be at least one ingredient for this product!"
                                }
                            />
                            <InputError
                                isValid={isErrorCheck.list}
                                message={
                                    "There must be at least one ingredient for this product!"
                                }
                            />
                            <InputError
                                isValid={isErrorBank.list}
                                message={
                                    "There must be at least one ingredient for this product!"
                                }
                            />
                        </Row>
                        <Row className="my-2 align-right pb-2 align-items-start">
                            <Col className="pt-3 PO-add-item">
                                <Button type="button" onClick={() => AddItem()}>
                                    Add Invoice
                                </Button>
                            </Col>
                            {items.length !== 0 && (
                                <>
                                    <Col className="pt-3">
                                        <Row className="mb-3">
                                            <Col
                                                xs={4}
                                                className="print-table-footer-label"
                                            >
                                                TOTAL AMOUNT
                                            </Col>
                                            <Col className="print-table-footer-data ps-4">
                                                {showLoader
                                                    ? null
                                                    : "PHP " +
                                                      numberFormat(totalAmount)}
                                            </Col>
                                        </Row>
                                        {type === "bank" && (
                                            <>
                                                <Row className="mb-3">
                                                    <Col
                                                        xs={4}
                                                        className="print-table-footer-label"
                                                    >
                                                        TRANSACTION FEE
                                                    </Col>
                                                    <Col
                                                        xs={4}
                                                        className="print-table-footer-data ps-4"
                                                    >
                                                        <Form.Control
                                                            type="number"
                                                            name="transaction_fee"
                                                            value={
                                                                transactionFee
                                                            }
                                                            onChange={(e) =>
                                                                handleTransactionFeeChange(
                                                                    e
                                                                )
                                                            }
                                                        />
                                                    </Col>
                                                </Row>
                                                <Row className="mb-3">
                                                    <Col
                                                        xs={4}
                                                        className="print-table-footer-label"
                                                    >
                                                        GRAND TOTAL
                                                    </Col>
                                                    <Col className="print-table-footer-data ps-4">
                                                        {showLoader
                                                            ? null
                                                            : "PHP " +
                                                              numberFormat(
                                                                  grandTotal
                                                              )}
                                                    </Col>
                                                </Row>
                                            </>
                                        )}
                                    </Col>
                                </>
                            )}
                        </Row>
                    </div>
                    <div className="d-flex justify-content-end pt-5 pb-3">
                        <button
                            type="button"
                            className="button-secondary me-3"
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </button>
                        {isClicked ? (
                            <div className="button-primary me-3 d-flex justify-content-center">
                                <ReactLoading
                                    type="bubbles"
                                    color="#FFFFFF"
                                    height={50}
                                    width={50}
                                />
                            </div>
                        ) : (
                            <button
                                type="button"
                                className="button-primary me-3"
                                onClick={handleSubmit}
                            >
                                Save
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <AddModal
                title="BANK"
                size="lg"
                type="bank"
                show={showAddBankModal}
                onHide={handleCloseAddBankModal}
                onSave={() => addBank()}
            >
                <div className="mt-3 edit-form ">
                    <Row className="nc-modal-custom-row mt-0">
                        <Col>
                            BANK NAME
                            <span className="required-icon">*</span>
                            <Form.Control
                                type="text"
                                name="bank_name"
                                value={addBankData.bank_name}
                                className="nc-modal-custom-input"
                                onChange={(e) => handleAddChange(e)}
                                required
                            />
                            <InputError
                                isValid={isErrorAddBank.bank_name}
                                message={"Bank name is required"}
                            />
                        </Col>
                        <Col>
                            Print Template
                            <span className="required-icon">*</span>
                            <select
                                className="nc-modal-custom-select"
                                name="check_template_id"
                                value={addBankData.check_template_id}
                                onChange={(e) => handleAddChange(e)}
                            >
                                <option selected value={"select"}>
                                    Select
                                </option>
                                {checkTemplateData.map((data) => {
                                    return (
                                        <option value={data.id}>
                                            {data.name}
                                        </option>
                                    );
                                })}
                            </select>
                            <InputError
                                isValid={isErrorAddBank.check_template_id}
                                message={"Bank name is required"}
                            />
                        </Col>
                    </Row>
                </div>
            </AddModal>
            <AddModal
                title="SUPPLIER"
                show={showAddSupplierModal}
                onHide={handleCloseAddSupplierModal}
                onSave={handleAddSupplier}
            >
                <div className="mt-3 edit-form">
                    <Row className="nc-modal-custom-row mt-0">
                        <Col>
                            BIR NAME{" "}
                            <label className="badge-required">{` *`}</label>
                            <Form.Control
                                type="text"
                                name="bir_name"
                                value={supplierDetails.bir_name}
                                className="nc-modal-custom-input"
                                onChange={(e) =>
                                    setSupplierDetails({
                                        ...supplierDetails,
                                        [e.target.name]: e.target.value,
                                    })
                                }
                                required
                            />
                        </Col>
                        <Col>
                            TRADE NAME{" "}
                            <label className="badge-required">{` *`}</label>
                            <Form.Control
                                type="text"
                                name="trade_name"
                                value={supplierDetails.trade_name}
                                className="nc-modal-custom-input"
                                onChange={(e) =>
                                    setSupplierDetails({
                                        ...supplierDetails,
                                        [e.target.name]: e.target.value,
                                    })
                                }
                                required
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col>
                            BIR-REGISTERED ADDRESS
                            <Form.Control
                                type="text"
                                name="bir_address"
                                value={supplierDetails.bir_address}
                                className="nc-modal-custom-input"
                                onChange={(e) =>
                                    setSupplierDetails({
                                        ...supplierDetails,
                                        [e.target.name]: e.target.value,
                                    })
                                }
                                required
                            />
                        </Col>
                        <Col>
                            TRADE ADDRESS{" "}
                            <label className="badge-required">{` *`}</label>
                            <Form.Control
                                type="text"
                                name="trade_address"
                                value={supplierDetails.trade_address}
                                className="nc-modal-custom-input"
                                onChange={(e) =>
                                    setSupplierDetails({
                                        ...supplierDetails,
                                        [e.target.name]: e.target.value,
                                    })
                                }
                                required
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col>
                            TIN NUMBER{" "}
                            <label className="badge-required">{` *`}</label>
                            <Form.Control
                                type="text"
                                name="tin"
                                value={supplierDetails.tin}
                                className="nc-modal-custom-input"
                                onChange={(e) =>
                                    setSupplierDetails({
                                        ...supplierDetails,
                                        [e.target.name]: e.target.value,
                                    })
                                }
                                required
                            />
                        </Col>
                        <Col>
                            BIR NUMBER
                            <Form.Control
                                type="text"
                                name="bir_number"
                                className="nc-modal-custom-input"
                                onChange={(e) =>
                                    setSupplierDetails({
                                        ...supplierDetails,
                                        [e.target.name]: e.target.value,
                                    })
                                }
                                required
                            />
                        </Col>
                        <Col xl={3}>
                            TERM (DAYS){" "}
                            <label className="badge-required">{` *`}</label>
                            <Form.Control
                                type="text"
                                name="terms"
                                value={supplierDetails.terms}
                                className="nc-modal-custom-input"
                                onChange={(e) =>
                                    setSupplierDetails({
                                        ...supplierDetails,
                                        [e.target.name]: e.target.value,
                                    })
                                }
                                required
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col xl={4}>
                            CONTACT PERSON{" "}
                            <label className="badge-required">{` *`}</label>
                            <Form.Control
                                type="text"
                                name="contact_person"
                                value={supplierDetails.contact_person}
                                className="nc-modal-custom-input"
                                onChange={(e) =>
                                    setSupplierDetails({
                                        ...supplierDetails,
                                        [e.target.name]: e.target.value,
                                    })
                                }
                                required
                            />
                        </Col>
                        <Col xl={4}>
                            PHONE NUMBER{" "}
                            <label className="badge-required">{` *`}</label>
                            <Form.Control
                                type="text"
                                name="phone_no"
                                value={supplierDetails.phone_no}
                                className="nc-modal-custom-input"
                                onChange={(e) =>
                                    setSupplierDetails({
                                        ...supplierDetails,
                                        [e.target.name]: e.target.value,
                                    })
                                }
                                required
                            />
                        </Col>
                        <Col>
                            PAYEE{" "}
                            <label className="badge-required">{` *`}</label>
                            <Form.Control
                                type="email"
                                name="payee"
                                value={supplierDetails.payee}
                                className="nc-modal-custom-input"
                                onChange={(e) =>
                                    setSupplierDetails({
                                        ...supplierDetails,
                                        [e.target.name]: e.target.value,
                                    })
                                }
                                required
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col>
                            PRIMARY BANK NAME
                            <Form.Control
                                type="text"
                                name="bank_primary"
                                value={supplierDetails.bank_primary}
                                className="nc-modal-custom-input"
                                onChange={(e) =>
                                    setSupplierDetails({
                                        ...supplierDetails,
                                        [e.target.name]: e.target.value,
                                    })
                                }
                                required
                            />
                        </Col>
                        <Col>
                            PRIMARY ACCOUNT NO.
                            <Form.Control
                                type="number"
                                name="primary_account_no"
                                className="nc-modal-custom-input"
                                onChange={(e) =>
                                    setSupplierDetails({
                                        ...supplierDetails,
                                        [e.target.name]: e.target.value,
                                    })
                                }
                                required
                            />
                        </Col>
                        <Col xl={5}>
                            PRIMARY ACCOUNT NAME
                            <Form.Control
                                type="text"
                                name="primary_account_name"
                                className="nc-modal-custom-input"
                                onChange={(e) =>
                                    setSupplierDetails({
                                        ...supplierDetails,
                                        [e.target.name]: e.target.value,
                                    })
                                }
                                required
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col>
                            ALTERNATE BANK NAME
                            <Form.Control
                                type="text"
                                name="bank_alternate"
                                value={supplierDetails.bank_alternate}
                                className="nc-modal-custom-input"
                                onChange={(e) =>
                                    setSupplierDetails({
                                        ...supplierDetails,
                                        [e.target.name]: e.target.value,
                                    })
                                }
                                required
                            />
                        </Col>
                        <Col>
                            ALTERNATE ACCOUNT NO.
                            <Form.Control
                                type="number"
                                name="alternate_account_no"
                                className="nc-modal-custom-input"
                                onChange={(e) =>
                                    setSupplierDetails({
                                        ...supplierDetails,
                                        [e.target.name]: e.target.value,
                                    })
                                }
                                required
                            />
                        </Col>
                        <Col xl={5}>
                            ALTERNATE ACCOUNT NAME
                            <Form.Control
                                type="text"
                                name="alternate_account_name"
                                className="nc-modal-custom-input"
                                onChange={(e) =>
                                    setSupplierDetails({
                                        ...supplierDetails,
                                        [e.target.name]: e.target.value,
                                    })
                                }
                                required
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col xl={4}>
                            COMPANY EMAIL{" "}
                            <label className="badge-required">{` *`}</label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={supplierDetails.email}
                                className="nc-modal-custom-input"
                                onChange={(e) =>
                                    setSupplierDetails({
                                        ...supplierDetails,
                                        [e.target.name]: e.target.value,
                                    })
                                }
                                required
                            />
                        </Col>
                    </Row>
                    <Row className="m-divider mt-3 mb-3"></Row>
                    <Row className="nc-modal-custom-row">
                        <Col>
                            REQUIREMENTS
                            <Form.Control
                                type="file"
                                multiple
                                name="requirements"
                                className="nc-modal-custom-input"
                                onChange={(e) =>
                                    setSupplierDetails({
                                        ...supplierDetails,
                                        [e.target.name]: e.target.value,
                                    })
                                }
                                required
                            />
                        </Col>
                    </Row>
                </div>
            </AddModal>
        </div>
    );
}

FormPaySupplier.defaultProps = {
    add: false,
    edit: false,
};

export default FormPaySupplier;
