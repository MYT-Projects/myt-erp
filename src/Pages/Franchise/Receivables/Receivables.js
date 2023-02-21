import React, { useState, useEffect } from "react";
import { Col, Form, Row, Tab, Tabs } from "react-bootstrap";
import toast from "react-hot-toast";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import Delete from "../../../Components/Modals/DeleteModal";
import Navbar from "../../../Components/Navbar/Navbar";
import Table from "../../../Components/TableTemplate/Table";
import {
    dateFormat,
    formatDateNoTime,
    formatDate,
    numberFormat,
    refreshPage,
    toastStyle,
    getTodayDate,
    getType,
} from "../../../Helpers/Utils/Common";
import DatePicker from "react-datepicker";
import Moment from "moment";
import "./../Franchise.css";

import { getAllFranchisee } from "../../../Helpers/apiCalls/franchiseeApi";
import {
    getAllReceivables,
    getReceivable,
    searchReceivables,
    searchFranchisee,
    getAllReceivablesDate,
} from "../../../Helpers/apiCalls/Franchise/ReceivablesApi";
import ViewModal from "../../../Components/Modals/ViewModal";

export default function Receivables() {
    let navigate = useNavigate();
    const accountType = getType();

    /* delete modal handler */
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const handleShowDeleteModal = () => setShowDeleteModal(true);
    const handleCloseDeleteModal = () => refreshPage();
    const [paymentDeets, setPaymentDeets] = useState({ id: "", payment: "" });
    const [filterDate, setFilterDate] = useState({
        to: getTodayDate(),
        from: getTodayDate(),
    });

    // VIEW SALES MODAL
    const [showViewSaleModal, setShowViewSaleModal] = useState(false);
    const handleShowViewSaleModal = (id) => {
        fetchReceivable(id);
        setShowViewSaleModal(true);
    };
    const handleCloseViewSaleModal = () => setShowViewSaleModal(false);

    // VIEW SALES BILLING MODAL
    const [showViewSaleBillingModal, setShowViewSaleBillingModal] =
        useState(false);
    const handleShowViewSaleBillingModal = (id) => {
        fetchReceivable(id);
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

    const [franchisees, setFranchisees] = useState([]);
    const [franchiseesData, setFranchiseesData] = useState([]);
    const [receivableData, setReceivableData] = useState([]);
    const [summaryData, setSummaryData] = useState([]);
    const [salesData, setSalesData] = useState([]);
    const [salesBillingData, setSalesBillingData] = useState([]);
    const [totalContract, setTotalContract] = useState(0);
    const [totalSales, setTotalSales] = useState(0);
    const [totalBilling, setTotalBilling] = useState(0);
    const [allTotal, setAllTotal] = useState(0);
    const [search, setSearch] = useState(false);

    async function fetchFranchisee() {
        setShowLoader(true);

        const response = await getAllFranchisee();
        if (response.error) {
            
        } else {
            setFranchisees(response.data.data);
            var allFranchisee = response.data.data.map((data) => {
                fetchAllReceivables(data.branch_id);
                var franchise = data;
                franchise.franchise_name = data.name;
                franchise.franchise = data.name;
                franchise.contract = "0";
                franchise.sale = "0";
                franchise.sale_billing = "0";
                franchise.total = "0";
                return franchise;
            });
            setFranchiseesData(allFranchisee);
        }
        setShowLoader(false);
    }


    async function fetchFilteredPI(value) {
        setFranchiseesData([]);
        const response = await searchFranchisee(value);
        if (response.error) {

        } else {
            var allFranchisee = response.data.data.filter((data) => data.name === value)
            .map((data) => {
                fetchAllReceivables(data.branch_id);
                var franchise = data;
                franchise.franchise_name = data.name;
                franchise.franchise = data.name;
                franchise.contract = "0";
                franchise.sale = "0";
                franchise.sale_billing = "0";
                franchise.total = "0";
                return franchise;
            });
            setFranchiseesData(allFranchisee);
        }
        setShowLoader(false);
    }

    const [inactive, setInactive] = useState(true);
    const [dateto, setDateto] = useState("");
    const [datefrom, setDatefrom] = useState("");

    const [showLoader, setShowLoader] = useState(false);

    async function fetchAllReceivables(branch_id) {
        setSummaryData([])
        setShowLoader(true);
        const response = await getAllReceivables(branch_id);
        var contractTotal = 0;
        var salesTotal = 0;
        var billTotal = 0;
        var all = 0;
        if (response.data) {
            var receivables = response.data.receivables.map((data) => {
                var receive = data;
                receive.type = data.type;
                receive.balance = data.balance;
                return receive;
            });

            var summary = []
            summary = response.data.summary
            setSummaryData((prev) => [...prev, summary]);
            
            setReceivableData(receivables);
        }

        setShowLoader(false);
    }
    

    async function fetchFranchiseeDateFilter(e) {
        setShowLoader(true);

        const { name, value } = e.target;
        var filterDateNew = filterDate;
        filterDateNew[name] = value;
        setFilterDate(filterDateNew);

        const response = await getAllFranchisee();
        if (response.error) {
            
        } else {
            setFranchisees(response.data.data);
            var allFranchisee = response.data.data.map((data) => {
                filterDateReceivable(e, data.branch_id);
                var franchise = data;
                franchise.franchise_name = data.name;
                franchise.franchise = data.name;
                franchise.contract = "0";
                franchise.sale = "0";
                franchise.sale_billing = "0";
                franchise.total = "0";
                return franchise;
            });
            setFranchiseesData(allFranchisee);
        }
        setShowLoader(false);
    }

    async function filterDateReceivable(e, id) {
        setShowLoader(true);

        const response = await getAllReceivablesDate(filterDate);
        if (response.error) {
            
        } else {
            var receivables = response.data.receivables.map((data) => {
                var receive = data;
                receive.type = data.type;
                receive.balance = data.balance;
                return receive;
            });
            setReceivableData(receivables);
        }
        setShowLoader(false);
    }

    function handleSetReceivable() {
        var sortedData = franchiseesData.sort((a, b) =>
            a.branch_name > b.branch_name
                ? 1
                : b.branch_name > a.branch_name
                ? -1
                : 0
        );
        
        var filterFranchisee = sortedData.map((data) => {
            var fran = data;
            var filter = receivableData.filter((receive) => {
                return receive.branch_id === data.branch_id;
            });

            filter.map((r, i) => {
                var zero = 0;
                if (i === 0) {
                    fran.total = numberFormat(parseFloat(r.balance).toFixed(2));
                } else {
                    fran.total = numberFormat(
                        parseFloat(fran.total.replace(/,/g, "")) +
                            parseFloat(r.balance.replace(/,/g, ""))
                    );
                }
                if (r.type === "franchisee_sale_billing") {
                    fran.sale_billing = numberFormat(r.balance);
                } else if (r.type === "franchisee_sale") {
                    fran.sale = numberFormat(r.balance);
                } else if (r.type === "franchisee") {
                    fran.contract = numberFormat(r.balance);
                }
            });
            return fran;

        });
        setFranchiseesData(filterFranchisee);
    }

    function handleSetTotal() {
        setTotalContract(0)
        setTotalSales(0)
        setTotalBilling(0)
        setAllTotal(0)
        var contract = summaryData
            .map((data) => data.contract)
            .reduce((a, b) => parseInt(a) + parseInt(b), 0);
        var sales = summaryData
            .map((data) => data.sales)
            .reduce((a, b) => parseInt(a) + parseInt(b), 0);
        var monthly_billables = summaryData
            .map((data) => data.monthly_billables)
            .reduce((a, b) => parseInt(a) + parseInt(b), 0);
        var total = summaryData
            .map((data) => data.total)
            .reduce((a, b) => parseInt(a) + parseInt(b), 0);

        setTotalContract(contract)
        setTotalSales(sales)
        setTotalBilling(monthly_billables)
        setAllTotal(total)
    }

    async function fetchReceivable(id) {
        setShowLoader(true);
        setSalesData([]);
        setSalesBillingData([]);
        const response = await getReceivable(id);
        if (response.data) {
            response.data.receivables.map((data) => {
                var receive = data;
                if (data.type === "franchisee_sale") {
                    setSalesData((prev) => [...prev, receive]);
                }
                if (data.type === "franchisee_sale_billing") {
                    setSalesBillingData((prev) => [...prev, receive]);
                }
            });
        }
        setShowLoader(false);
    }

    // SEARCH USER
    function handleOnSearch(e) {
        setSearch(true)
        fetchFilteredPI(e.target.value);
        setTimeout(() => setSearch(false), 1);
        handleSetTotal()
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

    function PrintBtn(row) {
        return (
            <button
                name="action"
                className="btn btn-sm view-btn-table"
                id={row.id}
                onClick={() => handlePrint(row.id)}
            >
                Print
            </button>
        );
    }
    function handlePrint(id) {
        {window.open('/receivables/print/' + id)};
    }

    function ContractBtn(row) {
        return (
            <span
                className=" align-middle ps-label"
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

    function SaleBtn(row) {
        return (
            <span
                className=" align-middle ps-label"
                onClick={() => handleShowViewSaleModal(row.branch_id)}
            >
                {row.sale}
            </span>
        );
    }

    function SaleBillingBtn(row) {
        return (
            <span
                className=" align-middle ps-label"
                onClick={() => handleShowViewSaleBillingModal(row.branch_id)}
            >
                {row.sale_billing}
            </span>
        );
    }

    function handleViewBtn(id, type) {
        if (type === "sales") {
            {
                window.open("/salesinvoice/print/" + id);
            }
        }
        if (type === "sales_billing") {
            {
                window.open("/franchisebilling/view/" + id);
            }
        }
    }

    const [branchOptions, setBranchOptions] = useState ([]);

    React.useEffect(() => {
        fetchFranchisee();     
    }, []);

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
        const toFilter = {target: {name: "franchise", value: e.value}};
        handleOnSearch(toFilter);
    }


    React.useEffect(() => {
        handleSetReceivable();
        handleSetTotal();
    }, [receivableData, search]);


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
                <Row className="mb-2">
                    <Col xs={6}>
                        <h1 className="page-title"> RECEIVABLES </h1>
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
                            placeholder="Select Franchisee"
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
                            options={branchOptions}
                            onChange={handleBranchChange}
                        />
                        {/* <Form.Select
                            name="franchise"
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

                        <span className="me-2 ml-4 align-middle mt-2 ps-label">
                            Contract: {numberFormat(totalContract)}
                        </span>

                        <span className="me-2 ml-4 align-middle mt-2 ps-label">
                            Sales: {numberFormat(totalSales)}
                        </span>

                        <span className="me-2 ml-4 align-middle mt-2 ps-label">
                            Billing: {numberFormat(totalBilling)}
                        </span>

                        <span className="me-2 ml-4 align-middle mt-2 ps-label">
                            Total: {numberFormat(allTotal)}
                        </span>
                    </div>

                    <div className="below">
                        {/* table */}
                        <Table
                            tableHeaders={[
                                "BRANCH NAME",
                                "FRANCHISEE NAME",
                                "CONTRACT",
                                "SALES",
                                "MONTHLY BILLABLES",
                                "TOTAL",
                                "-",
                            ]}
                            headerSelector={[
                                "branch_name",
                                "franchise_name",
                                "contract",
                                "sale",
                                "sale_billing",
                                "total",
                            ]}
                            tableData={franchiseesData}
                            SaleBtn={(row) => SaleBtn(row)}
                            ContractBtn={(row) => ContractBtn(row)}
                            ViewBtn={(row) => PrintBtn(row)}
                            SaleBillingBtn={(row) => SaleBillingBtn(row)}
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
            <ViewModal
                title="SALES"
                size="xl"
                type="sales"
                withHeader={true}
                show={showViewSaleModal}
                onHide={handleCloseViewSaleModal}
                onSave={() => alert("Save")}
            >
                <div className="mt-3 edit-form">
                    {salesData?.map((data, index) => {
                        return (
                            <Row className="nc-modal-custom-row mt-0 mb-5">
                                <Col>
                                    <span className="nc-modal-custom-row uppercase">
                                        INVOICE No.{data.id}
                                    </span>
                                </Col>
                                <Col>
                                    <span className="nc-modal-custom-row uppercase">
                                        {" "}
                                        SALES DATE:{" "}
                                    </span>
                                    <br/>
                                    {formatDateNoTime(data.added_on)}
                                </Col>
                                <Col>
                                    <span className="nc-modal-custom-row uppercase">
                                        {" "}
                                        TOTAL:{" "}
                                    </span>
                                    <br/>
                                    {numberFormat(data.grand_total)}
                                </Col>
                                <Col>
                                    <span className="nc-modal-custom-row uppercase">
                                        {" "}
                                        PAID AMOUNT:{" "}
                                    </span>
                                    <br/>
                                    {numberFormat(data.paid_amount)}
                                </Col>
                                <Col>
                                    <span className="nc-modal-custom-row uppercase">
                                        {" "}
                                        BALANCE:{" "}
                                    </span>
                                    <br/>
                                    {numberFormat(data.balance)}
                                </Col>
                                <Col>
                                    <button
                                        type="button"
                                        className="btn btn-sm view-btn-table"
                                        onClick={() =>
                                            handleViewBtn(data.id, "sales")
                                        }
                                    >
                                        View
                                    </button>
                                </Col>
                            </Row>
                        );
                    })}
                </div>
            </ViewModal>
            <ViewModal
                title="SALES BILLING"
                size="xl"
                type="sale billing"
                withHeader={true}
                show={showViewSaleBillingModal}
                onHide={handleCloseViewSaleBillingModal}
                onSave={() => alert("Save")}
            >
                <div className="mt-3 edit-form">
                    {salesBillingData?.map((data, index) => {
                        return (
                            <Row className="nc-modal-custom-row mt-0 mb-2">
                                <Col>
                                    <span className="nc-modal-custom-row uppercase">
                                        MONTH:
                                        <br/>
                                        {new Date(data.month).toLocaleDateString("en-us",{ month:"long"}) + " " + new Date(data.month).getFullYear()} 
                                    </span>
                                </Col>
                                <Col>
                                    <span className="nc-modal-custom-row uppercase">
                                        {" "}
                                        TOTAL:{" "}
                                    </span>
                                    <br/>
                                    {numberFormat(data.grand_total)}
                                </Col>
                                <Col>
                                    <span className="nc-modal-custom-row uppercase">
                                        {" "}
                                        PAID AMOUNT:{" "}
                                    </span>
                                    <br/>
                                    {numberFormat(data.paid_amount)}
                                </Col>
                                <Col>
                                    <span className="nc-modal-custom-row uppercase">
                                        {" "}
                                        BALANCE:{" "}
                                    </span>
                                    <br/>
                                    {numberFormat(data.balance)}
                                </Col>
                                <Col>
                                    <button
                                        type="button"
                                        className="btn btn-sm view-btn-table"
                                        onClick={() =>
                                            handleViewBtn(
                                                data.id,
                                                "sales_billing"
                                            )
                                        }
                                    >
                                        View
                                    </button>
                                </Col>
                            </Row>
                        );
                    })}
                </div>
            </ViewModal>
        </div>
    );
}
