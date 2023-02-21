import React, { useState } from "react";
import { Col, Container, Form, Row } from "react-bootstrap";

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

import { isAdmin, refreshPage, toastStyle } from "../../Helpers/Utils/Common";
import toast, { Toaster } from "react-hot-toast";
import {
    getAllVendors,
    createVendor,
    getVendor,
    deleteVendor,
    searchVendor,
    updateVendor,
} from "../../Helpers/apiCalls/Manage/Vendors";
import { validateVendors } from "../../Helpers/Validation/Manage/VendorsValidation";
import InputError from "../../Components/InputError/InputError";

export default function Vendors() {

    const [inactive, setInactive] = useState(false);
    const [showLoader, setShowLoader] = useState(false);
    const [option, setOption] = useState("Select");
    const [isClicked, setIsClicked] = useState(false);

    // MODALS //
    // DELETE
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const handleShowDeleteModal = () => setShowDeleteModal(true);
    const handleCloseDeleteModal = () => setShowDeleteModal(false);

    // VIEW
    const [showViewVendorModal, setShowViewVendorModal] = useState(false);
    const handleShowViewVendorModal = () => setShowViewVendorModal(true);
    const handleCloseViewVendorModal = () => setShowViewVendorModal(false);

    // EDIT
    const [showEditVendorModal, setShowEditVendorModal] = useState(false);
    const handleShowEditVendorModal = () => setShowEditVendorModal(true);
    const handleCloseEditVendorModal = () => setShowEditVendorModal(false);

    // ADD
    const [showAddVendorModal, setShowAddVendorModal] = useState(false);
    const handleShowAddVendorModal = () => setShowAddVendorModal(true);
    const handleCloseAddVendorModal = () => setShowAddVendorModal(false);

    //API
    const [vendorsData, setVendorsData] = useState([]);
    const [vendorData, setVendorData] = useState({});
    const [selectedID, setSelectedID] = useState("");
    const [VendorDetails, setVendorDetails] = useState({
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
        handleCloseViewVendorModal();
        handleShowEditVendorModal();
    }

    //DELETE or REMOVE Vendor
    function handleDeleteVendor() {
        removeVendor(selectedID);
    }

    //DROPDOWN
    function handleSelectChange(e, row) {
        fetchVendor(row.id);
        setSelectedID(row.id);
        if (e.target.value === "delete-vendor") {
            handleShowDeleteModal();
        } else if (e.target.value === "edit-vendor") {
            handleShowEditVendorModal();
        } else if (e.target.value === "view-vendor") {
            handleShowViewVendorModal();
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
                <option value="view-vendor" className="color-options">
                    View
                </option>
                {isAdmin && (
                    <option value="edit-vendor" className="color-options">
                        Edit
                    </option>
                )}
                {isAdmin && (
                    <option value="delete-vendor" className="color-red">
                        Delete
                    </option>
                )}
            </Form.Select>
        );
    }

    //API CALL
    async function fetchAllVendors() {
        setShowLoader(true);
        const response = await getAllVendors();
        if (response.response.data) {
            var VendorsList = response.response.data;
            response.response.data.map(
                (data, key) => (VendorsList[key].company_name = data.trade_name)
            );
            response.response.data.map(
                (data, key) =>
                    (VendorsList[key].address = data.trade_address || "N/A")
            );
            response.response.data.map(
                (data, key) =>
                    (VendorsList[key].phone_number = data.phone_no || "N/A")
            );
            response.response.data.map(
                (data, key) =>
                    (VendorsList[key].contact_person =
                        data.contact_person || "N/A")
            );
            response.response.data.map(
                (data, key) =>
                    (VendorsList[key].company_email =
                        data.company_email || "N/A")
            );

            setVendorsData(VendorsList);
        } else {
            setVendorsData([]);
        }
        setShowLoader(false);
    }

    async function fetchVendor(id) {
        const response = await getVendor(id);
        if (response.response.data) {
            var Vendor = response.response.data[0];
            setVendorData({
                vendor_id: Vendor.id,
                trade_name: Vendor.trade_name,
                trade_address: Vendor.trade_address,
                bir_name: Vendor.bir_name,
                bir_number: Vendor.bir_number,
                bir_address: Vendor.bir_address,
                tin: Vendor.tin,
                terms: Vendor.terms,
                requirements: Vendor.requirements,
                phone_no: Vendor.phone_no,
                email: Vendor.email,
                contact_person: Vendor.contact_person,
                bank_primary: Vendor.bank_primary,
                primary_account_no: Vendor.primary_account_no,
                primary_account_name: Vendor.primary_account_name,
                bank_alternate: Vendor.bank_alternate,
                alternate_account_no: Vendor.alternate_account_no,
                alternate_account_name: Vendor.alternate_account_name,
                payee: Vendor.payee,
            });
        } else {
            setVendorData({});
        }
    }

    async function handleSaveVendor() {
        if (validateVendors(VendorDetails, setIsError)) {
            setIsClicked(true);
            const response = await createVendor(VendorDetails);
            if (response.response) {
                toast.success(response.response.response, {
                    style: toastStyle(),
                });
                handleCloseAddVendorModal();
                refreshPage();
            } else {
                toast.error("Error Creating New Vendor", {
                    style: toastStyle(),
                });
            }
        }
    }

    async function handleEditVendor() {
        const response = await updateVendor(vendorData);
        if (response.response) {
            toast.success(response.response.response, { style: toastStyle() });
            handleCloseAddVendorModal();
            refreshPage();
        } else {
            toast.error("Error Updating New Vendor", { style: toastStyle() });
        }
    }

    async function removeVendor(id) {
        const response = await deleteVendor(id);
        if (response.data) {
            toast.success("Successfully deleted vendor!", {
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

    const [searchUsername, setSearchUsername] = useState("");

    // SEARCH USER
    function handleOnSearch(e) {
        setSearchUsername(e.target.value);
    }

    //API CALL
    async function fetchSearchUser() {
        setShowLoader(true);
        const response = await searchVendor(searchUsername);
        if (response.response) {
            var VendorsList = response.response.data;
            response.response.data.map(
                (data, key) => (VendorsList[key].company_name = data.trade_name)
            );
            response.response.data.map(
                (data, key) =>
                    (VendorsList[key].address = data.trade_address || "N/A")
            );
            response.response.data.map(
                (data, key) =>
                    (VendorsList[key].phone_number = data.phone_no || "N/A")
            );
            response.response.data.map(
                (data, key) =>
                    (VendorsList[key].contact_person =
                        data.contact_person || "N/A")
            );
            response.response.data.map(
                (data, key) =>
                    (VendorsList[key].company_email =
                        data.company_email || "N/A")
            );

            setVendorsData(VendorsList);
        } else {
            setVendorsData([]);
        }
        setShowLoader(false);
    }

    //EDIT OR UPDATE FORWARDER
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setVendorData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    React.useEffect(() => {
        fetchAllVendors();
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
                        <h1 className="page-title"> VENDORS </h1>
                    </Col>
                    <Col className="d-flex justify-content-end">
                        <input
                            type="text"
                            className="search-bar"
                            defaultValue=""
                            placeholder="Search company name..."
                            onKeyPress={(e) =>
                                e.key === ("Enter" || "NumpadEnter") &&
                                handleOnSearch(e)
                            }
                        ></input>
                        <button
                            className="add-btn"
                            onClick={handleShowAddVendorModal}
                        >
                            Add
                        </button>
                    </Col>
                </Row>

                <div className="tab-content">
                    {/* TABLE */}
                    <Table
                        tableHeaders={[
                            "COMPANY NAME",
                            "ADDRESS",
                            "CONTACT PERSON",
                            "PHONE NUMBER",
                            "COMPANY EMAIL",
                            "ACTIONS",
                        ]}
                        headerSelector={[
                            "company_name",
                            "address",
                            "contact_person",
                            "phone_number",
                            "email",
                        ]}
                        tableData={vendorsData}
                        ActionBtn={(row) => ActionBtn(row)}
                        showLoader={showLoader}
                    />
                </div>
            </div>

            {/* MODALS */}
            <DeleteModal
                text="vendor"
                show={showDeleteModal}
                onHide={handleCloseDeleteModal}
                onDelete={handleDeleteVendor}
            />
            <AddModal
                title="VENDOR"
                show={showAddVendorModal}
                onHide={handleCloseAddVendorModal}
                onSave={handleSaveVendor}
                isClicked={isClicked}
            >
                <div className="mt-3 ">
                    <Row className="nc-modal-custom-row mt-0">
                        <Col>
                            BIR NAME{" "}
                            <label className="badge-required">{` *`}</label>
                            <Form.Control
                                type="text"
                                name="bir_name"
                                value={VendorDetails.bir_name}
                                className="nc-modal-custom-input"
                                onChange={(e) =>
                                    setVendorDetails({
                                        ...VendorDetails,
                                        [e.target.name]: e.target.value,
                                    })
                                }
                                required
                            />
                            <InputError
                                isValid={isError.bir_name}
                                message={"BIR name is required"}
                            />
                        </Col>
                        <Col>
                            TRADE NAME{" "}
                            <label className="badge-required">{` *`}</label>
                            <Form.Control
                                type="text"
                                name="trade_name"
                                value={VendorDetails.trade_name}
                                className="nc-modal-custom-input"
                                onChange={(e) =>
                                    setVendorDetails({
                                        ...VendorDetails,
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
                                value={VendorDetails.bir_address}
                                className="nc-modal-custom-input"
                                onChange={(e) =>
                                    setVendorDetails({
                                        ...VendorDetails,
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
                                value={VendorDetails.trade_address}
                                className="nc-modal-custom-input"
                                onChange={(e) =>
                                    setVendorDetails({
                                        ...VendorDetails,
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
                            <label className="badge-required">{` *`}</label>
                            <Form.Control
                                type="text"
                                name="tin"
                                value={VendorDetails.tin}
                                className="nc-modal-custom-input"
                                onChange={(e) =>
                                    setVendorDetails({
                                        ...VendorDetails,
                                        [e.target.name]: e.target.value,
                                    })
                                }
                                required
                            />
                            <InputError
                                isValid={isError.tin}
                                message={"Tin is required"}
                            />
                        </Col>
                        <Col>
                            BIR NUMBER
                            <Form.Control
                                type="text"
                                name="bir_number"
                                className="nc-modal-custom-input"
                                value={VendorDetails.bir_number}
                                required
                                onChange={(e) =>
                                    setVendorDetails({
                                        ...VendorDetails,
                                        [e.target.name]: e.target.value,
                                    })
                                }
                            />
                        </Col>
                        <Col xl={3} className="nc-modal-custom-row-details">
                            TERM (DAYS){" "}
                            <label className="badge-required">{` *`}</label>
                            <Form.Control
                                type="text"
                                name="terms"
                                value={VendorDetails.terms}
                                className="nc-modal-custom-input"
                                onChange={(e) =>
                                    setVendorDetails({
                                        ...VendorDetails,
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
                                value={VendorDetails.contact_person}
                                className="nc-modal-custom-input"
                                onChange={(e) =>
                                    setVendorDetails({
                                        ...VendorDetails,
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
                                value={VendorDetails.phone_no}
                                className="nc-modal-custom-input"
                                onChange={(e) =>
                                    setVendorDetails({
                                        ...VendorDetails,
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
                                value={VendorDetails.payee}
                                className="nc-modal-custom-input"
                                onChange={(e) =>
                                    setVendorDetails({
                                        ...VendorDetails,
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
                                value={VendorDetails.bank_primary}
                                className="nc-modal-custom-input"
                                onChange={(e) =>
                                    setVendorDetails({
                                        ...VendorDetails,
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
                                    setVendorDetails({
                                        ...VendorDetails,
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
                                    setVendorDetails({
                                        ...VendorDetails,
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
                                value={VendorDetails.bank_alternate}
                                className="nc-modal-custom-input"
                                onChange={(e) =>
                                    setVendorDetails({
                                        ...VendorDetails,
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
                                value={VendorDetails.alternate_account_no}
                                onChange={(e) =>
                                    setVendorDetails({
                                        ...VendorDetails,
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
                                value={VendorDetails.alternate_account_name}
                                onChange={(e) =>
                                    setVendorDetails({
                                        ...VendorDetails,
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
                                value={VendorDetails.email}
                                className="nc-modal-custom-input"
                                onChange={(e) =>
                                    setVendorDetails({
                                        ...VendorDetails,
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
                title="Vendor"
                show={showEditVendorModal}
                onHide={handleCloseEditVendorModal}
                onSave={handleEditVendor}
            >
                <div className="mt-3 ">
                    <Row className="nc-modal-custom-row mt-0">
                        <Col>
                            BIR NAME
                            <Form.Control
                                type="text"
                                name="bir_name"
                                defaultValue={vendorData.bir_name}
                                onChange={(e) => handleEditChange(e)}
                                className="nc-modal-custom-input-edit"
                                required
                            />
                        </Col>
                        <Col>
                            TRADE NAME
                            <Form.Control
                                type="text"
                                name="trade_name"
                                defaultValue={vendorData.trade_name}
                                onChange={(e) => handleEditChange(e)}
                                className="nc-modal-custom-input-edit"
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
                                defaultValue={vendorData.bir_address}
                                onChange={(e) => handleEditChange(e)}
                                className="nc-modal-custom-input-edit"
                                required
                            />
                        </Col>
                        <Col>
                            TRADE ADDRESS
                            <Form.Control
                                type="text"
                                name="trade_address"
                                defaultValue={vendorData.trade_address}
                                onChange={(e) => handleEditChange(e)}
                                className="nc-modal-custom-input-edit"
                                required
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col>
                            TIN NUMBER
                            <Form.Control
                                type="text"
                                name="tin"
                                defaultValue={vendorData.tin}
                                onChange={(e) => handleEditChange(e)}
                                className="nc-modal-custom-input-edit"
                                required
                            />
                        </Col>
                        <Col>
                            BIR NUMBER
                            <Form.Control
                                type="text"
                                name="bir_number"
                                defaultValue={vendorData.bir_number}
                                onChange={(e) => handleEditChange(e)}
                                className="nc-modal-custom-input-edit"
                                required
                            />
                        </Col>
                        <Col xl={4}>
                            CONTACT PERSON
                            <Form.Control
                                type="text"
                                name="contact_person"
                                defaultValue={vendorData.contact_person}
                                onChange={(e) => handleEditChange(e)}
                                className="nc-modal-custom-input-edit"
                                required
                            />
                        </Col>
                        <Col xl={3} className="nc-modal-custom-row-details">
                            PAYEE
                            <Form.Control
                                type="text"
                                name="payee"
                                defaultValue={vendorData.payee}
                                onChange={(e) => handleEditChange(e)}
                                className="nc-modal-custom-input-edit"
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
                                defaultValue={vendorData.bank_primary}
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
                                defaultValue={vendorData.primary_account_no}
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
                                defaultValue={vendorData.primary_account_name}
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
                                defaultValue={vendorData.bank_alternate}
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
                                defaultValue={vendorData.alternate_account_no}
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
                                defaultValue={vendorData.alternate_account_name}
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
                                defaultValue={vendorData.terms}
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
                                defaultValue={vendorData.email}
                                onChange={(e) => handleEditChange(e)}
                                required
                            />
                        </Col>
                    </Row>
                </div>
            </EditModal>
            <ViewModal
                withButtons
                show={showViewVendorModal}
                onHide={handleCloseViewVendorModal}
                onEdit={handleOnEdit}
            >
                <div className="mt-0">
                    <div className="col-sm-12 m-0 space">
                        <span className="custom-modal-body-title-supplier-details">
                            VENDOR DETAILS
                        </span>
                        <div className="container-wrapper">
                            <Row className="nc-modal-custom-row-view">
                                <Col xl={3} className="nc-modal-custom-row-details">
                                    BIR NAME
                                    <Row className="nc-modal-custom-row">
                                        <Col> {vendorData.bir_name} </Col>
                                    </Row>
                                </Col>
                                <Col xl={3} className="nc-modal-custom-row-details">
                                    TRADE NAME
                                    <Row className="nc-modal-custom-row">
                                        <Col> {vendorData.trade_name} </Col>
                                    </Row>
                                </Col>
                                <Col className="nc-modal-custom-row-details">
                                    TIN NUMBER
                                    <Row className="nc-modal-custom-row">
                                        <Col> {vendorData.tin} </Col>
                                    </Row>
                                </Col>
                                <Col className="nc-modal-custom-row-details">
                                    TERM (DAYS)
                                    <Row className="nc-modal-custom-row">
                                        <Col> {vendorData.terms} DAYS </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <Row className="nc-modal-custom-row-view mt-2">
                                <Col className="nc-modal-custom-row-details">
                                    BIR-REGISTERED ADDRESS
                                    <Row className="nc-modal-custom-row">
                                        <Col>{vendorData.bir_address}</Col>
                                    </Row>
                                </Col>
                                <Col className="nc-modal-custom-row-details">
                                    TRADE ADDRESS
                                    <Row className="nc-modal-custom-row">
                                        <Col>{vendorData.trade_address}</Col>
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
                                        <Col> {vendorData.payee} </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <Row className="nc-modal-custom-row-view">
                                <Col className="nc-modal-custom-row-details">
                                    PRIMARY BANK NAME
                                    <Row className="nc-modal-custom-row">
                                        <Col> {vendorData.bank_primary} </Col>
                                    </Row>
                                </Col>
                                <Col className="nc-modal-custom-row-details">
                                    PRIMARY ACCOUNT NO.
                                    <Row className="nc-modal-custom-row">
                                        <Col>
                                            {" "}
                                            {vendorData.primary_account_no}{" "}
                                        </Col>
                                    </Row>
                                </Col>
                                <Col className="nc-modal-custom-row-details">
                                    PRIMARY ACCOUNT NAME
                                    <Row className="nc-modal-custom-row">
                                        <Col>
                                            {" "}
                                            {
                                                vendorData.primary_account_name
                                            }{" "}
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <Row className="nc-modal-custom-row-view mt-2">
                                <Col className="nc-modal-custom-row-details">
                                    ALTERNATE BANK NAME
                                    <Row className="nc-modal-custom-row">
                                        <Col> {vendorData.bank_alternate}</Col>
                                    </Row>
                                </Col>
                                <Col className="nc-modal-custom-row-details">
                                    ALTERNATE ACCOUNT NO.
                                    <Row className="nc-modal-custom-row">
                                        <Col>
                                            {" "}
                                            {
                                                vendorData.alternate_account_no
                                            }{" "}
                                        </Col>
                                    </Row>
                                </Col>
                                <Col className="nc-modal-custom-row-details">
                                    ALTERNATE ACCOUNT NAME
                                    <Row className="nc-modal-custom-row">
                                        <Col>
                                            {" "}
                                            {vendorData.alternate_account_name}
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
                                        <Col> {vendorData.contact_person} </Col>
                                    </Row>
                                </Col>
                                <Col className="nc-modal-custom-row-details">
                                    PHONE NUMBER
                                    <Row className="nc-modal-custom-row">
                                        <Col>{vendorData.phone_no} </Col>
                                    </Row>
                                </Col>
                                <Col className="nc-modal-custom-row-details">
                                    COMPANY EMAIL
                                    <Row className="nc-modal-custom-row">
                                        <Col> {vendorData.email}</Col>
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
                                        <Col> {vendorData.added_on} </Col>
                                    </Row>
                                </Col>
                                <Col className="nc-modal-custom-row-details">
                                    ADDED BY
                                    <Row className="nc-modal-custom-row">
                                        <Col> {vendorData.added_by} </Col>
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
