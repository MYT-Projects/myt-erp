import React, { useState } from "react";
import { Col, Container, Form, Row } from "react-bootstrap";

//components
import Table from "../../Components/TableTemplate/DataTable";
import Navbar from "../../Components/Navbar/Navbar";
import DeleteModal from "../../Components/Modals/DeleteModal";
import AddModal from "../../Components/Modals/AddModal";
import EditModal from "../../Components/Modals/EditModal";
import ViewModal from "../../Components/Modals/ViewModal";

//css
import "./Manage.css";
import "../../Components/Navbar/Navbar.css";

import { banksMockData } from "../../Helpers/mockData/mockData";
import {
    createBank,
    deleteBanks,
    getAllBanks,
    searchBank,
    updateBank,
} from "../../Helpers/apiCalls/Manage/Banks";
import { getAllCheckTemplates } from "../../Helpers/apiCalls/Manage/CheckTemplates";
import toast from "react-hot-toast";
import { toastStyle, refreshPage, isAdmin } from "../../Helpers/Utils/Common";
import { validateBanks } from "../../Helpers/Validation/Manage/BanksValidation";
import InputError from "../../Components/InputError/InputError";

export default function Banks() {
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
    const [showViewBankModal, setShowViewBankModal] = useState(false);
    const handleShowViewBankModal = () => setShowViewBankModal(true);
    const handleCloseViewBankModal = () => setShowViewBankModal(false);

    // EDIT
    const [showEditBankModal, setShowEditBankModal] = useState(false);
    const handleShowEditBankModal = () => setShowEditBankModal(true);
    const handleCloseEditBankModal = () => setShowEditBankModal(false);

    // ADD
    const [showAddBankModal, setShowAddBankModal] = useState(false);
    const handleShowAddBankModal = () => setShowAddBankModal(true);
    const handleCloseAddBankModal = () => setShowAddBankModal(false);

    //ERROR HANDLING
    const [isError, setIsError] = useState({
        bank_name: false,
    });

    const [isErrorEdit, setIsErrorEdit] = useState({
        bank_name: false,
    });

    //API
    const [banksData, setBanksData] = useState([]);
    const [selectedRow, setSelectedRow] = useState({});
    const [checkTemplateData, setCheckTemplateData] = useState([]);
    const [searchBankName, setSearchBankName] = useState("");
    const [addBankData, setAddBankData] = useState({
        bank_name: "",
        account_name: "",
        account_no: "",
    });
    const [editBankData, setEditBankData] = useState({
        bank_id: "",
        bank_name: "",
        account_name: "",
        account_no: "",
    });

    const handleAddChange = (e) => {
        const { name, value } = e.target;
        setAddBankData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditBankData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    //DROPDOWN
    function handleSelectChange(e, row) {
        setShowLoader(true);
        console.log("row", row);
        setSelectedRow(row);

        if (e.target.value === "delete-bank") {
            handleShowDeleteModal();
        } else if (e.target.value === "edit-bank") {
            setEditBankData(row);
            handleShowEditBankModal();
        } else if (e.target.value === "view-enrollment") {
            handleShowViewBankModal();
        } else {
            handleShowDeleteModal();
        }
        setShowLoader(false);
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
                {isAdmin() && (
                    <option value="edit-bank" className="color-options">
                        Edit
                    </option>
                )}
                {isAdmin() && (
                    <option value="delete-bank" className="color-red">
                        Delete
                    </option>
                )}
            </Form.Select>
        );
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

    async function fetchBanks() {
        setBanksData([]);
        setShowLoader(true);
        const response = await getAllBanks();

        if (response) {
            let result = response.data.data.data.map((a) => {
                return {
                    bank_name: a.bank_name,
                    account_name: a.account_name,
                    account_no: a.account_no,
                    action_btn: ActionBtn(a),
                };
            });
            setBanksData(result);
        }
        setShowLoader(false);
    }

    async function create() {
        if (validateBanks(addBankData, setIsError)) {
            setIsClicked(true);
            const response = await createBank(addBankData);
            if (response) {
                if (response?.data?.status === "success") {
                    toast.success("Successfully added bank!", {
                        style: toastStyle(),
                    });
                    setTimeout(() => refreshPage(), 1000);
                }
                if (response?.error?.data?.messages?.name) {
                    toast.error(response.error.data.messages.name, {
                        style: toastStyle(),
                    });
                }
                if (response?.error?.data?.messages?.account_name) {
                    toast.error(response.error.data.messages.account_name, {
                        style: toastStyle(),
                    });
                }
            }
        }
    }

    async function searchBanks() {
        setBanksData([]);
        setShowLoader(true);
        const response = await searchBank(searchBankName);

        if (response) {
            let result = response.data.data.data.map((a) => {
                return {
                    bank_name: a.bank_name,
                    account_name: a.account_name,
                    account_no: a.account_no,
                    action_btn: ActionBtn(a),
                };
            });
            setBanksData(result);
        }
        setShowLoader(false);
    }

    async function del() {
        const response = await deleteBanks(selectedRow.id);
        console.log(response);
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
    }

    async function editBank() {
        if (validateBanks(editBankData, setIsErrorEdit)) {
            const response = await updateBank(editBankData);

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
        }
    }

    React.useEffect(() => {
        fetchBanks();
        fetchCheckTemplates();
    }, []);

    React.useEffect(() => {
        searchBanks();
    }, [searchBankName]);

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
                        <h1 className="page-title"> BANKS </h1>
                    </Col>
                    <Col className="d-flex justify-content-end">
                        <input
                            type="text"
                            className="search-bar"
                            defaultValue=""
                            name="search"
                            placeholder="Search bank name..."
                            onChange={(e) => setSearchBankName(e.target.value)}
                        ></input>
                        <button
                            className="add-btn"
                            onClick={handleShowAddBankModal}
                        >
                            Add
                        </button>
                    </Col>
                </Row>

                {/* TABLE */}
                <div className="tab-content">
                    <Table
                        tableHeaders={[
                            "BANK NAME",
                            "ACCOUNT NAME",
                            "ACCOUNT NO.",
                            "ACTIONS",
                        ]}
                        headerSelector={[
                            "bank_name",
                            "account_name",
                            "account_no",
                            "action_btn",
                        ]}
                        tableData={banksData}
                        showLoader={showLoader}
                        withActionData={true}
                    />
                </div>
            </div>

            {/* MODALS */}
            <DeleteModal
                text="bank"
                show={showDeleteModal}
                onHide={handleCloseDeleteModal}
                onDelete={() => del()}
            />
            <AddModal
                title="BANK"
                size="lg"
                type="bank"
                show={showAddBankModal}
                onHide={handleCloseAddBankModal}
                onSave={() => create()}
                isClicked={isClicked}
            >
                <div className="mt-3 ">
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
                                isValid={isError.bank_name}
                                message={"Bank name is required"}
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row mt-2">
                        <Col>
                            ACCOUNT NAME
                            <span className="required-icon">*</span>
                            <Form.Control
                                type="text"
                                name="account_name"
                                value={addBankData.account_name}
                                className="nc-modal-custom-input"
                                onChange={(e) => handleAddChange(e)}
                                required
                            />
                            <InputError
                                isValid={isError.account_name}
                                message={"Account Name is required"}
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row mt-2">
                        <Col>
                            ACCOUNT NUMBER
                            <span className="required-icon">*</span>
                            <Form.Control
                                type="text"
                                name="account_no"
                                value={addBankData.account_no}
                                className="nc-modal-custom-input"
                                onChange={(e) => handleAddChange(e)}
                                required
                            />
                            <InputError
                                isValid={isError.account_no}
                                message={"Account number is required"}
                            />
                        </Col>
                    </Row>
                </div>
            </AddModal>
            <EditModal
                title="BANK"
                size="lg"
                type="bank"
                show={showEditBankModal}
                onHide={handleCloseEditBankModal}
                onSave={() => editBank()}
            >
                <div className="mt-3">
                    <Row className="nc-modal-custom-row mt-0">
                        <Col>
                            BANK NAME
                            <Form.Control
                                type="text"
                                name="bank_name"
                                value={editBankData.bank_name}
                                className="nc-modal-custom-input"
                                onChange={(e) => handleEditChange(e)}
                                required
                            />
                            <InputError
                                isValid={isErrorEdit.bank_name}
                                message={"Bank name is required"}
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row mt-2">
                        <Col>
                            ACCOUNT NAME
                            <Form.Control
                                type="text"
                                name="account_name"
                                value={editBankData.account_name}
                                className="nc-modal-custom-input"
                                onChange={(e) => handleEditChange(e)}
                                required
                            />
                            <InputError
                                isValid={isErrorEdit.account_name}
                                message={"Account name is required"}
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row mt-2">
                        <Col>
                            ACCOUNT NUMBER
                            <Form.Control
                                type="text"
                                name="account_no"
                                value={editBankData.account_no}
                                className="nc-modal-custom-input"
                                onChange={(e) => handleEditChange(e)}
                                required
                            />
                            <InputError
                                isValid={isErrorEdit.account_no}
                                message={"Account number is required"}
                            />
                        </Col>
                    </Row>
                </div>
            </EditModal>
            <ViewModal
                show={showViewBankModal}
                onHide={handleCloseViewBankModal}
                onSave={() => alert("Save")}
            >
                <div>
                    <div className="col-sm-12 space">
                        <span className="custom-modal-body-title">
                            CHECK ENROLLMENT
                        </span>
                    </div>
                    <div className="edit-form mt-3 mb-3">
                        <div className="mt-0 mb-0">
                            <Row className="nc-modal-custom-row mt-0 mb-3">
                                <Col>
                                    FROM
                                    <Row className="nc-modal-custom-row">
                                        <Col>
                                            {" "}
                                            <Form.Control
                                                type="text"
                                                name="from"
                                                className="nc-modal-custom-input"
                                                required
                                            />{" "}
                                        </Col>
                                    </Row>
                                </Col>
                                <Col>
                                    TO
                                    <Row className="nc-modal-custom-row">
                                        <Col>
                                            {" "}
                                            <Form.Control
                                                type="text"
                                                name="from"
                                                className="nc-modal-custom-input"
                                                required
                                            />{" "}
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </div>

                        <div className="col-sm-12 d-flex justify-content-end mb-3 ">
                            <button
                                className="button-tertiary "
                                onClick={() => handleCloseViewBankModal(true)}
                            >
                                Cancel
                            </button>
                            <button
                                className="mx-3 button-primary "
                                onClick={() => handleCloseViewBankModal(true)}
                            >
                                Save
                            </button>
                        </div>
                        <Row className="m-divider mb-3"></Row>
                        <div className="col-sm-12 space"></div>
                        <div className="col-sm-12 space">
                            <div className="m-0 mb-0">
                                <Row className="nc-modal-custom-row">
                                    <Col>
                                        ENROLLED CHECKS
                                        <Row className="nc-modal-custom-row-box">
                                            <Col className="nc-modal-custom-row-grey">
                                                {" "}
                                                FROM{" "}
                                            </Col>

                                            <Col className="nc-modal-custom-row-grey">
                                                {" "}
                                                TO{" "}
                                            </Col>
                                            <Col className="nc-modal-custom-row-grey">
                                                {" "}
                                                REMAINING CHECKS{" "}
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                    </div>
                </div>
            </ViewModal>
        </div>
    );
}
