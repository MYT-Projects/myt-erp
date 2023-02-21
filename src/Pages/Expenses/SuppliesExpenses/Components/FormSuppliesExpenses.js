import React, { useState } from "react";
import { Button, Col, Form, Row, Table } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../../Components/Navbar/Navbar";
import trash from "./../../../../Assets/Images/trash.png";
import Select from "react-select";
import "../../PurchaseOrders/PurchaseOrders.css";
import { getAllSuppliers } from "../../../../Helpers/apiCalls/suppliersApi";
import { getAllForwarders } from "../../../../Helpers/apiCalls/forwardersApi";
import {
    capitalizeFirstLetter,
    numberFormat,
    refreshPage,
    toastStyle,
    TokenExpiry,
    getTodayDateISO,
    getTodayDateISOFormat,
} from "../../../../Helpers/Utils/Common";
import toast from "react-hot-toast";
import {
    createSuppliesExpense,
    editSuppliesExpense,
    getAllBranches,
    getSingleSuppliesExpense,
    approveSuppliesExpense,
} from "../../../../Helpers/apiCalls/Purchases/suppliesExpensesApi";
import InputError from "../../../../Components/InputError/InputError";
import AddModal from "../../../../Components/Modals/AddModal";
import { createSupplier } from "../../../../Helpers/apiCalls/suppliersApi";
import { validateAddSO } from "../../../../Helpers/Validation/Purchase/SuppliersOrderValidation";
import {
    createVendor,
    getAllVendors,
} from "../../../../Helpers/apiCalls/Manage/Vendors";
import { validateVendors } from "../../../../Helpers/Validation/Manage/VendorsValidation";
import { getAllEmployees } from "../../../../Helpers/apiCalls/employeesApi";
import ReactLoading from "react-loading";

