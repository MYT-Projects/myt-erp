import React, { useState, useRef, useEffect } from "react";
import {
    ButtonGroup,
    Col,
    Container,
    Dropdown,
    DropdownButton,
    Form,
    Row,
    Tab,
    Tabs,
} from "react-bootstrap";

//components
import Table from "../../Components/TableTemplate/Table";
import Navbar from "../../Components/Navbar/Navbar";
import DeleteModal from "../../Components/Modals/DeleteModal";
import AddModal from "../../Components/Modals/AddModal";
import EditModal from "../../Components/Modals/EditModal";
import ViewModal from "../../Components/Modals/ViewModal";

//css
import "./Manage.css";
import "../../Components/Navbar/Navbar.css";

import { getType, refreshPage, toastStyle } from "../../Helpers/Utils/Common";
import toast, { Toaster } from "react-hot-toast";

import { suppliersMockData } from "../../Helpers/mockData/mockData";
import {
    getAllSuppliers,
    createSupplier,
    getSupplier,
    deleteSupplier,
    searchSupplier,
    updateSupplier,
    getAllSuppliers2,
} from "../../Helpers/apiCalls/suppliersApi";
import { validateSuppliers } from "../../Helpers/Validation/Manage/SuppliersValidation";
import InputError from "../../Components/InputError/InputError";
import {
    createSupplierPotato,
    deleteSupplierPotato,
    getAllSuppliersPotato,
    getSupplierPotato,
    searchSupplierPotato,
    updateSupplierPotato,
} from "../../Helpers/apiCalls/PotatoCorner/suppliersApi";

