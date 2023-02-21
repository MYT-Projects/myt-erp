import React, { useState } from "react";
import { Col, Container, Form, Row } from "react-bootstrap";

//components
import Table from "../../Components/TableTemplate/DataTable";
import Navbar from "../../Components/Navbar/Navbar";
import DeleteModal from "../../Components/Modals/DeleteModal";
import AddModal from "../../Components/Modals/AddModal";
import EditModal from "../../Components/Modals/EditModal";
import ViewModal from "../../Components/Modals/ViewModal";
import InputError from "../../Components/InputError/InputError";

//css
import "./Manage.css";
import "../../Components/Navbar/Navbar.css";

import { forwardersMockData } from "../../Helpers/mockData/mockData";
import {
    createForwarder,
    deleteForwarder,
    editForwarder,
    getAllForwarders,
    getForwarder,
    searchForwarder,
} from "../../Helpers/apiCalls/forwardersApi";
import { isAdmin, refreshPage, toastStyle } from "../../Helpers/Utils/Common";
import { validateForwarders } from "../../Helpers/Validation/Manage/ForwardersValidation";
import toast from "react-hot-toast";

export default function Forwarders() {
    const [inactive, setInactive] = useState(false);
    const [option, setOption] = useState("Select");
    const [showLoader, setShowLoader] = useState(false);
    const [isClicked, setIsClicked] = useState(false);

    // MODALS //
    // DELETE
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const handleShowDeleteModal = () => setShowDeleteModal(true);
    const handleCloseDeleteModal = () => setShowDeleteModal(false);

    // VIEW
    const [showViewForwarderModal, setShowViewForwarderModal] = useState(false);
    const handleShowViewForwarderModal = () => setShowViewForwarderModal(true);
    const handleCloseViewForwarderModal = () =>
        setShowViewForwarderModal(false);

    // EDIT
    const [showEditForwarderModal, setShowEditForwarderModal] = useState(false);
    const handleShowEditForwarderModal = () => setShowEditForwarderModal(true);
    const handleCloseEditForwarderModal = () =>
        setShowEditForwarderModal(false);

    // ADD
    const [showAddForwarderModal, setShowAddForwarderModal] = useState(false);
    const handleShowAddForwarderModal = () => setShowAddForwarderModal(true);
    const handleCloseAddForwarderModal = () => setShowAddForwarderModal(false);

    //API
    const [forwardersData, setForwardersData] = useState([]);
    const [forwarderData, setForwarderData] = useState({});
    const [selectedID, setSelectedID] = useState("");
    const [forwarderDetails, setForwarderDetails] = useState({
        name: "",
        address: " ",
        phone_no: "",
    });

    //REQUIRED ERROR HANDLING
    const [isError, setIsError] = useState({
        name: false,
    });

    const [isErrorEdit, setIsErrorEdit] = useState({
        name: false,
    });

    //ONCHANGE
    //ADD or CREATE FORWARDER
    const handleAddChange = (e) => {
        const { name, value } = e.target;
        setForwarderDetails((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };
    //onEdit
    function handleOnEdit() {
        handleCloseViewForwarderModal();
        handleShowEditForwarderModal();
    }

    //EDIT OR UPDATE FORWARDER
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setForwarderData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    //DELETE or REMOVE FORWARDER
    function handleDeleteForwarder() {
        removeForwarder(selectedID);
    }

    //DROPDOWN
    function handleSelectChange(e, row) {
        fetchForwarder(row.id);
        setSelectedID(row.id);
        if (e.target.value === "delete-forwarder") {
            handleShowDeleteModal();
        } else if (e.target.value === "edit-forwarder") {
            handleShowEditForwarderModal();
        } else if (e.target.value === "view-forwarder") {
            handleShowViewForwarderModal();
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
                <option value="view-forwarder" className="color-options">
                    View
                </option>
                {isAdmin && (
                    <option value="edit-forwarder" className="color-options">
                        Edit
                    </option>
                )}
                {isAdmin && (
                    <option value="delete-forwarder" className="color-red">
                        Delete
                    </option>
                )}
            </Form.Select>
        );
    }

    //API CALL
    async function fetchAllForwarders() {
        setShowLoader(true);
        const response = await getAllForwarders();
        if (response.data) {
            var sortedData = response.data.data.sort((a, b) =>
                a.name > b.name
                    ? 1
                    : b.name > a.name
                    ? -1
                    : 0
            );
            sortedData.map((forwarder)=>{
                return{
                    name: forwarder.name,
                }
            })
            setForwardersData(sortedData);
        } else {
            setForwardersData([]);
        }
        setShowLoader(false);
    }

    const [searchName, setSearchName] = useState("");

    // SEARCH USER
    function handleOnSearch(e) {
        setSearchName(e.target.value);
    }

    async function fetchSearchForwarder() {
        setShowLoader(true);
        const response = await searchForwarder(searchName);
        if (response.response) {
            var sortedData = response.response.data.sort((a, b) =>
                a.name > b.name
                    ? 1
                    : b.name > a.name
                    ? -1
                    : 0
            );
            sortedData.map((forwarder)=>{
                return{
                    name: forwarder.name,
                }
            })
            setForwardersData(sortedData);
        } else {
            setForwardersData([]);
        }
        setShowLoader(false);
    }

    async function fetchForwarder(id) {
        const response = await getForwarder(id);
        if (response.data.data) {
            var forwarder = response.data.data[0];
            setForwarderData(forwarder);
        } else {
            setForwarderData({});
        }
    }

    async function handleSaveForwarder() {
        if (validateForwarders(forwarderDetails, setIsError)) {
            setIsClicked(true);

            const response = await createForwarder(forwarderDetails);
            if (response.data) {
                toast.success("Successfully created forwarder!", {
                    style: toastStyle(),
                });
                handleCloseAddForwarderModal();
                refreshPage();
            } else {
                toast.error(response.error.data.messages.error, {
                    style: toastStyle(),
                });
            }
        } else {
            toast.error("An error has occured!", { style: toastStyle() });
        }
    }

    async function handleEditForwarder() {
        if (validateForwarders(forwarderData, setIsErrorEdit)) {
            setIsClicked(true);
            const response = await editForwarder(forwarderData);
            if (response.data) {
                toast.success("Successfully updated forwarder!", {
                    style: toastStyle(),
                });
                handleCloseEditForwarderModal();
                refreshPage();
            } else {
                toast.error(response.error.data.messages.error, {
                    style: toastStyle(),
                });
            }
        } else {
            toast.error("An error has occured!", { style: toastStyle() });
        }
    }

    async function removeForwarder(id) {
        const response = await deleteForwarder(id);
        if (response.data) {
            toast.success("Successfully deleted forwarder!", {
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

    React.useEffect(() => {
        fetchAllForwarders();
    }, []);

    React.useEffect(() => {
        fetchSearchForwarder();
    }, [searchName]);

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
                    <Col>
                        <h1 className="page-title"> FORWARDERS </h1>
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
                        <button
                            className="add-btn"
                            onClick={handleShowAddForwarderModal}
                        >
                            Add
                        </button>
                    </Col>
                </Row>
                <div className="tab-content">
                    {/* TABLE */}
                    <Table
                        tableHeaders={["NAME", "ADDRESS", "ACTIONS"]}
                        headerSelector={["name", "address"]}
                        tableData={forwardersData}
                        ActionBtn={(row) => ActionBtn(row)}
                        showLoader={showLoader}
                    />
                </div>
            </div>

            {/* MODALS */}
            <DeleteModal
                text="forwarder"
                show={showDeleteModal}
                onHide={handleCloseDeleteModal}
                onDelete={handleDeleteForwarder}
            />
            <AddModal
                title="FORWARDER"
                size="lg"
                type="forwarder"
                show={showAddForwarderModal}
                onHide={handleCloseAddForwarderModal}
                onSave={handleSaveForwarder}
                isClicked={isClicked}
            >
                <div className="mt-3">
                    <Row className="nc-modal-custom-row mt-0">
                        <Col>
                            NAME
                            <span className="required-icon">*</span>
                            <Form.Control
                                type="text"
                                name="name"
                                className="nc-modal-custom-input"
                                onChange={(e) => handleAddChange(e)}
                                required
                            />
                            <InputError
                                isValid={isError.name}
                                message={"Name is required"}
                            />
                        </Col>
                        <Col>
                            PHONE NUMBER
                            <Form.Control
                                type="text"
                                name="phone_no"
                                className="nc-modal-custom-input"
                                onChange={(e) => handleAddChange(e)}
                                required
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col>
                            ADDRESS
                            <Form.Control
                                type="text"
                                name="address"
                                className="nc-modal-custom-input"
                                onChange={(e) => handleAddChange(e)}
                                required
                            />
                        </Col>
                    </Row>
                </div>
            </AddModal>
            <EditModal
                title="FORWARDER"
                size="lg"
                type="forwarder"
                show={showEditForwarderModal}
                onHide={handleCloseEditForwarderModal}
                onSave={handleEditForwarder}
            >
                <div className="mt-3">
                    <Row className="nc-modal-custom-row mt-0">
                        <Col>
                            NAME
                            <Form.Control
                                type="text"
                                name="name"
                                defaultValue={forwarderData.name}
                                className="nc-modal-custom-input-edit"
                                onChange={(e) => handleEditChange(e)}
                                required
                            />
                            <InputError
                                isValid={isErrorEdit.name}
                                message={"Name is required"}
                            />
                        </Col>
                        <Col>
                            PHONE NUMBER
                            <Form.Control
                                type="text"
                                name="phone_no"
                                defaultValue={forwarderData.phone_no}
                                className="nc-modal-custom-input-edit"
                                onChange={(e) => handleEditChange(e)}
                                required
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col>
                            ADDRESS
                            <Form.Control
                                type="text"
                                name="address"
                                defaultValue={forwarderData.address}
                                className="nc-modal-custom-input-edit"
                                onChange={(e) => handleEditChange(e)}
                                required
                            />
                        </Col>
                    </Row>
                </div>
            </EditModal>
            <ViewModal
                withButtons
                show={showViewForwarderModal}
                onHide={handleCloseViewForwarderModal}
                onEdit={handleOnEdit}
            >
                <div>
                    <div className="col-sm-12 space">
                        <span className="custom-modal-body-title-forwarder-details">
                            FORWARDER DETAILS
                        </span>
                        <div className="container-wrapper">
                            <Row className="nc-modal-custom-row-view">
                                <Col lg={4} className="nc-modal-custom-row-details">
                                    NAME
                                    <Row className="nc-modal-custom-row">
                                        <Col> {forwarderData.name}</Col>
                                    </Row>
                                </Col>
                                <Col lg={6} className="nc-modal-custom-row-details">
                                    ADDRESS
                                    <Row className="nc-modal-custom-row">
                                        <Col>{forwarderData.address}</Col>
                                    </Row>
                                </Col>
                                <Col lg={2} className="nc-modal-custom-row-details">
                                    PHONE NUMBER
                                    <Row className="nc-modal-custom-row">
                                        <Col>{forwarderData.phone_no} </Col>
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
