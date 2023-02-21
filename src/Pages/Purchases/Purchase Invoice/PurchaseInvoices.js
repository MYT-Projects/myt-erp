import React, { forwardRef, useState, useEffect } from "react";
import { Col, Form, Row, Tab, Tabs } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import toast from "react-hot-toast";
import Select from "react-select";

// components
import AddModal from "./Components/AddPIModal";
import Navbar from "../../../Components/Navbar/Navbar";
import Table from "../../../Components/TableTemplate/Table";
import DeleteModal from "../../../Components/Modals/DeleteModal";

// api calls and utils
import {
    deleteInvoice,
    filterInvoice,
    getAllInvoices,
} from "../../../Helpers/apiCalls/Purchases/purchaseInvoiceApi";
import {
    formatDate,
    getTodayDate,
    getType,
    isAdmin,
    refreshPage,
    toastStyle,
    TokenExpiry,
    numberFormat
} from "../../../Helpers/Utils/Common";
import { getAllSuppliers } from "../../../Helpers/apiCalls/suppliersApi";
import { getAllSuppliersPotato } from "../../../Helpers/apiCalls/PotatoCorner/suppliersApi";
import { getAllVendors } from "../../../Helpers/apiCalls/Manage/Vendors";
import { getAllVendorsPotato } from "../../../Helpers/apiCalls/PotatoCorner/VendorsApi";
// css
import "./PurchaseInvoices.css";
import "../PurchaseOrders/PurchaseOrders.css";
import {
    deleteInvoicePotato,
    filterInvoicePotato,
    getAllInvoicesPotato,
} from "../../../Helpers/apiCalls/PotatoCorner/Purchases/purchaseInvoiceApi";
import CloseBillModal from "./Components/CloseBillModal"
import Moment from "moment";

/**
 *  Purchase Invoice component
 */