export default function Suppliers() {
    const accountType = getType();
    const [inactive, setInactive] = useState(false);
    const [showLoader, setShowLoader] = useState(false);
    const [option, setOption] = useState("Select");
    const [isClicked, setIsClicked] = useState(false);
    const [selectedRow, setSelectedRow] = useState({});

    const [filterConfig, setFilterConfig] = useState({
        tab: "MANGO MAGIC",

    });
    const handleTabSelect = (tabKey) => {
        setFilterConfig((prev) => {
            return { ...prev, tab: tabKey };
        });
    };
    const isInitialMount = useRef(true);
    const filterConfigKey = 'manage-suppliers-filterConfig';
    useEffect(()=>{
        if(isInitialMount.current){
            isInitialMount.current = false;
            setFilterConfig((prev) => {
                // console.log("override");
                if (window.localStorage.getItem(filterConfigKey) != null){
                    // console.log("found");
                    handleTabSelect(JSON.parse(window.localStorage.getItem(filterConfigKey)).tab);
                    return JSON.parse(window.localStorage.getItem(filterConfigKey))
                } else {
                    return {...prev}
                }
            });
        } else {
            window.localStorage.setItem(filterConfigKey, JSON.stringify(filterConfig));
        }
    }, [filterConfig])

    // MODALS //
    // DELETE
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const handleShowDeleteModal = () => setShowDeleteModal(true);
    const handleCloseDeleteModal = () => setShowDeleteModal(false);

    // VIEW
    const [showViewSupplierModal, setShowViewSupplierModal] = useState(false);
    const handleShowViewSupplierModal = () => setShowViewSupplierModal(true);
    const handleCloseViewSupplierModal = () => setShowViewSupplierModal(false);

    // EDIT
    const [showEditSupplierModal, setShowEditSupplierModal] = useState(false);
    const handleShowEditSupplierModal = () => setShowEditSupplierModal(true);
    const handleCloseEditSupplierModal = () => setShowEditSupplierModal(false);

    // ADD
    const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
    const handleShowAddSupplierModal = () => setShowAddSupplierModal(true);
    const handleCloseAddSupplierModal = () => setShowAddSupplierModal(false);

    const [addTo, setAddTo] = useState("");
    const handleAddSelect = (e) => {
        setAddTo(e);
    };

    //API
    const [suppliersData, setSuppliersData] = useState([]);
    const [suppliersData2, setSuppliersData2] = useState([]);
    const [suppliersDataMango, setSuppliersDataMango] = useState([]);
    const [suppliersDataPotato, setSuppliersDataPotato] = useState([]);
    const [supplierData, setSupplierData] = useState({});
    const [selectedID, setSelectedID] = useState("");
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

    //ERROR HANDLING
    const [isError, setIsError] = useState({
        bir_name: false,
        trade_name: false,
        trade_address: false,
        tin: false,
        contact_person: false,
        phone_no: false,
        payee: false,
    });

    //onEdit
    function handleOnEdit() {
        handleCloseViewSupplierModal();
        handleShowEditSupplierModal();
    }

    //DELETE or REMOVE SUPPLIER
    function handleDeleteSupplier() {
        removeSupplier(selectedID);
    }
    //DROPDOWN
    function handleSelectChange(e, row) {
        fetchSupplier(row.id, row.type);
        setSelectedID(row.id);
        setSelectedRow(row);
        if (e.target.value === "delete-supplier") {
            handleShowDeleteModal();
        } else if (e.target.value === "edit-supplier") {
            handleShowEditSupplierModal();
        } else if (e.target.value === "view-supplier") {
            handleShowViewSupplierModal();
        } else {
            handleShowDeleteModal();
        }
    }

    function ActionBtn(row) {
        return (
            <Form.Select
                name="action"
                className="PO-select-action form-select"
                id={row.id}
                onChange={(e) => handleSelectChange(e, row)}
                value={option}
            >
                <option defaulValue selected hidden>
                    Select
                </option>
                <option value="view-supplier" className="color-options">
                    View
                </option>
                <option value="edit-supplier" className="color-options">
                    Edit
                </option>
                {accountType === "admin" && (
                    <option value="delete-supplier" className="color-red">
                        Delete
                    </option>
                )}
            </Form.Select>
        );
    }

    //API CALL
    async function fetchAllSuppliers() {
        setShowLoader(true);

        //MANGO
        const response = await getAllSuppliers();
        setShowLoader(false);
        if (response.response.data) {
            var suppliersList = response.response.data;
            response.response.data.map(
                (data, key) => (suppliersList[key].type = "mango")
            );
            response.response.data.map(
                (data, key) =>
                    (suppliersList[key].company_name = data.trade_name)
            );
            response.response.data.map(
                (data, key) =>
                    (suppliersList[key].address = data.trade_address || "N/A")
            );
            response.response.data.map(
                (data, key) =>
                    (suppliersList[key].phone_number = data.phone_no || "N/A")
            );
            response.response.data.map(
                (data, key) =>
                    (suppliersList[key].contact_person =
                        data.contact_person || "N/A")
            );
            response.response.data.map(
                (data, key) =>
                    (suppliersList[key].company_email =
                        data.company_email || "N/A")
            );
            setSuppliersDataMango(suppliersList);
        } else {
            setSuppliersDataMango([]);
        }

        setShowLoader(false);
        //POTATO
        const response2 = await getAllSuppliersPotato();
        if (response2.response.data) {
            var suppliersList = response2.response.data;
            response2.response.data.map(
                (data, key) => (suppliersList[key].type = "potato")
            );
            response2.response.data.map(
                (data, key) =>
                    (suppliersList[key].company_name = data.trade_name)
            );
            response2.response.data.map(
                (data, key) =>
                    (suppliersList[key].address = data.trade_address || "N/A")
            );
            response2.response.data.map(
                (data, key) =>
                    (suppliersList[key].phone_number = data.phone_no || "N/A")
            );
            response2.response.data.map(
                (data, key) =>
                    (suppliersList[key].contact_person =
                        data.contact_person || "N/A")
            );
            response2.response.data.map(
                (data, key) =>
                    (suppliersList[key].company_email =
                        data.company_email.to || "N/A")
            );

            setSuppliersDataPotato(suppliersList);
            setSuppliersData(suppliersList.concat(suppliersDataMango));
        } else {
            setSuppliersDataPotato([]);
        }

        if (response2.data) {
            var suppliersList = response.data.data.map((supplier) => {
                var info = {};
                info.trade_name = supplier.trade_name || "N/A";
                info.trade_address = supplier.trade_address || "N/A";
                info.phone_no = supplier.phone_no || "N/A";
                info.contact_person = supplier.contact_person || "N/A";
                info.email = supplier.email || "N/A";
                return info;
            });
            setSuppliersData2(suppliersList);
        } else {
            setSuppliersData2([]);
        }

        setShowLoader(false);
    }

    async function fetchSupplier(id, shop) {
        if (shop === "mango") {
            const response = await getSupplier(id);
            if (response.response.data) {
                var supplier = response.response.data[0];
                setSupplierData({
                    supplier_id: supplier.id,
                    trade_name: supplier.trade_name,
                    trade_address: supplier.trade_address,
                    bir_name: supplier.bir_name,
                    bir_number: supplier.bir_number,
                    bir_address: supplier.bir_address,
                    tin: supplier.tin,
                    terms: supplier.terms,
                    requirements: supplier.requirements,
                    phone_no: supplier.phone_no,
                    email: supplier?.email,
                    contact_person: supplier.contact_person,
                    bank_primary: supplier.bank_primary,
                    primary_account_no: supplier.primary_account_no,
                    primary_account_name: supplier.primary_account_name,
                    bank_alternate: supplier.bank_alternate,
                    alternate_account_no: supplier.alternate_account_no,
                    alternate_account_name: supplier.alternate_account_name,
                    payee: supplier.payee,
                });
            } else {
                setSupplierData({});
            }
        } else if (shop === "potato") {
            const response = await getSupplierPotato(id);
            if (response.response.data) {
                var supplier = response.response.data[0];
                setSupplierData({
                    supplier_id: supplier.id,
                    trade_name: supplier.trade_name,
                    trade_address: supplier.trade_address,
                    bir_name: supplier.bir_name,
                    bir_number: supplier.bir_number,
                    bir_address: supplier.bir_address,
                    tin: supplier.tin,
                    terms: supplier.terms,
                    requirements: supplier.requirements,
                    phone_no: supplier.phone_no,
                    email: supplier?.email,
                    contact_person: supplier.contact_person,
                    bank_primary: supplier.bank_primary,
                    primary_account_no: supplier.primary_account_no,
                    primary_account_name: supplier.primary_account_name,
                    bank_alternate: supplier.bank_alternate,
                    alternate_account_no: supplier.alternate_account_no,
                    alternate_account_name: supplier.alternate_account_name,
                    payee: supplier.payee,
                });
            } else {
                setSupplierData({});
            }
        }
    }

    async function handleSaveSupplier() {
        if (validateSuppliers(supplierDetails, setIsError)) {
            setIsClicked(true);
            if (addTo === "MANGO MAGIC") {
                const response = await createSupplier(supplierDetails);
                if (response.response) {
                    toast.success(response.response.response, {
                        style: toastStyle(),
                    });
                    handleCloseAddSupplierModal();
                    refreshPage();
                } else {
                    toast.error("Error Creating New Supplier", {
                        style: toastStyle(),
                    });
                }
            } else if (addTo === "POTATO CORNER") {
                const response = await createSupplierPotato(supplierDetails);
                if (response.response) {
                    toast.success(response.response.response, {
                        style: toastStyle(),
                    });
                    handleCloseAddSupplierModal();
                    refreshPage();
                } else {
                    toast.error("Error Creating New Supplier", {
                        style: toastStyle(),
                    });
                }
            }
        }
    }

    async function handleEditSupplier() {
        if (validateSuppliers(supplierData, setIsError)) {
            if (selectedRow.type === "mango") {
                const response = await updateSupplier(supplierData);
                if (response.response) {
                    toast.success(response.response.response, {
                        style: toastStyle(),
                    });
                    handleCloseAddSupplierModal();
                    refreshPage()
                } else {
                    toast.error("Error Updating New Supplier", {
                        style: toastStyle(),
                    });
                    refreshPage()
                }
            } else if (selectedRow.type === "potato") {
                const response = await updateSupplierPotato(supplierData);
                if (response.response) {
                    toast.success(response.response.response, {
                        style: toastStyle(),
                    });
                    handleCloseAddSupplierModal();
                    refreshPage()
                } else {
                    toast.error("Error Updating New Supplier", {
                        style: toastStyle(),
                    });
                    refreshPage()
                }
            }
        }
    }

    async function removeSupplier(id) {
        if (selectedRow.type === "mango") {
            const response = await deleteSupplier(id);
            if (response.data) {
                toast.success("Successfully deleted user!", {
                    style: toastStyle(),
                });
                handleCloseDeleteModal();
                refreshPage();
            } else {
                toast.error(response.error.data.messages.error, {
                    style: toastStyle(),
                });
            }
        } else if (selectedRow.type === "potato") {
            const response = await deleteSupplierPotato(id);
            if (response.data) {
                toast.success("Successfully deleted user!", {
                    style: toastStyle(),
                });
                handleCloseDeleteModal();
                refreshPage();
            } else {
                toast.error(response.error.data.messages.error, {
                    style: toastStyle(),
                });
            }
        }
    }

    const [searchUsername, setSearchUsername] = useState("");

    // SEARCH USER
    function handleOnSearch(e) {
        setSearchUsername(e.target.value);
    }

    //API CALL
    async function fetchSearchUser() {
        setShowLoader(true);

        //MANGO
        const response = await searchSupplier(searchUsername);
        setShowLoader(false);
        if (response.response) {
            var suppliersList = response.response.data;
            response.response.data.map(
                (data, key) => (suppliersList[key].type = "mango")
            );
            response.response.data.map(
                (data, key) =>
                    (suppliersList[key].company_name = data.trade_name)
            );
            response.response.data.map(
                (data, key) =>
                    (suppliersList[key].address = data.trade_address || "N/A")
            );
            response.response.data.map(
                (data, key) =>
                    (suppliersList[key].phone_number = data.phone_no || "N/A")
            );
            response.response.data.map(
                (data, key) =>
                    (suppliersList[key].contact_person =
                        data.contact_person || "N/A")
            );
            response.response.data.map(
                (data, key) =>
                    (suppliersList[key].company_email =
                        data.company_email || "N/A")
            );

            setSuppliersDataMango(suppliersList);
        } else {
            setSuppliersDataMango([]);
        }

        //POTATO
        const response2 = await searchSupplierPotato(searchUsername);
        setShowLoader(false);
        if (response2.response) {
            var suppliersList = response2.response.data;
            response2.response.data.map(
                (data, key) => (suppliersList[key].type = "potato")
            );
            response2.response.data.map(
                (data, key) =>
                    (suppliersList[key].company_name = data.trade_name)
            );
            response2.response.data.map(
                (data, key) =>
                    (suppliersList[key].address = data.trade_address || "N/A")
            );
            response2.response.data.map(
                (data, key) =>
                    (suppliersList[key].phone_number = data.phone_no || "N/A")
            );
            response2.response.data.map(
                (data, key) =>
                    (suppliersList[key].contact_person =
                        data.contact_person || "N/A")
            );
            response2.response.data.map(
                (data, key) =>
                    (suppliersList[key].company_email =
                        data.company_email || "N/A")
            );
            setSuppliersDataPotato(suppliersList);
            setSuppliersData(suppliersList.concat(suppliersDataMango));
        } else {
            setSuppliersDataPotato([]);
        }
        setShowLoader(false);
    }

    //EDIT OR UPDATE FORWARDER
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setSupplierData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    React.useEffect(() => {
        fetchAllSuppliers();
    }, []);

    React.useEffect(() => {
        fetchSearchUser();
    }, [searchUsername]);

    return (
        <div>
            <div className="page">
                <Navbar
                    onCollapse={(inactive) => {
                        setInactive(inactive);
                    }}
                    active={"MANAGE"}
                />
            </div>
            <div
                className={`manager-container ${
                    inactive ? "inactive" : "active"
                }`}
            >
                <Row className="mb-3">
                    <Col xs={6}>
                        <h1 className="page-title"> SUPPLIERS </h1>
                    </Col>
                    <Col className="d-flex justify-content-end">
                        <input
                            type="text"
                            className="search-bar"
                            defaultValue=""
                            placeholder="Search name..."
                            onKeyPress={(e) =>
                                e.key === ("Enter" || "NumpadEnter") &&
                                handleOnSearch(e)
                            }
                        ></input>
                        <DropdownButton
                            as={ButtonGroup}
                            title="Add"
                            id="bg-nested-dropdown"
                            className="add-btn"
                            onSelect={handleAddSelect}
                        >
                            <Dropdown.Item
                                eventKey="MANGO MAGIC"
                                onClick={handleShowAddSupplierModal}
                            >
                                To Mango Magic
                            </Dropdown.Item>
                            <Dropdown.Item
                                eventKey="POTATO CORNER"
                                onClick={handleShowAddSupplierModal}
                            >
                                To Potato Corner
                            </Dropdown.Item>
                        </DropdownButton>
                    </Col>
                </Row>

                <Tabs
                    activeKey={filterConfig.tab}
                    defaultActiveKey={filterConfig.tab}
                    id="suppliers-tabs"
                    className="manager-tabs"
                    onSelect={handleTabSelect}
                >
                    <Tab eventKey="MANGO MAGIC" title="Mango Magic">
                        <div>
                            {/* TABLE */}
                            <Table
                                tableHeaders={
                                    accountType === "admin"
                                        ? [
                                              "COMPANY NAME",
                                              "ADDRESS",
                                              "CONTACT PERSON",
                                              "PHONE NUMBER",
                                              "COMPANY EMAIL",
                                              "ACTIONS",
                                          ]
                                        : [
                                              "COMPANY NAME",
                                              "ADDRESS",
                                              "CONTACT PERSON",
                                              "PHONE NUMBER",
                                              "COMPANY EMAIL",
                                          ]
                                }
                                headerSelector={[
                                    "trade_name",
                                    "trade_address",
                                    "contact_person",
                                    "phone_no",
                                    "email",
                                ]}
                                tableData={suppliersDataMango}
                                ActionBtn={(row) => ActionBtn(row)}
                                showLoader={showLoader}
                            />
                        </div>
                    </Tab>
                    <Tab eventKey="POTATO CORNER" title="Potato Corner">
                        <div>
                            {/* TABLE */}
                            <Table
                                tableHeaders={
                                    accountType === "admin"
                                        ? [
                                              "COMPANY NAME",
                                              "ADDRESS",
                                              "CONTACT PERSON",
                                              "PHONE NUMBER",
                                              "COMPANY EMAIL",
                                              "ACTIONS",
                                          ]
                                        : [
                                              "COMPANY NAME",
                                              "ADDRESS",
                                              "CONTACT PERSON",
                                              "PHONE NUMBER",
                                              "COMPANY EMAIL",
                                          ]
                                }
                                headerSelector={[
                                    "trade_name",
                                    "trade_address",
                                    "contact_person",
                                    "phone_no",
                                    "email",
                                ]}
                                tableData={suppliersDataPotato}
                                ActionBtn={(row) => ActionBtn(row)}
                                showLoader={showLoader}
                            />
                        </div>
                    </Tab>
                </Tabs>
            </div>

            {/* MODALS */}
            <DeleteModal
                text="supplier"
                show={showDeleteModal}
                onHide={handleCloseDeleteModal}
                onDelete={handleDeleteSupplier}
            />
            <AddModal
                title={`SUPPLIER TO ${addTo}`}
                show={showAddSupplierModal}
                onHide={handleCloseAddSupplierModal}
                onSave={handleSaveSupplier}
                isClicked={isClicked}
            >
                <div className="mt-3 ">
                    <Row className="nc-modal-custom-row mt-0">
                        <Col>
                            BIR NAME{" "}
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
                            <InputError
                                isValid={isError.trade_name}
                                message={"Trade name is required"}
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
                            <InputError
                                isValid={isError.trade_address}
                                message={"Trade address is required"}
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col>
                            TIN NUMBER{" "}
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
                            />
                        </Col>
                        <Col>
                            BIR NUMBER
                            <Form.Control
                                type="text"
                                name="bir_number"
                                className="nc-modal-custom-input"
                                value={supplierDetails.bir_number}
                                onChange={(e) =>
                                    setSupplierDetails({
                                        ...supplierDetails,
                                        [e.target.name]: e.target.value,
                                    })
                                }
                            />
                        </Col>
                         <Col xl={3} className="nc-modal-custom-row-details">
                            TERM (DAYS)
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
                            <InputError
                                isValid={isError.contact_person}
                                message={"Contact Person is required"}
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
                            <InputError
                                isValid={isError.phone_no}
                                message={"Phone number is required"}
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
                            <InputError
                                isValid={isError.payee}
                                message={"Payee is required"}
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
                                required
                                onChange={(e) =>
                                    setSupplierDetails({
                                        ...supplierDetails,
                                        [e.target.name]: e.target.value,
                                    })
                                }
                            />
                        </Col>
                        <Col xl={5}>
                            PRIMARY ACCOUNT NAME
                            <Form.Control
                                type="text"
                                name="primary_account_name"
                                className="nc-modal-custom-input"
                                required
                                onChange={(e) =>
                                    setSupplierDetails({
                                        ...supplierDetails,
                                        [e.target.name]: e.target.value,
                                    })
                                }
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
                                required
                                value={supplierDetails.alternate_account_no}
                                onChange={(e) =>
                                    setSupplierDetails({
                                        ...supplierDetails,
                                        [e.target.name]: e.target.value,
                                    })
                                }
                            />
                        </Col>
                        <Col xl={5}>
                            ALTERNATE ACCOUNT NAME
                            <Form.Control
                                type="text"
                                name="alternate_account_name"
                                className="nc-modal-custom-input"
                                value={supplierDetails.alternate_account_name}
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
                            COMPANY EMAIL
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
                </div>
            </AddModal>
            <EditModal
                title="SUPPLIER"
                show={showEditSupplierModal}
                onHide={handleCloseEditSupplierModal}
                onSave={handleEditSupplier}
            >
                <div className="mt-3 ">
                    <Row className="nc-modal-custom-row mt-0">
                        <Col>
                            BIR NAME
                            <Form.Control
                                type="text"
                                name="bir_name"
                                value={supplierData.bir_name}
                                onChange={(e) => handleEditChange(e)}
                                className="nc-modal-custom-input-edit"
                                required
                            />
                        </Col>
                        <Col>
                            TRADE NAME
                            <label className="badge-required">{` *`}</label>
                            <Form.Control
                                type="text"
                                name="trade_name"
                                value={supplierData.trade_name}
                                onChange={(e) => handleEditChange(e)}
                                className="nc-modal-custom-input-edit"
                                required
                            />
                            <InputError
                                isValid={isError.trade_name}
                                message={"Trade name is required"}
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col>
                            BIR-REGISTERED ADDRESS
                            <Form.Control
                                type="text"
                                name="bir_address"
                                value={supplierData.bir_address}
                                onChange={(e) => handleEditChange(e)}
                                className="nc-modal-custom-input-edit"
                                required
                            />
                        </Col>
                        <Col>
                            TRADE ADDRESS
                            <label className="badge-required">{` *`}</label>
                            <Form.Control
                                type="text"
                                name="trade_address"
                                value={supplierData.trade_address}
                                onChange={(e) => handleEditChange(e)}
                                className="nc-modal-custom-input-edit"
                                required
                            />
                            <InputError
                                isValid={isError.trade_address}
                                message={"Trade address is required"}
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col>
                            TIN NUMBER
                            <Form.Control
                                type="text"
                                name="tin"
                                value={supplierData.tin}
                                onChange={(e) => handleEditChange(e)}
                                className="nc-modal-custom-input-edit"
                            />
                        </Col>
                        <Col>
                            BIR NUMBER
                            <Form.Control
                                type="text"
                                name="bir_number"
                                value={supplierData.bir_number}
                                onChange={(e) => handleEditChange(e)}
                                className="nc-modal-custom-input-edit"
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
                                value={supplierData.contact_person}
                                className="nc-modal-custom-input"
                                onChange={(e) => handleEditChange(e)}
                                required
                            />
                            <InputError
                                isValid={isError.contact_person}
                                message={"Contact Person is required"}
                            />
                        </Col>
                        <Col xl={4}>
                            PHONE NUMBER{" "}
                            <label className="badge-required">{` *`}</label>
                            <Form.Control
                                type="text"
                                name="phone_no"
                                value={supplierData.phone_no}
                                className="nc-modal-custom-input"
                                onChange={(e) => handleEditChange(e)}
                                required
                            />
                            <InputError
                                isValid={isError.phone_no}
                                message={"Phone number is required"}
                            />
                        </Col>
                        <Col>
                            PAYEE{" "}
                            <label className="badge-required">{` *`}</label>
                            <Form.Control
                                type="email"
                                name="payee"
                                value={supplierData.payee}
                                className="nc-modal-custom-input"
                                onChange={(e) => handleEditChange(e)}
                                required
                            />
                            <InputError
                                isValid={isError.payee}
                                message={"Payee is required"}
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col>
                            PRIMARY BANK NAME
                            <Form.Control
                                type="text"
                                name="bank_primary"
                                value={supplierData.bank_primary}
                                onChange={(e) => handleEditChange(e)}
                                className="nc-modal-custom-input-edit"
                                required
                            />
                        </Col>
                        <Col>
                            PRIMARY ACCOUNT NO.
                            <Form.Control
                                type="text"
                                name="primary_account_no"
                                value={supplierData.primary_account_no}
                                onChange={(e) => handleEditChange(e)}
                                className="nc-modal-custom-input-edit"
                                required
                            />
                        </Col>
                        <Col xl={5}>
                            PRIMARY ACCOUNT NAME
                            <Form.Control
                                type="text"
                                name="primary_account_name"
                                value={supplierData.primary_account_name}
                                onChange={(e) => handleEditChange(e)}
                                className="nc-modal-custom-input-edit"
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
                                value={supplierData.bank_alternate}
                                onChange={(e) => handleEditChange(e)}
                                className="nc-modal-custom-input-edit"
                                required
                            />
                        </Col>
                        <Col>
                            ALTERNATE ACCOUNT NO.
                            <Form.Control
                                type="text"
                                name="alternate_account_no"
                                value={supplierData.alternate_account_no}
                                onChange={(e) => handleEditChange(e)}
                                className="nc-modal-custom-input-edit"
                                required
                            />
                        </Col>
                        <Col xl={5}>
                            ALTERNATE ACCOUNT NAME
                            <Form.Control
                                type="text"
                                name="alternate_account_name"
                                value={supplierData.alternate_account_name}
                                onChange={(e) => handleEditChange(e)}
                                className="nc-modal-custom-input-edit"
                                required
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                         <Col xl={3} className="nc-modal-custom-row-details">
                            TERM (DAYS)
                            <Form.Control
                                type="text"
                                name="terms"
                                value={supplierData.terms}
                                onChange={(e) => handleEditChange(e)}
                                className="nc-modal-custom-input-edit"
                                required
                            />
                        </Col>
                         <Col xl={3} className="nc-modal-custom-row-details">
                            COMPANY EMAIL
                            <Form.Control
                                type="email"
                                name="email"
                                className="nc-modal-custom-input-edit"
                                value={supplierData.email}
                                onChange={(e) => handleEditChange(e)}
                                required
                            />
                        </Col>
                    </Row>
                </div>
            </EditModal>
            <ViewModal
                withButtons
                show={showViewSupplierModal}
                onHide={handleCloseViewSupplierModal}
            >
                <div className="mt-0">
                    <div className="col-sm-12 m-0 space">
                        <span className="custom-modal-body-title-supplier-details">
                            SUPPLIER DETAILS
                        </span>
                        <div className="container-wrapper">
                            <Row className="nc-modal-custom-row-view">
                                 <Col xl={3} className="nc-modal-custom-row-details">
                                    BIR NAME
                                    <Row className="nc-modal-custom-row">
                                        <Col> {supplierData.bir_name} </Col>
                                    </Row>
                                </Col>
                                 <Col xl={3} className="nc-modal-custom-row-details">
                                    TRADE NAME
                                    <Row className="nc-modal-custom-row">
                                        <Col> {supplierData.trade_name} </Col>
                                    </Row>
                                </Col>
                                <Col className="nc-modal-custom-row-details">
                                    TIN NUMBER
                                    <Row className="nc-modal-custom-row">
                                        <Col> {supplierData.tin} </Col>
                                    </Row>
                                </Col>
                                <Col className="nc-modal-custom-row-details">
                                    TERM (DAYS)
                                    <Row className="nc-modal-custom-row">
                                        <Col> {supplierData.terms} DAYS </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <Row className="nc-modal-custom-row-view mt-2">
                                <Col className="nc-modal-custom-row-details">
                                    BIR-REGISTERED ADDRESS
                                    <Row className="nc-modal-custom-row">
                                        <Col>{supplierData.bir_address}</Col>
                                    </Row>
                                </Col>
                                <Col className="nc-modal-custom-row-details">
                                    TRADE ADDRESS
                                    <Row className="nc-modal-custom-row">
                                        <Col>{supplierData.trade_address}</Col>
                                    </Row>
                                </Col>
                            </Row>
                        </div>
                    </div>
                    <div className="col-sm-12 mt-3 space">
                        <span className="custom-modal-body-title-bank-details">
                            BANK DETAILS
                        </span>
                        <div className="container-wrapper">
                            <Row className="nc-modal-custom-row-view mb-2">
                                <Col className="nc-modal-custom-row-details">
                                    PAYEE
                                    <Row className="nc-modal-custom-row mt-2">
                                        <Col> {supplierData.payee} </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <Row className="nc-modal-custom-row-view">
                                <Col className="nc-modal-custom-row-details">
                                    PRIMARY BANK NAME
                                    <Row className="nc-modal-custom-row">
                                        <Col> {supplierData.bank_primary} </Col>
                                    </Row>
                                </Col>
                                <Col className="nc-modal-custom-row-details">
                                    PRIMARY ACCOUNT NO.
                                    <Row className="nc-modal-custom-row">
                                        <Col>
                                            {" "}
                                            {
                                                supplierData.primary_account_no
                                            }{" "}
                                        </Col>
                                    </Row>
                                </Col>
                                <Col className="nc-modal-custom-row-details">
                                    PRIMARY ACCOUNT NAME
                                    <Row className="nc-modal-custom-row">
                                        <Col>
                                            {" "}
                                            {
                                                supplierData.primary_account_name
                                            }{" "}
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <Row className="nc-modal-custom-row-view mt-2">
                                <Col className="nc-modal-custom-row-details">
                                    ALTERNATE BANK NAME
                                    <Row className="nc-modal-custom-row">
                                        <Col>
                                            {" "}
                                            {supplierData.bank_alternate}
                                        </Col>
                                    </Row>
                                </Col>
                                <Col className="nc-modal-custom-row-details">
                                    ALTERNATE ACCOUNT NO.
                                    <Row className="nc-modal-custom-row">
                                        <Col>
                                            {" "}
                                            {
                                                supplierData.alternate_account_no
                                            }{" "}
                                        </Col>
                                    </Row>
                                </Col>
                                <Col className="nc-modal-custom-row-details">
                                    ALTERNATE ACCOUNT NAME
                                    <Row className="nc-modal-custom-row">
                                        <Col>
                                            {" "}
                                            {
                                                supplierData.alternate_account_name
                                            }
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </div>
                    </div>
                    <div className="col-sm-12 mt-3 space">
                        <span className="custom-modal-body-title-contact-info">
                            CONTACT INFORMATION
                        </span>
                        <div className="container-wrapper">
                            <Row className="nc-modal-custom-row-view">
                                <Col className="nc-modal-custom-row-details">
                                    CONTACT PERSON
                                    <Row className="nc-modal-custom-row">
                                        <Col>
                                            {" "}
                                            {supplierData.contact_person}{" "}
                                        </Col>
                                    </Row>
                                </Col>
                                <Col className="nc-modal-custom-row-details">
                                    PHONE NUMBER
                                    <Row className="nc-modal-custom-row">
                                        <Col>{supplierData.phone_no} </Col>
                                    </Row>
                                </Col>
                                <Col className="nc-modal-custom-row-details">
                                    COMPANY EMAIL
                                    <Row className="nc-modal-custom-row">
                                        <Col> {supplierData.email}</Col>
                                    </Row>
                                </Col>
                            </Row>
                        </div>
                    </div>
                    <div className="col-sm-12 mt-3 space">
                        <span className="custom-modal-body-title-act">
                            ACTIVITIES
                        </span>
                        <div className="container-wrapper">
                            <Row className="nc-modal-custom-row-view">
                                <Col className="nc-modal-custom-row-details">
                                    ADDED ON
                                    <Row className="nc-modal-custom-row">
                                        <Col> {supplierData.added_on} </Col>
                                    </Row>
                                </Col>
                                <Col className="nc-modal-custom-row-details">
                                    ADDED BY
                                    <Row className="nc-modal-custom-row">
                                        <Col> {supplierData.added_by} </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </div>
                    </div>
                </div>
            </ViewModal>
        </div>
    );
}