function FormSuppliesExpenses({ add, edit }) {
    const [isSaveClicked, setIsSaveClicked] = useState(false);
    const [isSubmitClicked, setIsSubmitClicked] = useState(false);
    const [addVendorIsSaveClicked, setAddVendorIsSaveClicked] = useState(false);
    let navigate = useNavigate();
    let { id, type } = useParams();
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
                name: "requisitioner",
            };
        });
        setEmployees(result);
    }
    const today = getTodayDateISO();
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
    const typeOptions = [
        {
            id: 1,
            name: "type_id",
            value: "Transportation",
            label: "Transportation",
        },
        {
            id: 2,
            name: "type_id",
            value: "Kiosk construction",
            label: "Kiosk Construction",
        },
        {
            id: 3,
            name: "type_id",
            value: "Office supplies",
            label: "Office Supplies",
        },
        {
            id: 4,
            name: "type_id",
            value: "Store supplies",
            label: "Store Supplies",
        },
        {
            id: 5,
            name: "type_id",
            value: "Rental",
            label: "Rental",
        },
        {
            id: 6,
            name: "type_id",
            value: "CUSA + Aircon",
            label: "CUSA + Aircon",
        },
        {
            id: 7,
            name: "type_id",
            value: "Salaries + 13th Month",
            label: "Salaries + 13th Month",
        },
        {
            id: 8,
            name: "type_id",
            value: "Benefits - Employer Share",
            label: "Benefits - Employer Share",
        },
        {
            id: 9,
            name: "type_id",
            value: "Professional Fees",
            label: "Professional Fees",
        },
        {
            id: 10,
            name: "type_id",
            value: "Repairs and Maintenance",
            label: "Repairs and Maintenance",
        },
        {
            id: 11,
            name: "type_id",
            value: "Communication",
            label: "Communication",
        },
        {
            id: 12,
            name: "type_id",
            value: "Insurance",
            label: "Insurance",
        },
        {
            id: 13,
            name: "type_id",
            value: "Pest Control",
            label: "Pest Control",
        },
        {
            id: 14,
            name: "type_id",
            value: "Logistics",
            label: "Logistics",
        },
        {
            id: 15,
            name: "type_id",
            value: "Rental - Payable from Sales",
            label: "Rental - Payable from Sales",
        },
        {
            id: 16,
            name: "type_id",
            value: "Marketing",
            label: "Marketing",
        },
        {
            id: 17,
            name: "type_id",
            value: "Permits & Liscense Renewal",
            label: "Permits & Liscense Renewal",
        },
        {
            id: 18,
            name: "type_id",
            value: "Operating Supplies",
            label: "Operating Supplies",
        },
        {
            id: 19,
            name: "type_id",
            value: "Others",
            label: "Others",
        },
        {
            id: 20,
            name: "type_id",
            value: "Water",
            label: "Water",
        },
        {
            id: 21,
            name: "type_id",
            value: "Electricity",
            label: "Electricity",
        },
    ];
    const [otherType, setOtherType] = useState(false);
    const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
    const handleShowAddSupplierModal = () => setShowAddSupplierModal(true);
    const handleCloseAddSupplierModal = () => {
        setShowAddSupplierModal(false);
    };

    const [inactive, setInactive] = useState(true);
    const [showLoader, setShowLoader] = useState(false);
    const [grandTotal, setGrandTotal] = useState("0");
    const [branches, setBranches] = useState([]);
    const [branchList, setBranchList] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [forwarders, setForwarders] = useState([]);
    const [newSE, setNewSE] = useState({
        requisitioner: "",
        supplier_id: "",
        vendor_id: "",
        branch_id: "",
        forwarder_id: "",
        type: "",
        supplies_expense_date: getTodayDateISO(),
        delivery_date: new Date().toLocaleDateString("en-CA"),
        delivery_address:
            "Tacloban City Ice Plant, 164 Justice Romualdez St. Tacloban City, Leyte",
        remarks: "",
        grand_total: 0,
        is_save: "",
    });
    const [items, setItems] = useState([
        { name: "", qty: "1", unit: "", price: "0", type: "", amount: "0", remarks: "", },
        { name: "", qty: "1", unit: "", price: "0", type: "", amount: "0", remarks: "", },
        { name: "", qty: "1", unit: "", price: "0", type: "", amount: "0", remarks: "", },
    ]);
    const [supplierValue, setSupplierValue] = useState({
        name: "supplier_id",
        label: "",
        value: "",
    });
    const [forwardersValue, setForwardersValue] = useState({
        name: "forwarder_id",
        label: "",
        value: "",
    });
    const [requisitionerValue, setRequisitionerValue] = useState({
        name: "requisitioner",
        label: "",
        value: "",
    });
    const [typeValue, setTypeValue] = useState({
        name: "type_id",
        label: "",
        value: "",
    });
    const [branchValue, setBranchValue] = useState({
        name: "branch_id",
        label: "",
        value: "",
    });

    const [isError, setIsError] = useState({
        supplierName: false,
        purchaseDate: false,
        deliveryDate: false,
        requisitioner: false,
        deliveryAddress: false,
        type: false,
        SEItems: false,
    });

    const [supplierHasUpdated, setSupplierHasUpdated] = useState(false);
    async function handleAddSupplier() {
        if (validateVendors(supplierDetails, setIsError)) {
            setAddVendorIsSaveClicked(true);
            const response = await createVendor(supplierDetails);
            if (response.response) {
                toast.success(response.response.response, {
                    style: toastStyle(),
                });
                setSupplierHasUpdated(!supplierHasUpdated);
                handleCloseAddSupplierModal();
            } else {
                setAddVendorIsSaveClicked(false);
                toast.error("Error Creating New Vendor", {
                    style: toastStyle(),
                });
            }
        }
    }

    function AddItem() {
        const newItem = {
            name: "",
            qty: 1,
            unit: "",
            price: 0,
            type: "",
            amount: 0,
            remarks: "",
        };
        setItems((prevItems) => [...prevItems, newItem]);
    }

    function renderTable() {
        return (
            <Table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Unit</th>
                        <th>Unit Price</th>
                        <th>Amount</th>
                        <th>Remarks</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => {
                        return (
                            <tr key={item.id}>
                                <td>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        defaultValue={item.name}
                                        onChange={(e) =>
                                            handleItemChange(e, index)
                                        }
                                    />
                                </td>
                                <td>
                                    <Form.Control
                                        type="text"
                                        name="qty"
                                        defaultValue={item.qty}
                                        onChange={(e) =>
                                            handleItemChange(e, index)
                                        }
                                    />
                                </td>
                                <td>
                                    <Form.Control
                                        type="text"
                                        name="unit"
                                        defaultValue={item.unit}
                                        onChange={(e) =>
                                            handleItemChange(e, index)
                                        }
                                    />
                                </td>
                                <td className="row align-contents">
                                    <Col xs={2} className="align-middle">
                                        PHP
                                    </Col>
                                    <Col>
                                        <Form.Control
                                            type="text"
                                            name="price"
                                            defaultValue={item.price}
                                            onChange={(e) =>
                                                handleItemChange(e, index)
                                            }
                                        />
                                    </Col>
                                </td>
                                <td>
                                    {showLoader
                                        ? null
                                        : item.qty && item.price
                                        ? "PHP " +
                                          numberFormat(
                                              parseFloat(item.qty) *
                                                  parseFloat(item.price)
                                          )
                                        : "PHP 0.00"}
                                </td>
                                <td>
                                <Form.Control
                                        type="text"
                                        name="remarks"
                                        defaultValue={item.remarks}
                                        onChange={(e) =>
                                            handleItemChange(e, index)
                                        }
                                    />
                                </td>
                                <td>
                                    <img
                                        src={trash}
                                        onClick={() => handleRemoveItem(index)}
                                        className="cursor-pointer"
                                    />
                                </td>
                            </tr>
                        );
                    })}
                    <tr>
                        <td colSpan={4}></td>
                        <td
                            align="center"
                            className="print-table-footer-label grand-label"
                        >
                            GRAND TOTAL
                        </td>
                        <td
                            align="center"
                            className="print-table-footer-data grand-label"
                        >
                            {showLoader
                                ? null
                                : grandTotal
                                ? "PHP " + numberFormat(grandTotal)
                                : "PHP 0.00"}
                        </td>
                        <td></td>
                    </tr>
                </tbody>
            </Table>
        );
    }

    function handleItemChange(e, id) {
        const { name, value } = e.target;

        if (name === "qty" || name === "price") {
            setShowLoader(true);
        }

        items.map((item, index) => {
            item.total = parseFloat(item.total);
            if (index === id) {
                item[name] = value;
                if (value === "") item[name] = "0";
                item.total = parseFloat(item.qty) * parseFloat(item.price);
            }
        });

        var total = 0;
        for (var i = 0; i < items.length; i++) {
            total += items[i].total;
        }
        setGrandTotal(total);
        setItems(items);
        setNewSE(newSE);

        setTimeout(() => setShowLoader(false), 1);
    }

    function handleRemoveItem(id) {
        setShowLoader(true);
        const rowId = id;
        const newItemList = [...items];
        newItemList.splice(rowId, 1);
        setItems(newItemList);

        setGrandTotal(
            newItemList.map((item) => item.total).reduce((a, b) => a + b, 0)
        );

        setTimeout(() => setShowLoader(false), 1);
    }

    function handleSelectChange(e) {
        console.log(e.name, e.value)
        const newList = newSE;
        newList[e.name] = e.value;
        setNewSE(newList);

        //Checking if selected is vendor or supplier
        if (e.name === "supplier_id") {
            setSupplierValue({ name: e.name, label: e.label, value: e.value });
            var address = suppliers.filter((data) => data.value === e.value)[0]
                .trade_address;
            if (e.value.split("-")[0] === "vendor") {
                setNewSE({
                    ...newSE,
                    vendor_id: e.value.split("-")[1],
                    supplier_id: "",
                });
            } else if (e.value.split("-")[0] === "supplier") {
                setNewSE({
                    ...newSE,
                    vendor_id: "",
                    supplier_id: e.value.split("-")[1],
                });
            }
        } else if (e.name === "branch_id") {
            setBranchValue({ name: e.name, label: e.label, value: e.value });
            var address = branchList.filter((data) => data.id === e.value)[0]
                .address;
            setNewSE({
                ...newSE,
                delivery_address: address !== null ? address : "",
                branch_id: e.value,
            });
        } else if (e.name === "type_id") {
            setTypeValue({ name: e.name, label: e.label, value: e.value });
            setNewSE({
                ...newSE,
                type: e.value,
            });
        } else if (e.name === "forwarder_id") {
            setForwardersValue({
                name: e.name,
                label: e.label,
                value: e.value,
            });
        } else if (e.name === "requisitioner") {
            setRequisitionerValue({
                name: e.name,
                label: e.label,
                value: e.value,
            });
            setNewSE({
                ...newSE,
                requisitioner: e.value,
            });
        }
    }

    function handleSEChange(e) {
        const { name, value } = e.target;
        setNewSE((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    }

    function handleSubmit() {
        if (add) saveNewSE();
        if (edit) editSE();
    }

    /** GET API - Branches **/
    async function fetchBranches() {
        const response = await getAllBranches();

        if (response.data) {
            var data = response.data.data;
            data.map((branch) => {
                var info = {};

                info.name = "branch_id";
                info.label = branch.name;
                info.value = branch.id;
                branchList.push(branch);
                setBranches((prev) => [...prev, info]);
            });
        }
    }

    /** GET API - Suppliers **/
    async function fetchSuppliers() {
        setSuppliers([]);

        const response = await getAllVendors();
        const response2 = await getAllSuppliers();
        if (response.error) {
            TokenExpiry(response);
        }
        var vendors = response.response.data.sort((a, b) =>
            a.trade_name > b.trade_name
                ? 1
                : b.trade_name > a.trade_name
                ? -1
                : 0
        );
        var suppliers = response2.data.data.sort((a, b) =>
            a.trade_name > b.trade_name
                ? 1
                : b.trade_name > a.trade_name
                ? -1
                : 0
        );

        var suppliersAndVendors = [];
        suppliers.map((supplier) => {
            var info = {};

            info.name = "supplier_id";
            info.label = supplier.trade_name;
            info.value = "supplier-" + supplier.id;
            info.trade_address = supplier.trade_address;
            suppliersAndVendors.push(info);
        });
        vendors.map((supplier) => {
            var info = {};

            info.name = "supplier_id";
            info.label = supplier.trade_name;
            info.value = "vendor-" + supplier.id;
            info.trade_address = supplier.trade_address;
            suppliersAndVendors.push(info);
        });
        setSuppliers(suppliersAndVendors);
    }

    async function fetchForwarders() {
        setForwarders([]);

        const response = await getAllForwarders();
        var forwarders = response.data.sort((a, b) =>
            a.name > b.name ? 1 : b.name > a.name ? -1 : 0
        );

        forwarders.map((forwarder) => {
            var info = {};

            info.name = "forwarder_id";
            info.label = forwarder.name;
            info.value = forwarder.id;

            setForwarders((prev) => [...prev, info]);
        });
    }

    /** POST API - Save new supplies expense **/
    async function saveNewSE() {
        var hasItems = items.length > 0 ? true : false;
        var hasItemContent = hasItems
            ? items[0].qty != "" &&
              items[0].unit != "" &&
              items[0].qty != "0" &&
              items[0].unit != 0
            : false;
        isError["SEItems"] = !(hasItems && hasItemContent);
        if (isSaveClicked || isSubmitClicked) {
            return;
        }
        if (newSE.is_save === 0) {
            if (validateAddSO(newSE, setIsError) && !isError.SEItems) {
                setIsSubmitClicked(true);
                const response = await createSuppliesExpense(newSE, items);

                if (response.status === 200) {
                    toast.success("Supplies Expenses Created Successfully!", {
                        style: toastStyle(),
                    });
                    setTimeout(() => {
                        navigate(
                            "/suppliesexpenses/review/" +
                                response.data.supplies_expense_id
                        );
                    }, 1000);
                } else {
                    toast.error("Error Creating Supplies Expenses", {
                        style: toastStyle(),
                    });
                    setTimeout(() => refreshPage(), 1000);
                }
            }
        } else {
            setIsSaveClicked(true);
            if (validateAddSO(newSE, setIsError) && !isError.SEItems) {
                const response = await createSuppliesExpense(newSE, items);

                if (response.status === 200) {
                    toast.success("Supplies expense saved successfully!", {
                        style: toastStyle(),
                    });
                    setTimeout(() => {
                        navigate("/suppliesexpenses");
                        refreshPage();
                    }, 1000);
                } else {
                    toast.error("Error saving supplies expenses", {
                        style: toastStyle(),
                    });
                    setTimeout(() => refreshPage(), 1000);
                }
            }
        }
    }

    /** POST API - Edit old supplies expense **/
    async function editSE() {
        newSE.status = "for_approval";
        var hasItems = items.length > 0 ? true : false;
        var hasItemContent = hasItems
            ? items[0].qty != "" &&
              items[0].unit != "" &&
              items[0].qty != "0" &&
              items[0].unit != 0
            : false;
        isError["SEItems"] = !(hasItems && hasItemContent);
        if (isSaveClicked || isSubmitClicked) {
            return;
        }
        if (newSE.is_save === 0) {
            if (validateAddSO(newSE, setIsError) && !isError.SEItems) {
                setIsSaveClicked(true);
                setIsSubmitClicked(true);

                const response = await editSuppliesExpense(newSE, items, id);
                if (response.data) {
                    const response = await approveSuppliesExpense(id, "for_approval");
                    if (response.data) {
                        toast.success("Supplies Expenses Updated Successfully!", {
                            style: toastStyle(),
                        });
                        setTimeout(() => {
                            navigate("/suppliesexpenses/review/" + id);
                        }, 1000);
                    } else {
                        toast.error("Error Updating Supplies Expenses", {
                            style: toastStyle(),
                        });
                    }
                    
                } else {
                    toast.error("Error Updating Supplies Expenses", {
                        style: toastStyle(),
                    });
                    setTimeout(() => refreshPage(), 1000);
                }
            }
        } else {
            const response = await editSuppliesExpense(newSE, items, id);
            if (response.data) {
                toast.success("Supplies Expenses Updated Successfully!", {
                    style: toastStyle(),
                });
                setTimeout(() => {
                    navigate("/suppliesexpenses");
                    refreshPage();
                }, 1000);
            } else {
                toast.error("Error Updating Supplies Expenses", {
                    style: toastStyle(),
                });
                setTimeout(() => refreshPage(), 1000);
            }
        }
    }

    /** GET API - Get single supplies expense **/
    async function fetchSingleSuppliesExpense(id) {
        const response = await getSingleSuppliesExpense(id);
        if (response.data) {
            var data = response.data.data[0];
            data.delivery_date = getTodayDateISOFormat(data.delivery_date)
            data.supplies_expense_date = getTodayDateISOFormat(data.supplies_expense_date)
            setNewSE(data);
            setGrandTotal(data.grand_total);
            setItems(data.se_items);
            setSupplierValue({
                name: data.supplier_trade_name ? "supplier_id" : "vendor_id",
                label: data.supplier_trade_name || data.vendor_trade_name,
                value: data.supplier_id || data.vendor_id,
            });
            setRequisitionerValue({
                name: "requisitioner",
                label: data.requisitioner_name,
                value: data.requisitioner,
            });
            setBranchValue({
                name: "branch_id",
                label: data.branch_name,
                value: data.branch_id,
            });
            setForwardersValue({
                name: "forwarder_id",
                label: data.forwarder_name,
                value: data.forwarder_id,
            });
            setTypeValue({
                name: "type_id",
                label: capitalizeFirstLetter(data.type),
                value: data.type,
            });
        }
    }

    React.useEffect(() => {
        fetchSuppliers();
    }, [supplierHasUpdated]);

    React.useEffect(() => {
        if (edit) {
            fetchSingleSuppliesExpense(id);
        }
        fetchSuppliers();
        fetchBranches();
        fetchForwarders();
        fetchEmployees();
    }, []);

    React.useEffect(() => {
    }, [newSE]);

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
                    <h1 className="page-title mb-4">
                        {add && "ADD SUPPLIES EXPENSE"}
                        {edit && "EDIT SUPPLIES EXPENSE"}{" "}
                    </h1>
                </div>

                {/* content */}

                <div className="edit-form">
                    <Row className="pt-3 mb-2">
                        <Col xs={6}>
                            <span className="edit-label">
                                Vendor Name{" "}
                                <label className="badge-required">{` *`}</label>
                            </span>
                        </Col>
                        <Col xs={3}>
                            <span className="edit-label">
                                Purchase Date{" "}
                                <label className="badge-required">{` *`}</label>
                            </span>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={6}>
                            <Select
                                className="react-select-container"
                                classNamePrefix="react-select"
                                placeholder="Select Supplier..."
                                value={supplierValue}
                                options={suppliers}
                                onChange={(e) => handleSelectChange(e)}
                            />
                            <InputError
                                isValid={isError.supplierName}
                                message={"Supplier Name is required"}
                            />
                            <div className="d-flex justify-content-end">
                                <span
                                    className="edit-label"
                                    style={{ color: "#df1227" }}
                                >
                                    Vendor Not Found?{" "}
                                    <a
                                        onClick={handleShowAddSupplierModal}
                                        className="add-supplier-label"
                                    >
                                        Click here to add vendor
                                    </a>
                                </span>
                            </div>
                        </Col>

                        <Col xs={6}>
                            <Form.Control
                                className="nc-modal-custom-text"
                                type="date"
                                name="supplies_expense_date"
                                defaultValue={newSE.supplies_expense_date}
                                onChange={(e) => handleSEChange(e)}
                            />
                            <InputError
                                isValid={isError.purchaseDate}
                                message={"Purchase date is required"}
                            />
                            <div className="d-flex justify-content-end">
                                <span
                                    className="edit-label"
                                    style={{ color: "white" }}
                                >{` -`}</span>
                            </div>
                        </Col>
                    </Row>

                    <Row className="mt-4 mb-2">
                        <Col xs={4}>
                            <span className="edit-label">Branch</span>
                        </Col>
                        <Col xs={4}>
                            <span className="edit-label">Forwarder</span>
                        </Col>
                        <Col xs={4}>
                            <span className="edit-label">
                                Requested by{" "}
                                <label className="badge-required">{` *`}</label>
                            </span>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={4}>
                            <Select
                                className="react-select-container"
                                classNamePrefix="react-select"
                                placeholder="Select Branch..."
                                value={branchValue}
                                options={branches}
                                onChange={(e) => handleSelectChange(e)}
                            />
                        </Col>
                        <Col xs={4}>
                            <Select
                                className="react-select-container"
                                classNamePrefix="react-select"
                                placeholder="Select Forwarder..."
                                value={forwardersValue}
                                options={forwarders}
                                onChange={(e) => handleSelectChange(e)}
                            />
                        </Col>
                        <Col xs={4}>
                            <Select
                                className="react-select-container"
                                classNamePrefix="react-select"
                                placeholder="Select requisitioner..."
                                value={requisitionerValue}
                                options={employees}
                                onChange={(e) => handleSelectChange(e)}
                            />
                            <InputError
                                isValid={isError.requisitioner}
                                message={"Requisitioner is required"}
                            />
                        </Col>
                    </Row>

                    <Row className="mt-4 mb-2">
                        <Col xs={4}>
                            <span className="edit-label">
                                Delivery Address{" "}
                                <label className="badge-required">{` *`}</label>
                            </span>
                            <br />
                        </Col>
                        <Col xs={4}>
                            <span className="edit-label">
                                Type{" "}
                                <label className="badge-required">{` *`}</label>
                            </span>
                            <br />
                        </Col>
                        <Col xs={4}>
                            <span className="edit-label">
                                Remarks
                                <span className="edit-optional px-2">
                                    (Optional)
                                </span>
                            </span>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={4}>
                            <Form.Control
                                type="text"
                                name="delivery_address"
                                className="nc-modal-custom-input"
                                value={newSE.delivery_address}
                                onChange={(e) => handleSEChange(e)}
                            />
                            <InputError
                                isValid={isError.deliveryAddress}
                                message={"delivery address is required"}
                            />
                        </Col>
                        <Col xs={4}>
                            <Select
                                className="react-select-container"
                                classNamePrefix="react-select"
                                placeholder="Select type..."
                                value={typeValue}
                                options={typeOptions.sort((a, b) =>
                                    a.value > b.value ? 1 : b.value > a.value ? -1 : 0
                                )}
                                onChange={(e) => handleSelectChange(e)}
                            />
                            <InputError
                                isValid={isError.type}
                                message={"Type is required"}
                            />
                        </Col>
                        <Col xs={4}>
                            <Form.Control
                                className="nc-modal-custom-input"
                                type="text"
                                name="remarks"
                                value={newSE.remarks}
                                onChange={(e) => handleSEChange(e)}
                            />
                        </Col>
                    </Row>

                    <Row className="mt-4 pt-3">
                        <span className="edit-label mb-2">
                            Purchased Items
                            <label className="badge-required">{` *`}</label>
                        </span>
                        <div className="edit-purchased-items">
                            {items.length === 0 ? (
                                <span>No Purchased Item Found!</span>
                            ) : (
                                renderTable()
                            )}
                            <InputError
                                isValid={isError.SEItems}
                                message={
                                    "You must add at least 1 purchased item"
                                }
                            />
                        </div>
                    </Row>

                    <Row className="pt-3 PO-add-item">
                        <Button type="button" onClick={() => AddItem()}>
                            Add Item
                        </Button>
                    </Row>

                    <div className="d-flex justify-content-end pt-5 pb-3">
                        <button
                            type="button"
                            className="button-secondary me-3"
                            onClick={() => navigate("/suppliesexpenses")}
                        >
                            Close
                        </button>
                        {!isSaveClicked && type !== "for_approval" && (
                            <button
                                type="button"
                                className="button-tertiary me-3"
                                onClick={() => {
                                    newSE["is_save"] = 1;
                                    handleSubmit();
                                }}
                            >
                                Save
                            </button>
                        )}
                        {!isSubmitClicked && (
                            <button
                                type="button"
                                className="button-primary"
                                onClick={() => {
                                    newSE["is_save"] = 0;
                                    handleSubmit();
                                }}
                            >
                                {type === "for_approval" ? "Done" : "Submit"}
                            </button>
                        )}
                        {isSubmitClicked && (
                            <div className="button-primary d-flex justify-content-center">
                                <ReactLoading
                                    type="bubbles"
                                    color="#FFFFFF"
                                    height={50}
                                    width={50}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <AddModal
                title="VENDOR"
                show={showAddSupplierModal}
                onHide={handleCloseAddSupplierModal}
                onSave={handleAddSupplier}
                isClicked={addVendorIsSaveClicked}
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

FormSuppliesExpenses.defaultProps = {
    add: false,
    edit: false,
    defaultValues: {},
};

export default FormSuppliesExpenses;