export default function PurchaseInvoices() {
    let navigate = useNavigate();
    var dateToday = getTodayDate();
    const accountType = getType();
    const [inactive, setInactive] = useState(true);
    const [openListPI, setOpenListPI] = useState([]);
    const [closeListPI, setCloseListPI] = useState([]);
    const [suppliers, setSuppliers] = useState([]);

    const [grandTotal, setGrandTotal] = useState(0);
    const [totalPaidAmount, setTotalPaidAmount] = useState(0);
    const [totalBalance, setTotalBalance] = useState(0);

    /* delete modal handler */
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const handleShowDeleteModal = () => setShowDeleteModal(true);
    const handleCloseDeleteModal = () => setShowDeleteModal(false);
    const [PIID, setPIID] = useState("");

    /* Close bill Modal */
    const [showCloseBillModal, setShowCloseBillModal] = useState(false);
    const handleShowCloseBillModal = () => setShowCloseBillModal(true);
    const handleCloseCloseBillModal = () => setShowCloseBillModal(false);

    const [remarks, setRemarks] = useState("");
    const [bill, setBill] = useState([]);

    /* FILTER CONFIGS */
    const [filterConfig, setFilterConfig] = useState({
        supplier: "",
        date_from: "",
        date_to: "",
        invoice_no: "",
        type: "",
        payment_status: "open",
    });

    useEffect(()=>{
        setFilterConfig(() => {
            if (window.localStorage.getItem('purchases-purchaseInvoices-filterConfig') != null){
                return JSON.parse(window.localStorage.getItem('purchases-purchaseInvoices-filterConfig'))
            } else {
                var defaultConfig = {
                    supplier: "",
                    date_from: "",
                    date_to: "",
                    invoice_no: "",
                    type: "",
                    payment_status: "open",
                }
                return defaultConfig
            }
        });
    }, [])

    useEffect(()=>{
        window.localStorage.setItem("purchases-purchaseInvoices-filterConfig", JSON.stringify(filterConfig));
    }, [filterConfig]);

    const handleTabSelect = (tabKey) => {
        setFilterConfig((prev) => {
            return {
                ...prev,
                payment_status: tabKey,
                vendor_id: "",
                supplier_id: "",
                date_from: "",
                date_to: "",
            };
        });
    };

    const today = Moment().format("MM/DD/YYYY");

    const handleFilterChange = (e) => {
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
    };

    async function fetchFilteredPI() {
        if (
            filterConfig.invoice_no ||
            filterConfig.supplier ||
            (filterConfig.date_from && filterConfig.date_to)
        ) {
            setShowLoader(true);

            if (
                filterConfig.type === "" ||
                filterConfig.type === "00" ||
                filterConfig.type === "mango"
            ) {
                const response = await filterInvoice(filterConfig);
                if (response.data) {
                    var allBills = [];

                    response.data.data.map((data) => {
                        data.po_id = "mango - " + data.po_id;
                        data.invoice_no = data.invoice_no;
                        data.supplier = data.supplier_name
                            ? data.supplier_name
                            : data.vendor_name;
                        data.receive_date = Moment(data.receive_date).format("MM-DD-YYYY");
                        data.total = numberFormat(data.total);
                        data.amount_paid = numberFormat(data.amount_paid);
                        data.balance = numberFormat(data.balance);
                        allBills.push(data);
                    });

                    var closedBills = allBills.filter(
                        (bill) => bill.payment_status === "closed"
                    );
                    var openBills = allBills.filter(
                        (bill) => bill.payment_status === "open"
                    );

                    if (
                        filterConfig.type === "00" ||
                        filterConfig.type === ""
                    ) {
                        var tempClose = closedBills.concat(closeListPI);
                        var tempOpen = openBills.concat(openListPI);
                        setCloseListPI(tempClose);
                        setOpenListPI(tempOpen);
                    } else {
                        setCloseListPI(closedBills);
                        setOpenListPI(openBills);
                    }
                } else if (response.error) {
                    TokenExpiry(response);
                    setCloseListPI([]);
                    setOpenListPI([]);
                }
                setShowLoader(false);
            } else if (
                filterConfig.type === "" ||
                filterConfig.type === "00" ||
                filterConfig.type === "potato"
            ) {
                const response = await filterInvoicePotato(filterConfig);
                if (response.data) {
                    var allBills = [];

                    response.data.data.map((data) => {
                        data.po_id = "potato - " + data.po_id;
                        data.invoice_no = data.invoice_no;
                        data.supplier = data.supplier_name
                            ? data.supplier_name
                            : data.vendor_name;
                        data.receive_date = Moment(data.receive_date).format("MM-DD-YYYY");
                        data.total = numberFormat(data.total);
                        data.amount_paid = numberFormat(data.amount_paid);
                        data.balance = numberFormat(data.balance);
                        allBills.push(data);
                    });

                    var closedBills = allBills.filter(
                        (bill) => bill.payment_status === "closed"
                    );
                    var openBills = allBills.filter(
                        (bill) => bill.payment_status === "open"
                    );

                    if (
                        filterConfig.type === "00" ||
                        filterConfig.type === ""
                    ) {
                        var tempClose = closedBills.concat(closeListPI);
                        var tempOpen = openBills.concat(openListPI);
                        setCloseListPI(tempClose);
                        setOpenListPI(tempOpen);
                    } else {
                        setCloseListPI(closedBills);
                        setOpenListPI(openBills);
                    }
                } else if (response.error) {
                    TokenExpiry(response);
                    setCloseListPI([]);
                    setOpenListPI([]);
                }
                setShowLoader(false);
            }
        } else if (filterConfig.invoice_no === "") {
            setShowLoader(true);

            if (
                filterConfig.type === "" ||
                filterConfig.type === "00" ||
                filterConfig.type === "mango"
            ) {
                const response = await filterInvoice(filterConfig);
                if (response.data) {
                    var allBills = [];

                    response.data.data.map((data) => {
                        data.po_id = "mango - " + data.po_id;
                        data.invoice_no = data.invoice_no;
                        data.supplier = data.supplier_name
                            ? data.supplier_name
                            : data.vendor_name;
                        allBills.push(data);
                    });

                    var closedBills = allBills.filter(
                        (bill) => bill.payment_status === "closed"
                    );
                    var openBills = allBills.filter(
                        (bill) => bill.payment_status === "open"
                    );
                    if (
                        filterConfig.type === "00" ||
                        filterConfig.type === ""
                    ) {
                        var tempClose = closedBills.concat(closeListPI);
                        var tempOpen = openBills.concat(openListPI);
                        setCloseListPI(tempClose);
                        setOpenListPI(tempOpen);
                    } else {
                        setCloseListPI(closedBills);
                        setOpenListPI(openBills);
                    }
                } else if (response.error) {
                    setCloseListPI([]);
                    setOpenListPI([]);
                }
                setShowLoader(false);
            } else if (
                filterConfig.type === "" ||
                filterConfig.type === "00" ||
                filterConfig.type === "mango"
            ) {
                const response = await filterInvoicePotato(filterConfig);
                if (response.data) {
                    var allBills = [];

                    response.data.data.map((data) => {
                        data.po_id = "potato - " + data.po_id;
                        data.invoice_no = data.invoice_no;
                        data.supplier = data.supplier_name
                            ? data.supplier_name
                            : data.vendor_name;
                        allBills.push(data);
                    });

                    var closedBills = allBills.filter(
                        (bill) => bill.payment_status === "closed"
                    );
                    var openBills = allBills.filter(
                        (bill) => bill.payment_status === "open"
                    );
                    if (
                        filterConfig.type === "00" ||
                        filterConfig.type === ""
                    ) {
                        var tempClose = closedBills.concat(closeListPI);
                        var tempOpen = openBills.concat(openListPI);
                        setCloseListPI(tempClose);
                        setOpenListPI(tempOpen);
                    } else {
                        setCloseListPI(closedBills);
                        setOpenListPI(openBills);
                    }
                } else if (response.error) {
                    TokenExpiry(response);
                    setCloseListPI([]);
                    setOpenListPI([]);
                }
                setShowLoader(false);
            }
        }
    }

    const [purchaseInvoiceManager, setPurchaseInvoiceManager] = useState([]);
    async function searchPurchaseInvoice() {
        setShowLoader(true);
        setPurchaseInvoiceManager([])
        setGrandTotal("0")
        setTotalPaidAmount("0")
        setTotalBalance("0")

        if (filterConfig.type === "mango") {
            const response = await filterInvoice(filterConfig);

            var allBills = [];

            if (response.data) {
                var sortedData = response.data.data.sort((a, b) =>
                    a.receive_date > b.receive_date
                        ? 1
                        : b.receive_date > a.receive_date
                        ? -1
                        : 0
                );
                
                sortedData.map((data) => {
                    data.po_id = "mango - " + data.po_id;
                    data.type = "mango";
                    data.invoice_no = data.invoice_no;
                    data.total = numberFormat(data.grand_total);
                    data.amount_paid = numberFormat(data.paid_amount);
                    data.overpaid_amount = numberFormat(data.overpaid_amount);
                    data.supplier = data.supplier_name
                        ? data.supplier_name
                        : data.vendor_name;
                    data.receive_date = Moment(data.receive_date).format("MM-DD-YYYY");
                    data.pay_ref_no = !data.payments? "" : data.payments[0]?.payment_mode === "check" ? data.payments[0]?.payment_mode + " - " + data.payments[0]?.check_no
                                                            : data.payments[0]?.payment_mode === "bank" ? data.payments[0]?.payment_mode + " - " + data.payments[0]?.reference_no
                                                            : data.payments[0]?.payment_mode
                    data.pay_id_no = !data.payments? "" :  data.payments[0]?.receive_id? data.payments[0].receive_id : "";
                    allBills.push(data);
                });

                var grandtotal = response.data.summary? response.data.summary.total : "0";
                var totalpaid = response.data.summary? response.data.summary.total_paid : "0";
                var totalbalance = response.data.summary? response.data.summary.total_balance : "0";
                setGrandTotal(grandtotal);
                setTotalPaidAmount(totalpaid);
                setTotalBalance(totalbalance);

            } else {
                TokenExpiry(response);
            }

            setPurchaseInvoiceManager(allBills.reverse());
        } else if (filterConfig.type === "potato") {
            const response2 = await filterInvoicePotato(filterConfig);

            var allBills = [];

            if (response2.data) {
                var sortedData = response2.data.data.sort((a, b) =>
                    a.receive_date > b.receive_date
                        ? 1
                        : b.receive_date > a.receive_date
                        ? -1
                        : 0
                );

                sortedData.map((data) => {
                    data.po_id = "potato - " + data.po_id;
                    data.type = "potato";
                    data.invoice_no = data.invoice_no;
                    data.total = numberFormat(data.grand_total);
                    data.amount_paid = numberFormat(data.paid_amount);
                    data.overpaid_amount = numberFormat(data.overpaid_amount);
                    data.supplier = data.supplier_name
                        ? data.supplier_name
                        : data.vendor_name;
                    data.receive_date = Moment(data.receive_date).format("MM-DD-YYYY");
                    data.pay_ref_no = !data.payments? "" : data.payments[0]?.payment_mode === "check" ? data.payments[0]?.payment_mode + " - " + data.payments[0]?.check_no
                                                            : data.payments[0]?.payment_mode === "bank" ? data.payments[0]?.payment_mode + " - " + data.payments[0]?.reference_no
                                                            : data.payments[0]?.payment_mode
                    data.pay_id_no = !data.payments? "" :  data.payments[0]?.receive_id? data.payments[0].receive_id : "";
                    allBills.push(data);
                });

                var grandtotal = response2.data.summary? response2.data.summary.total : "0";
                var totalpaid = response2.data.summary? response2.data.summary.total_paid : "0";
                var totalbalance = response2.data.summary? response2.data.summary.total_balance : "0";
                setGrandTotal(grandtotal);
                setTotalPaidAmount(totalpaid);
                setTotalBalance(totalbalance);

            } else {
                TokenExpiry(response2);
            }
            setPurchaseInvoiceManager(allBills.reverse());
        } else {
            const response = await filterInvoice(filterConfig);
            const response2 = await filterInvoicePotato(filterConfig);

            var allBills = [];

            if (response.data) {
                var sortedData = response.data.data.sort((a, b) =>
                    a.receive_date > b.receive_date
                        ? 1
                        : b.receive_date > a.receive_date
                        ? -1
                        : 0
                );

                sortedData.map((data) => {
                    data.po_id = "mango - " + data.po_id;
                    data.type = "mango";
                    data.invoice_no = data.invoice_no;
                    data.total = numberFormat(data.grand_total);
                    data.amount_paid = numberFormat(data.paid_amount);
                    data.overpaid_amount = numberFormat(data.overpaid_amount);
                    data.supplier = data.supplier_name
                        ? data.supplier_name
                        : data.vendor_name;
                    data.receive_date = Moment(data.receive_date).format("MM-DD-YYYY");
                    data.pay_ref_no = !data.payments? "" : data.payments[0]?.payment_mode === "check" ? data.payments[0]?.payment_mode + " - " + data.payments[0]?.check_no
                                                            : data.payments[0]?.payment_mode === "bank" ? data.payments[0]?.payment_mode + " - " + data.payments[0]?.reference_no
                                                            : data.payments[0]?.payment_mode
                    data.pay_id_no = !data.payments? "" :  data.payments[0]?.receive_id? data.payments[0].receive_id : "";
                    allBills.push(data);
                });

                var grandtotal = response.data.summary? response.data.summary.total : "0";
                var totalpaid = response.data.summary? response.data.summary.total_paid : "0";
                var totalbalance = response.data.summary? response.data.summary.total_balance : "0";
                setGrandTotal(grandtotal);
                setTotalPaidAmount(totalpaid);
                setTotalBalance(totalbalance);

            } else {
                TokenExpiry(response);
            }

            if (response2.data) {
                var sortedData2 = response2.data.data.sort((a, b) =>
                    a.receive_date > b.receive_date
                        ? 1
                        : b.receive_date > a.receive_date
                        ? -1
                        : 0
                );

                sortedData2.map((data) => {
                    data.po_id = "potato - " + data.po_id;
                    data.type = "potato";
                    data.invoice_no = data.invoice_no;
                    data.total = numberFormat(data.grand_total);
                    data.amount_paid = numberFormat(data.paid_amount);
                    data.overpaid_amount = numberFormat(data.overpaid_amount);
                    data.supplier = data.supplier_name
                        ? data.supplier_name
                        : data.vendor_name;
                    data.receive_date = Moment(data.receive_date).format("MM-DD-YYYY");
                    data.pay_ref_no = !data.payments? "" : data.payments[0]?.payment_mode === "check" ? data.payments[0]?.payment_mode + " - " + data.payments[0]?.check_no
                                                            : data.payments[0]?.payment_mode === "bank" ? data.payments[0]?.payment_mode + " - " + data.payments[0]?.reference_no
                                                            : data.payments[0]?.payment_mode
                    data.pay_id_no = !data.payments? "" :  data.payments[0]?.receive_id? data.payments[0].receive_id : "";
                    allBills.push(data);
                });

                var grandtotal = response2.data.summary? response2.data.summary.total + grandtotal : "0";
                var totalpaid = response2.data.summary? response2.data.summary.total_paid + totalpaid : "0";
                var totalbalance = response2.data.summary? response2.data.summary.total_balance + totalbalance : "0";
                setGrandTotal(grandtotal);
                setTotalPaidAmount(totalpaid);
                setTotalBalance(totalbalance);
                
            } else {
                TokenExpiry(response2);
            }

            setPurchaseInvoiceManager(allBills.sort((a, b) =>
                new Date(...a.receive_date?.split('/').reverse()) - new Date(...b.receive_date?.split('/').reverse())
            ).reverse());

            // setPurchaseInvoiceManager(allBills.sort((a, b) =>
            //     a.receive_date > b.receive_date
            //         ? 1
            //         : b.receive_date > a.receive_date
            //         ? -1
            //         : 0
            // ));
        }
        setShowLoader(false);
    }

    function ContractBtn(row) {
        return (
            <span
                className="me-4 align-middle ps-label"
                onClick={() => handleViewContract(row.pay_id_no, row.type)} 
            >
                {row.pay_ref_no}
            </span>
        );
    }
    function handleViewContract(id, type) {
        {
            window.open("/purchaseinvoices/print/" + id + "/" + type, "_blank");
        }
    }

    useEffect(() => {
        searchPurchaseInvoice();
    }, [filterConfig]);

    const [showLoader, setShowLoader] = useState(false);

    async function fetchPI() {
        setShowLoader(true);
        setOpenListPI([]);
        setCloseListPI([]);

        const response = await getAllInvoices();

        if (response.error) {
            TokenExpiry(response.error);
        } else {
            var closedBills = [];
            var openBills = [];
            var allBills = response.data.data.map((invoice) => {
                var info = invoice;

                info.supplier = invoice.supplier_name
                    ? invoice.supplier_name
                    : invoice.vendor_name;
                info.total = numberFormat(invoice.grand_total);
                info.receive_date = Moment(invoice.receive_date).format("MM-DD-YYYY");
                info.amount_paid = numberFormat(invoice.paid_amount);
                info.invoice_no = invoice.invoice_no;
                info.balance = parseFloat(
                    parseInt(invoice.grand_total) -
                        parseInt(invoice.paid_amount)
                ).toFixed(2);
                info.dr_no = invoice.dr_no || "N/A";
                info.po_id = "mango-" + invoice.po_id;
                if (invoice.payment_status === "closed") {
                    setCloseListPI((prev) => [...prev, info]);
                }
                if (invoice.payment_status === "open") {
                    setOpenListPI((prev) => [...prev, info]);
                }
            });
        }

        const response2 = await getAllInvoicesPotato();

        if (response2.error) {
            TokenExpiry(response2.error);
        } else {
            var closedBills = [];
            var openBills = [];
            var allBills = response2.data.data.map((invoice) => {
                var info = invoice;

                info.supplier = invoice.supplier_name || invoice.vendor_name;
                info.receive_date = Moment(invoice.receive_date).format("MM-DD-YYYY");
                info.total = numberFormat(invoice.grand_total);
                info.invoice_no = invoice.invoice_no;
                info.amount_paid = numberFormat(invoice.paid_amount);
                info.balance = parseFloat(
                    parseInt(invoice.grand_total) -
                    parseInt(invoice.paid_amount)
                ).toFixed(2);
                info.dr_no = invoice.dr_no || "N/A";
                info.po_id = "potato-" + invoice.po_id;
                if (invoice.payment_status === "closed") {
                    setCloseListPI((prev) => [...prev, info]);
                }
                if (invoice.payment_status === "open") {
                    setOpenListPI((prev) => [...prev, info]);
                }
            });
        }
        setShowLoader(false);
    }

    const [supplierList, setSupplierList] = useState ([]);
    const [selectedSupplier, setSelectedSupplier] = useState("");

    useEffect(()=>{
        // console.log(suppliers)
        setSupplierList(suppliers.map((supplier)=>{
            return {label: supplier.trade_name, value:supplier.id + "|" + supplier.type};
        }))
        setSupplierList((branches)=>{
            var newBranches = [...branches];
            newBranches.push({label: "All Suppliers", value:""})
            return newBranches.reverse();
        });

        // console.log(branches);
    },[suppliers])

    function handleSupplierChange(e){
        setSelectedSupplier(e.name)
        const toFilter = {target: {name: "supplier", value: e.value}};
        handleFilterChange(toFilter);
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
                info.trade_name = supplier.trade_name + " - Mango"
                info.type = "mango|supplier";
                setSuppliers((prev) => [...prev, info]);
            });
        }

        if (suppliersPotatoResponse.error) {
            TokenExpiry(suppliersPotatoResponse);
        } else {

            suppliersPotatoResponse.response.data.map((supplier) => {
                var info = supplier;
                info.trade_name = supplier.trade_name + " - Potato"
                info.type = "potato|supplier";
                setSuppliers((prev) => [...prev, info]);
            });
        }

        if (vendorsResponse.error) {
            TokenExpiry(vendorsResponse);
        } else {

            vendorsResponse.response.data.map((vendor) => {
                var info = vendor;
                info.trade_name = vendor.trade_name + " - Mango"
                info.type = "mango|vendor";
                setSuppliers((prev) => [...prev, info]);
            });
        }

        if (vendorsPotatoResponse.error) {
            TokenExpiry(vendorsPotatoResponse);
        } else {

            vendorsPotatoResponse.response.data.map((vendor) => {
                var info = vendor;
                info.trade_name = vendor.trade_name + " - Potato"
                info.type = "potato|vendor";
                setSuppliers((prev) => [...prev, info]);
            });
        }
    }

    

    async function handleDeletePI() {
        if (PIID.type === "mango") {
            const response = await deleteInvoice(PIID.id);

            if (response.data) {
                toast.success("Purchase Invoice Deleted Successfully!", {
                    style: toastStyle(),
                });
                setTimeout(() => refreshPage(), 1000);
            } else {
                TokenExpiry(response);
                toast.error("Error Deleting Purchase Invoice", {
                    style: toastStyle(),
                });
            }
        } else if (PIID.type === "potato") {
            const response = await deleteInvoicePotato(PIID.id);

            if (response.data) {
                toast.success("Purchase Invoice Deleted Successfully!", {
                    style: toastStyle(),
                });
                setTimeout(() => refreshPage(), 1000);
            } else {
                TokenExpiry(response);
                toast.error("Error Deleting Purchase Invoice", {
                    style: toastStyle(),
                });
            }
        }
    }

    /* add modal handler */
    const [showAddModal, setShowAddModal] = useState(false);
    const handleShowAddModal = () => setShowAddModal(true);
    const handleCloseAddModal = () => setShowAddModal(false);

    function handleSelectChange(e, id, row) {
        setBill(row)
        if (e.target.value === "edit-pi") {
            if (row.po_id.includes("mango")) {
                navigate("edit/" + id + "/mango");
            } else if (row.po_id.includes("potato")) {
                navigate("edit/" + id + "/potato");
            }
        } else if (e.target.value === "print-pi") {
            if (row.po_id.includes("mango")) {
                window.open(
                    "purchaseinvoices/print/" + id + "/mango", "_blank"
                );
                
            } else if (row.po_id.includes("potato")) {
                window.open(
                    "purchaseinvoices/print/" + id + "/potato", "_blank"
                );
            }
        } else if (e.target.value === "pay-pi") {
            navigate("pay-check");
        } else if (e.target.value === "delete-pi") {
            if (row.po_id.includes("mango")) {
                setPIID({ id: id, type: "mango" });
                handleShowDeleteModal();
            } else if (row.po_id.includes("potato")) {
                setPIID({ id: id, type: "potato" });
                handleShowDeleteModal();
            }
        } else if (e.target.value === "close-pi") {
            handleShowCloseBillModal();
        }
    }

    function ViewPIBtn(row) {
        return (
            <button
                name="action"
                className="btn btn-sm view-btn-table"
                id={row.id}
                onClick={(e) => handleSelectChange(e, row.id, row)}
                value="print-pi"
            >
                View
            </button>
        );
    }

    function ActionBtn(row, type) {
        return (
            <Form.Select
                name="action"
                className="PO-select-action"
                onChange={(e) => handleSelectChange(e, row.id, row)}
            >
                <option value="" hidden selected>
                    Select
                </option>
                {type === "open" &&
                (accountType === "admin" ||
                    accountType === "purchase_officer") ? (
                    <option value="edit-pi" className="color-options">
                        Edit
                    </option>
                ) : null}
                <option value="print-pi" className="color-options">
                    View
                </option>
                {type === "overpaid" &&
                (accountType === "admin" ||
                    accountType === "purchase_officer") ? (
                    <option value="close-pi" className="color-options">
                        Close bill
                    </option>
                ) : null}
                {isAdmin && (
                    <option value="delete-pi" className="color-red">
                        Delete
                    </option>
                )}
            </Form.Select>
        );
    }

    React.useEffect(() => {
        fetchSuppliers();
    }, []);

    React.useEffect(() => {
        return () => {};
    }, []);

    return (
        <div>
            <div className="page">
                <Navbar
                    onCollapse={(inactive) => {
                        setInactive(inactive);
                    }}
                    active={"PURCHASES"}
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
                        <h1 className="page-title"> PURCHASE INVOICE </h1>
                    </Col>
                    <Col xs={6} className="d-flex justify-content-end">
                        <input
                            type="search"
                            placeHolder="Search invoice no"
                            name="invoice_no"
                            value={filterConfig.invoice_no}
                            onChange={(e) => handleFilterChange(e)}
                            className="search-bar"
                        />
                        <button
                            className="add-btn"
                            onClick={handleShowAddModal}
                        >
                            Add
                        </button>
                    </Col>
                </Row>

                <Tabs
                    activeKey={filterConfig.payment_status}
                    defaultActiveKey={filterConfig.payment_status}
                    id="PO-tabs"
                    onSelect={handleTabSelect}
                >
                    <Tab eventKey="open" title="Open Bills">
                        {/* filters */}
                        <div className="my-2 ms-2 PO-filters PI-filters d-flex">
                            <span className="me-3 align-middle mt-2">
                                Filter By:
                            </span>
                            <Form.Select
                                name="type"
                                className="date-filter me-3"
                                onChange={(e) => handleFilterChange(e)}
                                value={filterConfig.type}
                            >
                                <option value="" hidden selected>
                                    Select Type
                                </option>
                                <option value="00">All</option>
                                <option value="mango">Mango Magic</option>
                                <option value="potato">Potato Corner</option>
                            </Form.Select>
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
                                defaultValue={filterConfig.supplier}
                                onChange={(e) => handleFilterChange(e)}
                            >
                                <option value="" selected>
                                    All Suppliers
                                </option>
                                {suppliers.length > 0 ? (
                                    suppliers.map((supplier) => {
                                        return (
                                            <option
                                                value={
                                                    supplier.id +
                                                    "|" +
                                                    supplier.type
                                                }
                                                selected={
                                                    supplier.id ===
                                                    filterConfig.supplier
                                                }
                                            >
                                                {supplier.trade_name}
                                            </option>
                                        );
                                    })
                                ) : (
                                    <option value="" disabled>
                                        (No suppliers found)
                                    </option>
                                )}
                            </Form.Select> */}

                            <span className="me-3 align-middle mt-2">
                                Date From:
                            </span>
                            <DatePicker
                                selected={filterConfig.date_from}
                                placeholderText={"Select Date"}
                                name="date_from"
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

                            <span className="me-3 align-middle mt-2">To:</span>
                            <DatePicker
                                selected={filterConfig.date_to}
                                placeholderText={"Select Date"}
                                name="date_to"
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, date_to: date };
                                    });
                                }}
                                minDate={filterConfig.date_from}
                                className="PI-date-btn me-3 form-control"
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
                                Total Paid Amount: {numberFormat(totalPaidAmount)}
                            </span>

                            <span className="me-4 ml-4 mt-2 ps-label">
                                Total Balance: {numberFormat(totalBalance)}
                            </span>
                        </div>

                        {/* content */}
                        <Table
                            tableHeaders={[
                                "-",
                                "DATE",
                                "SUPPLIER",
                                "INV NO.",
                                "DR NO.",
                                "TOTAL",
                                "AMT. PAID",
                                "BAL.",
                                "PYMNT STATS",
                                "PYMT REF NO",
                                "PO NO.",
                                "ACTIONS",
                            ]}
                            headerSelector={[
                                "-",
                                "receive_date",
                                "supplier",
                                "invoice_no",
                                "dr_no",
                                "total",
                                "amount_paid",
                                "balance",
                                "payment_status",
                                "",
                                "po_id",
                            ]}
                            tableData={purchaseInvoiceManager}
                            ActionBtn={(row) => ActionBtn(row, "open")}
                            ViewBtn={(row) => ViewPIBtn(row)}
                            newTabBtn={(row) => ContractBtn(row)}
                            showLoader={showLoader}
                        />
                        <div className="mb-2" />
                    </Tab>

                    <Tab eventKey="closed" title="Closed Bills">
                        {/* filters */}
                        <div className="my-2 ms-2 PO-filters PI-filters d-flex">
                            <span className="me-3 align-middle mt-2">
                                Filter By:
                            </span>
                            <Form.Select
                                name="type"
                                className="date-filter me-3"
                                onChange={(e) => handleFilterChange(e)}
                                value={filterConfig.type}
                            >
                                <option value="" hidden selected>
                                    Select Type
                                </option>
                                <option value="00">All</option>
                                <option value="mango">Mango Magic</option>
                                <option value="potato">Potato Corner</option>
                            </Form.Select>
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
                                defaultValue={filterConfig.supplier}
                                onChange={(e) => handleFilterChange(e)}
                            >
                                <option value="" selected>
                                    All Suppliers
                                </option>
                                {suppliers.length > 0 ? (
                                    suppliers.map((supplier) => {
                                        return (
                                            <option
                                                value={supplier.id +
                                                    "|" +
                                                    supplier.type}
                                                selected={
                                                    supplier.id ===
                                                    filterConfig.supplier
                                                }
                                            >
                                                {supplier.trade_name}
                                            </option>
                                        );
                                    })
                                ) : (
                                    <option value="" disabled>
                                        (No suppliers found)
                                    </option>
                                )}
                            </Form.Select> */}

                            <span className="me-3 align-middle mt-2">
                                Date From:
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

                            <span className="me-3 align-middle mt-2">To:</span>
                            <DatePicker
                                selected={filterConfig.date_to}
                                name="date_to"
                                placeholderText={"Select Date"}
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, date_to: date };
                                    });
                                }}
                                minDate={filterConfig.date_from}
                                className="PI-date-btn me-3 form-control"
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
                                Total Paid Amount: {numberFormat(totalPaidAmount)}
                            </span>

                            <span className="me-4 ml-4 mt-2 ps-label">
                                Total Balance: {numberFormat(totalBalance)}
                            </span>
                        </div>

                        {/* content */}
                        <Table
                            tableHeaders={[
                                "-",
                                "DATE",
                                "SUPPLIER",
                                "INV NO.",
                                "DR NO.",
                                "TOTAL",
                                "AMT PAID",
                                "BAL",
                                "PYMNT STATS",
                                "PYMT REF NO",
                                "PO NO.",
                                "ACTIONS",
                            ]}
                            headerSelector={[
                                "-",
                                "receive_date",
                                "supplier",
                                "invoice_no",
                                "dr_no",
                                "total",
                                "amount_paid",
                                "balance",
                                "payment_status",
                                "",
                                "po_id",
                            ]}
                            tableData={purchaseInvoiceManager}
                            ActionBtn={(row) => ActionBtn(row, "closed")}
                            ViewBtn={(row) => ViewPIBtn(row)}
                            newTabBtn={(row) => ContractBtn(row)}
                            showLoader={showLoader}
                        />
                        <div className="mb-2" />
                    </Tab>

                    <Tab eventKey="overpaid" title="Overpaid">
                        {/* filters */}
                        <div className="my-2 ms-2 PO-filters PI-filters d-flex">
                            <span className="me-3 align-middle mt-2">
                                Filter By:
                            </span>
                            <Form.Select
                                name="type"
                                className="date-filter me-3"
                                onChange={(e) => handleFilterChange(e)}
                                value={filterConfig.type}
                            >
                                <option value="" hidden selected>
                                    Select Type
                                </option>
                                <option value="00">All</option>
                                <option value="mango">Mango Magic</option>
                                <option value="potato">Potato Corner</option>
                            </Form.Select>
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
                                defaultValue={filterConfig.supplier}
                                onChange={(e) => handleFilterChange(e)}
                            >
                                <option value="" selected>
                                    All Suppliers
                                </option>
                                {suppliers.length > 0 ? (
                                    suppliers.map((supplier) => {
                                        return (
                                            <option
                                                value={supplier.id +
                                                    "|" +
                                                    supplier.type}
                                                selected={
                                                    supplier.id ===
                                                    filterConfig.supplier
                                                }
                                            >
                                                {supplier.trade_name}
                                            </option>
                                        );
                                    })
                                ) : (
                                    <option value="" disabled>
                                        (No suppliers found)
                                    </option>
                                )}
                            </Form.Select> */}

                            <span className="me-3 align-middle mt-2">
                                Date From:
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

                            <span className="me-3 align-middle mt-2">To:</span>
                            <DatePicker
                                selected={filterConfig.date_to}
                                name="date_to"
                                placeholderText={"Select Date"}
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, date_to: date };
                                    });
                                }}
                                minDate={filterConfig.date_from}
                                className="PI-date-btn me-3 form-control"
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
                                Total Paid Amount: {numberFormat(totalPaidAmount)}
                            </span>

                            <span className="me-4 ml-4 mt-2 ps-label">
                                Total Balance: {numberFormat(totalBalance)}
                            </span>
                        </div>

                        {/* content */}
                        <Table
                            tableHeaders={[
                                "-",
                                "DATE",
                                "SUPPLIER",
                                "INV NO.",
                                "DR NO.",
                                "TOTAL",
                                "AMT PAID",
                                "OVERPAID AMT",
                                "PYMNT STATS",
                                "PYMT REF NO",
                                "PO NO.",
                                "ACTIONS",
                            ]}
                            headerSelector={[
                                "-",
                                "receive_date",
                                "supplier",
                                "invoice_no",
                                "dr_no",
                                "total",
                                "amount_paid",
                                "overpaid_amount",
                                "payment_status",
                                "",
                                "po_id",
                            ]}
                            tableData={purchaseInvoiceManager}
                            ActionBtn={(row) => ActionBtn(row, "overpaid")}
                            ViewBtn={(row) => ViewPIBtn(row)}
                            newTabBtn={(row) => ContractBtn(row)}
                            showLoader={showLoader}
                        />
                        <div className="mb-2" />
                    </Tab>
                </Tabs>
            </div>
            <DeleteModal
                show={showDeleteModal}
                onHide={() => handleCloseDeleteModal()}
                text="purchase invoice"
                onDelete={() => handleDeletePI()}
            />
            <AddModal show={showAddModal} hide={handleCloseAddModal} />
            <CloseBillModal
                show={showCloseBillModal}
                hide={handleCloseCloseBillModal}
                type="close"
                selectedRow={bill}
                page={"view"}
            />
        </div>
    );
}
