import React, { useState } from "react";
import { Button, Col, Form, Row, Table } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { Modal } from "react-bootstrap";
import toast from "react-hot-toast";
import Select from "react-select";
import TextInput from "react-autocomplete-input";
import "react-autocomplete-input/dist/bundle.css";
import { setMinutes, setHours } from "date-fns";
import { Typeahead } from "react-bootstrap-typeahead"; 
import "react-bootstrap-typeahead/css/Typeahead.css";
import ReactLoading from "react-loading";

import {
    formatDateNoTime,
    getTodayDate,
    getTodayDateISO,
    getTodayDateNoTime,
    numberFormat,
    refreshPage,
    toastStyle,
    TokenExpiry,
} from "../../Helpers/Utils/Common";
import Navbar from "../../Components/Navbar/Navbar";
import "../Purchases/PurchaseOrders/PurchaseOrders.css";
import "./Franchise.css";
import { Fragment } from "react";
import { useEffect } from "react";
import {
    createBranch,
    getAllBranches,
} from "../../Helpers/apiCalls/Manage/Branches";
import {
    createBranchPotato,
} from "../../Helpers/apiCalls/PotatoCorner/Manage/Branches";
import {
    createFranchisee,
    createFranchiseePayment,
    getAllFranchisee,
    getFranchisee,
    updateFranchisee,
} from "../../Helpers/apiCalls/Franchise/FranchiseApi";
import { validateFranchise } from "../../Helpers/Validation/Franchise/FranchiseValidation";
import InputError from "../../Components/InputError/InputError";
import { validateFranchiseEdit } from "../../Helpers/Validation/Franchise/FranchiseEditValidation";
import { validateBranches } from "../../Helpers/Validation/Manage/BanchesValidation";
import ReactDatePicker from "react-datepicker";
import AddModal from "../../Components/Modals/AddModal";
import { getAllBanks } from "../../Helpers/apiCalls/banksAPi";
import { getAllPriceLevels } from "../../Helpers/apiCalls/Manage/PriceLevels";
import { getType } from "../../Helpers/Utils/Common";
import {
    getAllBranchGroup,
    getAllBranchGroupPotato,
} from "../../Helpers/apiCalls/Manage/BranchGroupApi";
import {
    getAllInventoryGroup,
    getAllInventoryGroupPotato,
} from "../../Helpers/apiCalls/Manage/InventoryGroup";

/**
 *  -- COMPONENT: FORM TO ADD OR EDIT FRANCHISEE SALES INVOICE
 */
function FormFranchiseInvoice({ add, edit }) {
    let navigate = useNavigate();
    const [inactive, setInactive] = useState(true);
    const [isBranchClicked, setIsBranchClicked] = useState(false);
    const [isSubmitClicked, setIsSubmitClicked] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const userType = getType();
    /**
     *  @po_id - param for add purchase invoice form
     *  @pi_id - param for edit purchase invoice form
     */
    const { po_id, pi_id } = useParams();
    const today = getTodayDateISO();

    // FRANCHISEE INVOICE DETAILS HANDLER
    const [franchiseeInvoice, setFranchiseeInvoice] = useState({
        franchised_on: today,
        branch_id: "",
        address: "",
        name: "",
        opening_start: "",
        contract_start: "",
        contract_end: "",
        contact_person: "",
        contact_number: "",
        franchisee_contact_no: "",
        email: "",
        franchisee_fee: 0,
        package_type: "",
        security_deposit: 0,
        taxes: 0,
        other_fee: 0,
        royalty_fee: 0,
        marketing_fee: 0,
        remarks: "",
        term_days: "",
        amount: "",
        payment_method: "",
        payment_date: today,
        deposit_date: today,
        bank_name: "",
        cheque_number: "",
        cheque_date: "",
        reference_number: "",
        transaction_number: "",
        deposited_to: "",
        invoice_no: "",
        beginning_credit_limit: "",
    });

    const [banks, setBanks] = useState([]);
    const [osStartTime, setOsStartTime] = useState(new Date());
    const [osEndTime, setOsEndTime] = useState(new Date());
    const [priceLevel, setPriceLevels] = useState([]);

    const [deliveryStartTime, setDeliveryStartTime] = useState(new Date());
    const [deliveryEndTime, setDeliveryEndTime] = useState(new Date());
    const [franchiseeName, setFranchiseeName] = useState([]);
    const [branchGroup, setBranchGroup] = useState([]);
    const [inventoryGroup, setInventoryGroup] = useState([]);

    const [addBranchData, setAddBranchData] = useState({
        name: "",
        address: "",
        phone_no: "",
        contact_person_no: "",
        monthly_rental_fee: "",
        tin_no: "",
        bir_no: "",
        contract_start: "",
        contract_end: "",
        opening_date: "",
        price_level: "",
        contact_person: "",
        initial_drawer: "",
        os_startDate: "monday",
        os_endDate: "sunday",
        os_startTime: "",
        os_endTime: "",
        delivery_startDate: "monday",
        delivery_endDate: "sunday",
        delivery_startTime: "",
        delivery_endTime: "",
        is_franchise: "1",
        from_bank_id: "",
        to_bank_id: "",
    });

    //ERROR HANDLING
    const [isError, setIsError] = useState({
        franchised_on: false,
        branch_id: false,
        name: false,
        opening_start: false,
        contact_person: false,
        contact_number: false,
        contract_start: false,
        contract_end: false,
        franchisee_fee: false,
        package_type: false,
        amount: false,
        payment_method: false,
        payment_date: false,
        bank_name: false,
        cheque_number: false,
        cheque_date: false,
        reference_number: false,
        invoice_no: false,
        beginning_credit_limit: false,
    });

    //ERROR HANDLING
    const [isErrorBranch, setIsErrorBranch] = useState({
        name: false,
        address: false,
        phone_no: false,
        initial_drawer: false,
        price_level: false,
        contact_person: false,
        contact_person_no: false,
        monthly_rental_fee: false,
        is_franchise: false,
    });

    const [grandTotal, setGrandTotal] = useState(0);
    const [addTo, setAddTo] = useState("");

    //MODAL HANDLERS
    const [showAddBranchModal, setShowAddBranchModal] = useState(false);
    const handleShowAddBranchModal = () => setShowAddBranchModal(true);
    const handleCloseAddBranchModal = () => {
        setShowAddBranchModal(false);
    };

    //MODAL HANDLERS
    const [showAddModal, setShowAddModal] = useState(false);
    const handleShowAddModal = () => setShowAddModal(true);
    const handleCloseAddModal = () => {
        setShowAddModal(false);
    };


    // DATA HANDLERS
    const [franchiseeBranches, setFranchiseeBranches] = useState([]);
    const [franchiseeBranchesInfo, setFranchiseeBranchesInfo] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState({});
    const [franchisees, setFranchisees] = useState([]);

    //FETCH FUNCTIONS
    async function fetchBranches() {
        setFranchiseeBranches([]);
        const response = await getAllBranches();
        var isFranchisee = [];

        if (response) {
            let result = response.data.data.data.map((a) => {
                return {
                    label: a.name,
                    value: a.id,
                    address: a.address,
                    contact_person: a.contact_person,
                    contact_person_no: a.contact_person_no,
                    is_franchise: a.is_franchise,
                };
            });
            isFranchisee = result.filter((bill) => bill.is_franchise === "1");
            setFranchiseeBranches(isFranchisee);
            setFranchiseeBranchesInfo(isFranchisee);
        }
    }

    async function fetchPriceLevel() {
        setPriceLevels([]);
        const response = await getAllPriceLevels();

        if (response) {
            setPriceLevels(response.data.data.data);
        }
    }

    async function fetchFranchisee() {
        const response = await getFranchisee(pi_id);
        if (response.data) {
            setFranchiseeInvoice(response.data.data[0]);
            setFranchiseeName([{name: response.data.data[0].name, id: response.data.data[0].id, customOption: false }])
        } else {
            toast.error(response.error.data.messages.error, {
                style: toastStyle(),
            });
        }
    }

    async function fetchAllFranchisees() {
        const response = await getAllFranchisee();
        if (response.data) {
            let result = response.data.data
                .sort()
                .filter(function (item, pos, arr) {
                    return !pos || item.name !== arr[pos - 1].name;
                })
                .map((a) => {
                    return a;
                });
            setFranchisees(result);
        } else {
            toast.error(response.error.data.messages.error, {
                style: toastStyle(),
            });
        }
    }

    async function fetchBanks() {
        const response = await getAllBanks();
        if (response.error) {
            TokenExpiry(response.error);
        } else {
            setBanks(response.data.data);
        }
    }

    async function fetchBranchGroup() {
        setBranchGroup([]);
        //Mango
        if (addTo === "MANGO MAGIC") {
            const response = await getAllBranchGroup({});
            if (response.data) {
                var result = response.data.data;
                var mangoBranches = result.map((branch) => {
                    return {
                        type: "mango",
                        id: branch.id,
                        name: branch.name,
                    };
                });
                setBranchGroup(mangoBranches);
            } else if (response.error) {
                
            }
        }
        //Potato
        if (addTo === "POTATO CORNER") {
            const response2 = await getAllBranchGroupPotato({});

            if (response2.data) {
                var result = response2.data.data;
                var potatoBranches = result.map((branch) => {
                    return {
                        type: "potato",
                        id: branch.id,
                        name: branch.name,
                    };
                });
                setBranchGroup(potatoBranches);
            } else if (response2.error) {
               
            }
        }
    }

    async function fetchInventoryGroup() {
        setBranchGroup([]);
        //Mango
        if (addTo === "MANGO MAGIC") {
            const response = await getAllInventoryGroup({});
            if (response.data) {
                var result = response.data.data;
                var mangoInventory = result.map((inventory) => {
                    return {
                        type: "mango",
                        id: inventory.id,
                        name: inventory.name,
                    };
                });
                setInventoryGroup(mangoInventory);
            } else if (response.error) {
               
            }
        }
        //Potato
        if (addTo === "POTATO CORNER") {
            const response2 = await getAllInventoryGroupPotato({});

            if (response2.data) {
                var result = response2.data.data;
                var potatoInventory = result.map((inventory) => {
                    return {
                        type: "potato",
                        id: inventory.id,
                        name: inventory.name,
                    };
                });
                setInventoryGroup(potatoInventory);
            } else if (response2.error) {
               
            }
        }
    }

    async function fetchPriceLevel() {
        setPriceLevels([]);
        const response = await getAllPriceLevels();

        if (response) {
            setPriceLevels(response.data.data.data);
        }
    }

    //ADD FUNCTIONS
    async function handleCreatePI() {
        if (isSubmitClicked) {
            return;
        }
        if (validateFranchise(franchiseeInvoice, setIsError)) {
            setIsSubmitClicked(true);
            const response = await createFranchisee(franchiseeInvoice);
            if (response.data) {
                if (response.data?.message === "Data already exists") {
                    toast.error("Data already exists", { style: toastStyle() });
                } else {
                    toast.success("Successfully created franchise!", {
                        style: toastStyle(),
                    });
                    addPayment(response.data.franchisee_id);
                    setTimeout(
                        () =>
                            navigate(
                                "/franchise/print/" +
                                    response.data.franchisee_id
                            ),
                        1000
                    );
                }
            } else {
                toast.error(response.error.data.messages.error, {
                    style: toastStyle(),
                });
            }
        } else {
            toast.error("Please fill in all fields", {
                style: toastStyle(),
            });
        }
    }

    async function create() {
        if (isBranchClicked) {
            return;
        }
        if (validateBranches(addBranchData, setIsError, addTo)) {
            if (addTo === "MANGO MAGIC") {
                const response = await createBranch(addBranchData, {
                    osStartTime: osStartTime,
                    osEndTime: osEndTime,
                    deliveryStartTime: deliveryStartTime,
                    deliveryEndTime: deliveryEndTime,
                });
                if (response) {
                    if (response?.data?.status === "success") {
                        toast.success("Successfully added branch!", {
                            style: toastStyle(),
                        });
                        refreshPage();
                        setAddBranchData([]);
                        handleCloseAddBranchModal();
                    }
                    if (response?.error) {
                        toast.error(response.error.data.messages.error, {
                            style: toastStyle(),
                        });
                        handleCloseAddBranchModal();
                    }
                }
            } else if (addTo === "POTATO CORNER") {
                const response = await createBranchPotato(addBranchData, {
                    osStartTime: osStartTime,
                    osEndTime: osEndTime,
                    deliveryStartTime: deliveryStartTime,
                    deliveryEndTime: deliveryEndTime,
                });
                if (response) {
                    if (response?.data?.status === "success") {
                        toast.success("Successfully added branch!", {
                            style: toastStyle(),
                        });
                        refreshPage();
                        handleCloseAddBranchModal();
                    }
                    if (response?.error) {
                        toast.error(response.error.data.messages.error, {
                            style: toastStyle(),
                        });
                        handleCloseAddBranchModal();
                    }
                }
            }
        }
    }

    //EDIT FUNCTIONS
    async function handleUpdatePI() {
        if (validateFranchiseEdit(franchiseeInvoice, setIsError)) {
            if(parseFloat(franchiseeInvoice.beginning_credit_limit) >= parseFloat(franchiseeInvoice.payable_credit)){
                const response = await updateFranchisee(pi_id, franchiseeInvoice);
                if (response.data) {
                    toast.success("Successfully updated franchise!", {
                        style: toastStyle(),
                    });
                    setTimeout(() => navigate("/franchise"), 1000);
                } else {
                    toast.error(response.error.data.messages.error, {
                        style: toastStyle(),
                    });
                }
            } else if((parseFloat(franchiseeInvoice.beginning_credit_limit) <= parseFloat(franchiseeInvoice.payable_credit)) && userType === "admin"){
                const response = await updateFranchisee(pi_id, franchiseeInvoice);
                if (response.data) {
                    toast.success("Successfully updated franchise!", {
                        style: toastStyle(),
                    });
                    setTimeout(() => navigate("/franchise"), 1000);
                } else {
                    toast.error(response.error.data.messages.error, {
                        style: toastStyle(),
                    });
                }
            } else {
                toast.error("Credit limit is less than current credit", {
                    style: toastStyle(),
                });
            }
            
        } else {
            toast.error("Please fill in all fields", {
                style: toastStyle(),
            });
        }
    }

    //PAYMENT FUNCTION
    async function addPayment(id) {
        const response = await createFranchiseePayment(
            id,
            franchiseeInvoice.branch_id,
            franchiseeInvoice
        );
        if (response.data) {
            toast.success("Successfully paid!", { style: toastStyle() });
        } else {
            toast.error(response.error.data.messages.error, {
                style: toastStyle(),
            });
        }
    }

    //HANDLES
    const handleSubmit = () => {
        if (add) handleCreatePI();
        else if (edit) handleUpdatePI();
    };

    const handleAddChange = (e) => {
        const { name, value } = e.target;
        setAddBranchData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleChange = (e, isSelect) => { 
        // console.log(e)
        if (isSelect) { 
            const { name, value } = e.target;
            franchiseeBranchesInfo
                .filter((info) => info.value === value)
                .map((data) => {
                    setFranchiseeInvoice((prevState) => ({
                        ...prevState,
                        ["branch_id"]: value,
                        ["address"]: data.address,
                        ["contact_person"]: data.contact_person,
                        ["contact_number"]: data.contact_person_no,
                    }));
                });
        } else if(e.target.name === "beginning_credit_limit"){ 
            const { name, value } = e.target;
            if(add){
                setFranchiseeInvoice((prevState) => ({
                    ...prevState,
                    [name]: value,
                }));
            } else { 
                setFranchiseeInvoice((prevState) => ({
                    ...prevState,
                    [name]: value,
                }));
            }
            
            
        } else if (typeof e === "string") { 
            console.log(e)
            setFranchiseeInvoice((prevState) => ({
                ...prevState,
                ["name"]: e,
            }));
        } else { 
            const { name, value } = e.target;
            console.log(name, value)
            setFranchiseeInvoice((prevState) => ({
                ...prevState,
                [name]: value,
            }));
        }
    }; 
    console.log(franchiseeInvoice)

    const [name, setName] = useState(""); 

    const handleFranchiseChange = (e) => { 
        if (e[0] !== undefined) {
            if (e[0].customOption ? e[0].customOption : false) {
                setFranchiseeInvoice((prevState) => ({
                    ...prevState,
                    ["name"]: e[0].name,
                    ["email"]: "",
                }));
                setFranchiseeName([e[0]])
                setName(e[0].name);
            } else {
                setFranchiseeInvoice((prevState) => ({
                    ...prevState,
                    ["name"]: e[0].name,
                    ["email"]: e[0].email,
                }));
                setFranchiseeName([e[0]])

            }
        } else if(e === undefined || e === null || e.length === 0) { 
            setFranchiseeName([])
            if(e[0]?.name){
                setFranchiseeInvoice((prevState) => ({
                    ...prevState,
                    ["name"]: e[0].name,
                    ["email"]: "",
                }));
                setFranchiseeName([e[0]])
            }
            
        }

    };

    //USE EFFECTS
    useEffect(() => {
        if (pi_id) {
            fetchFranchisee();
        }

        fetchBranches();
        fetchBanks();
        fetchPriceLevel();
        fetchAllFranchisees();

    }, []);

    React.useEffect(() => {
        if (addTo !== "") {
            handleCloseAddModal()
            handleShowAddBranchModal();
            fetchBranchGroup();
            fetchInventoryGroup();
            fetchPriceLevel();
        }
    }, [addTo]);

    useEffect(() => {
        setGrandTotal(
            parseFloat(
                franchiseeInvoice.franchisee_fee
                    ? franchiseeInvoice.franchisee_fee
                    : 0
            ) + 
                parseFloat(
                    franchiseeInvoice.security_deposit
                        ? franchiseeInvoice.security_deposit
                        : 0
                ) +
                parseFloat(
                    franchiseeInvoice.taxes ? franchiseeInvoice.taxes : 0
                ) +
                parseFloat(
                    franchiseeInvoice.other_fee
                        ? franchiseeInvoice.other_fee
                        : 0
                ) +
                parseFloat(
                    franchiseeInvoice.franchisee_package
                        ? franchiseeInvoice.franchisee_package
                        : 0
                )
        );
    }, [
        franchiseeInvoice.royalty_fee,
        franchiseeInvoice.marketing_fee,
        franchiseeInvoice.franchisee_fee, 
        franchiseeInvoice.franchisee_package, 
        franchiseeInvoice.security_deposit,
        franchiseeInvoice.taxes,
        franchiseeInvoice.other_fee,
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
                {/* header */}
                <div className="d-flex justify-content-between align-items-center my-3 pb-4">
                    <h1 className="page-title mb-0">
                        {add ? "ADD " : "EDIT "}FRANCHISEE
                    </h1>
                </div>

                {/* content */}
                <div className="edit-form">
                    {/* FRANCHISEE SALES INVOICE DETAILS */}
                    <Fragment>
                        <Row className="pt-3 mb-2">
                            <Col xs={5}>
                                <span className="edit-label">
                                    Franchised Branch
                                    <label className="badge-required">{` *`}</label>
                                </span>
                            </Col>
                            <Col xs={3}>
                                <span className="edit-label">
                                    Franchise Date
                                    <label className="badge-required">{` *`}</label>
                                </span>
                            </Col>
                            <Col>
                                <span className="edit-label">
                                    Opening Date
                                    {/* <label className="badge-required">{` *`}</label> */}
                                </span>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={5}>
                                <Form.Select
                                    type="select"
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                    placeholder="Select Branch..."
                                    name="branch_id"
                                    value={franchiseeInvoice.branch_id}
                                    onChange={(e) => handleChange(e, true)}
                                >
                                    <option value="">Select a branch...</option>
                                    {franchiseeBranches.map((data) => {
                                        return (
                                            <option value={data.value}>
                                                {data.label}
                                            </option>
                                        );
                                    })}
                                </Form.Select>
                                <InputError
                                    isValid={isError.branch_id}
                                    message={"Branch is required"}
                                />

                                <Col>
                                    <div className="d-flex justify-content-end">
                                        <span
                                            className="edit-label"
                                            style={{ color: "#df1227" }}
                                        >
                                            Branch Not Found?{" "}
                                            <a
                                                onClick={
                                                    handleShowAddModal
                                                }
                                                className="add-supplier-label"
                                            >
                                                Click here to add branch
                                            </a>
                                        </span>
                                    </div>
                                </Col>
                            </Col>
                            <Col xs={3}>
                                <Form.Control
                                    type="date"
                                    name="franchised_on"
                                    className="nc-modal-custom-text"
                                    value={franchiseeInvoice.franchised_on}
                                    defaultValue={today}
                                    onChange={(e) => handleChange(e, false)}
                                />
                                <InputError
                                    isValid={isError.franchised_on}
                                    message={"Franchise date is required"}
                                />
                            </Col>
                            <Col>
                                <Form.Control
                                    type="date"
                                    name="opening_start"
                                    className="nc-modal-custom-text"
                                    value={franchiseeInvoice.opening_start}
                                    onChange={(e) => handleChange(e)}
                                />
                                <InputError
                                    isValid={isError.opening_start}
                                    message={"Opening start is required"}
                                />
                            </Col>
                        </Row>
                        <Row className="mt-4 mb-2">
                            <Col>
                                <span className="edit-label">
                                    Franchisee Name
                                    <label className="badge-required">{` *`}</label>
                                </span>
                            </Col>
                            <Col>
                                <span className="edit-label">
                                    Branch Address
                                </span>
                            </Col>
                            <Col>
                                <span className="edit-label">
                                    Franchisee Contact Number
                                </span>
                            </Col>
                            <Col xs={3}>
                                <span className="edit-label">Email</span>
                            </Col>
                        </Row>
                        <Row>
                            <Col> 
                                <Typeahead
                                    id="basic-typeahead-single"
                                    name="name"
                                    labelKey="name"
                                    allowNew
                                    className="nc-modal-custom-text" 
                                    onChange={(e) => handleFranchiseChange(e)} 
                                    options={franchisees}
                                    placeholder="Type a franchisee..." 
                                    selected={franchiseeName}
                                />
                                <InputError
                                    isValid={isError.name}
                                    message={"Franchisee name is required"}
                                />
                            </Col>
                            <Col>
                                <Form.Control
                                    type="text"
                                    name="address"
                                    className="nc-modal-custom-text"
                                    value={franchiseeInvoice.address}
                                    onChange={(e) => handleChange(e)} 
                                />
                            </Col>
                            <Col>
                                <Form.Control
                                    type="text"
                                    name="franchisee_contact_no"
                                    value={
                                        franchiseeInvoice.franchisee_contact_no
                                    }
                                    className="nc-modal-custom-text"
                                    onChange={(e) => handleChange(e, false)}
                                />
                            </Col>
                            <Col xs={3}>
                                <Form.Control
                                    type="text"
                                    name="email"
                                    className="nc-modal-custom-text"
                                    value={franchiseeInvoice.email}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                        </Row>
                        <Row className="mt-4 mb-2">
                            <Col>
                                <span className="edit-label">
                                    Contact Person
                                    <label className="badge-required">{` *`}</label>
                                </span>
                            </Col>
                            <Col>
                                <span className="edit-label">
                                    Contact Number
                                    <label className="badge-required">{` *`}</label>
                                </span>
                            </Col>
                            <Col>
                                <span className="edit-label">
                                    Credit Limit
                                    <label className="badge-required">{` *`}</label>
                                </span>
                            </Col>
                        </Row>
                        <Row className="mt-4 mb-2">
                            <Col>
                                <Form.Control
                                    type="text"
                                    name="contact_person"
                                    className="nc-modal-custom-text"
                                    value={franchiseeInvoice.contact_person}
                                    onChange={(e) => handleChange(e)} 
                                />
                                <InputError
                                    isValid={isError.contact_person}
                                    message={"Contact person is required"}
                                />
                            </Col>
                            <Col>
                                <Form.Control
                                    type="text"
                                    name="contact_number"
                                    className="nc-modal-custom-text"
                                    value={franchiseeInvoice.contact_number}
                                    onChange={(e) => handleChange(e)} 
                                />
                                <InputError
                                    isValid={isError.contact_number}
                                    message={"Contact number is required"}
                                />
                            </Col>
                            <Col>
                                <Form.Control
                                    type="text"
                                    name="beginning_credit_limit"
                                    className="nc-modal-custom-text"
                                    value={franchiseeInvoice.beginning_credit_limit}
                                    onChange={(e) => handleChange(e)} 
                                />
                                <InputError
                                    isValid={isError.beginning_credit_limit}
                                    message={"Credit limit is required"}
                                />
                            </Col>
                        </Row>
                        <Row className="mt-4 mb-2">
                            <Col>
                                <span className="edit-label">
                                    Royalty Fee (%)
                                </span>
                            </Col>
                            <Col>
                                <span className="edit-label">
                                    Marketing Fee (%)
                                </span>
                            </Col>
                            <Col>
                                <span className="edit-label">
                                    Contract Start
                                    <label className="badge-required">{` *`}</label>
                                </span>
                            </Col>
                            <Col>
                                <span className="edit-label">
                                    Contract End
                                    <label className="badge-required">{` *`}</label>
                                </span>
                            </Col>
                        </Row>
                        <Row className="mt-4 mb-2">
                            <Col>
                                <Form.Control
                                    type="text"
                                    name="royalty_fee"
                                    className="nc-modal-custom-text"
                                    value={franchiseeInvoice.royalty_fee}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                            <Col>
                                <Form.Control
                                    type="text"
                                    name="marketing_fee"
                                    className="nc-modal-custom-text"
                                    value={franchiseeInvoice.marketing_fee}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                            <Col>
                                <Form.Control
                                    type="date"
                                    name="contract_start"
                                    className="nc-modal-custom-text"
                                    value={franchiseeInvoice.contract_start}
                                    onChange={(e) => handleChange(e)}
                                />
                                <InputError
                                    isValid={isError.contract_start}
                                    message={"Contract start is required"}
                                />
                            </Col>
                            <Col>
                                <Form.Control
                                    type="date"
                                    name="contract_end"
                                    className="nc-modal-custom-text"
                                    value={franchiseeInvoice.contract_end}
                                    onChange={(e) => handleChange(e)}
                                />
                                <InputError
                                    isValid={isError.contract_end}
                                    message={"Contract end is required"}
                                />
                            </Col>
                        </Row>
                    </Fragment>

                    {/* GRAND TOTAL */}
                    <Row className="align-right pt-3 mt-5">
                        <Col xs={2} className="text-end">
                            <span className="edit-label color-gray">
                                Package Type
                                <label className="badge-required">{` *`}</label>
                            </span>
                        </Col>
                        <Col xs={1} className="text-end"> 
                        </Col>
                        <Col xs={3}>
                            <Form.Control
                                type="text"
                                name="package_type" 
                                value={franchiseeInvoice.package_type}
                                className="align-middle nc-modal-custom-text"
                                onChange={(e) => handleChange(e)} 
                            />
                            <InputError
                                isValid={isError.package_type}
                                message={"Package fee is required"}
                            />
                        </Col>
                    </Row>
                    <Row className="align-right pt-3">
                        <Col xs={2} className="text-end">
                            <span className="edit-label color-gray">
                                Franchise Package
                                {/* <label className="badge-required">{` *`}</label> */}
                            </span>
                        </Col>
                        <Col xs={1} className="text-end">
                            <span className="edit-label align-middle">PHP</span>
                        </Col>
                        <Col xs={3}>
                            <Form.Control
                                type="number"
                                name="franchisee_package"
                                min={0}
                                step="0.01"
                                value={franchiseeInvoice.franchisee_package}
                                className="align-middle nc-modal-custom-text"
                                onChange={(e) => handleChange(e)} 
                            />
                            {/* <InputError
                                isValid={isError.franchisee_package}
                                message={"Franchise package is required"}
                            /> */}
                        </Col>
                    </Row>
                    <Row className="align-right pt-3">
                        <Col xs={2} className="text-end">
                            <span className="edit-label color-gray">
                                Franchise Fee
                                <label className="badge-required">{` *`}</label>
                            </span>
                        </Col>
                        <Col xs={1} className="text-end">
                            <span className="edit-label align-middle">PHP</span>
                        </Col>
                        <Col xs={3}>
                            <Form.Control
                                type="number"
                                name="franchisee_fee"
                                min={0}
                                step="0.01"
                                value={franchiseeInvoice.franchisee_fee}
                                className="align-middle nc-modal-custom-text"
                                onChange={(e) => handleChange(e)} 
                            />
                            <InputError
                                isValid={isError.franchisee_fee}
                                message={"Franchise fee is required"}
                            />
                        </Col>
                    </Row>
                    <Row className="align-right pt-3">
                        <Col xs={2} className="text-end">
                            <span className="edit-label color-gray">
                                Security Deposit
                            </span>
                        </Col>
                        <Col xs={1} className="text-end">
                            <span className="edit-label align-middle">PHP</span>
                        </Col>
                        <Col xs={3}>
                            <Form.Control
                                type="number"
                                name="security_deposit"
                                min={0}
                                step="0.01"
                                value={franchiseeInvoice.security_deposit}
                                className="align-middle nc-modal-custom-text"
                                onChange={(e) => handleChange(e)} 
                            />
                        </Col>
                    </Row>
                    <Row className="align-right pt-3">
                        <Col xs={2} className="text-end">
                            <span className="edit-label color-gray">Taxes</span>
                        </Col>
                        <Col xs={1} className="text-end">
                            <span className="edit-label align-middle">PHP</span>
                        </Col>
                        <Col xs={3}>
                            <Form.Control
                                type="number"
                                name="taxes"
                                min={0}
                                step="0.01"
                                value={franchiseeInvoice.taxes}
                                className="align-middle nc-modal-custom-text"
                                onChange={(e) => handleChange(e)} 
                            />
                            <InputError
                                isValid={isError.taxes}
                                message={"Taxes is required"}
                            />
                        </Col>
                    </Row>
                    <Row className="align-right pt-3">
                        <Col xs={2} className="text-end">
                            <span className="edit-label color-gray">
                                Other Fees
                            </span>
                        </Col>
                        <Col xs={1} className="text-end">
                            <span className="edit-label align-middle">PHP</span>
                        </Col>
                        <Col xs={3}>
                            <Form.Control
                                type="number"
                                name="other_fee"
                                min={0}
                                step="0.01"
                                value={franchiseeInvoice.other_fee}
                                className="align-middle nc-modal-custom-text"
                                onChange={(e) => handleChange(e)} 
                            />
                            <InputError
                                isValid={isError.other_fee}
                                message={"Other fee is required"}
                            />
                        </Col>
                    </Row>
                    <Row className="align-right py-5">
                        <Col xs={2} className="text-end">
                            <span className="edit-label color-gray grand-total-text">
                                Grand Total
                            </span>
                        </Col>
                        <Col xs={1} className="text-end">
                            <span className="edit-label align-middle grand-total-text">
                                PHP
                            </span>
                        </Col>
                        <Col xs={3} className="text-end">
                            <span className="edit-label align-middle grand-total-text">
                                {franchiseeInvoice.paid_amount
                                    ? numberFormat(
                                          grandTotal 
                                            // - parseFloat(
                                            //       franchiseeInvoice.paid_amount
                                            //   )
                                      )
                                    : numberFormat(grandTotal)} 
                            </span>
                        </Col>
                    </Row>
                    {add && (
                        <>
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
                                        name="payment_method"
                                        value="cash"
                                        type="radio"
                                        defaultChecked={
                                            franchiseeInvoice.payment_method ===
                                            "cash"
                                        }
                                        onClick={(e) => {
                                            handleChange(e);
                                        }} 
                                    />
                                    <Form.Check
                                        inline
                                        label="Check"
                                        name="payment_method"
                                        type="radio"
                                        value="check"
                                        defaultChecked={
                                            franchiseeInvoice.payment_method ===
                                            "check"
                                        }
                                        onClick={(e) => {
                                            handleChange(e);
                                        }} 
                                    />
                                    <Form.Check
                                        inline
                                        label="Others"
                                        name="payment_method"
                                        value="others"
                                        defaultChecked={
                                            franchiseeInvoice.payment_method ===
                                            "others"
                                        }
                                        type="radio"
                                        onClick={(e) => {
                                            handleChange(e);
                                        }} 
                                    />
                                    <InputError
                                        isValid={isError.payment_method}
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
                                        name="amount"
                                        min={0}
                                        step="0.01" 
                                        className="align-middle nc-modal-custom-text"
                                        onChange={(e) => handleChange(e)} 
                                    />
                                    <InputError
                                        isValid={isError.amount}
                                        message={"Amount is required"}
                                    />
                                </Col>
                            </Row>
                        </>
                    )}

                    {/* CASH PAYMENT DETAILS */}
                    {franchiseeInvoice.payment_method === "cash" && (
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
                                        isValid={isError.payment_date}
                                        message={"Payment date is required"}
                                    />
                                </Col>
                            </Row>
                            <Row className="mt-4 mb-2">
                                <Col>
                                    <span className="edit-label">
                                        Invoice Number
                                        <label className="badge-required">{` *`}</label>
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Control
                                        type="text"
                                        name="invoice_no"
                                        className="nc-modal-custom-text"
                                        value={franchiseeInvoice.invoice_no}
                                        onChange={(e) => handleChange(e)}
                                    />
                                    <InputError
                                        isValid={isError.invoice_no}
                                        message={"Invoice Number is required"}
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
                                        name="term_days"
                                        className="nc-modal-custom-text"
                                        value={franchiseeInvoice.term_days}
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
                    {franchiseeInvoice.payment_method === "check" && (
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
                                        Invoice Number
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
                                        isValid={isError.payment_date}
                                        message={"Payment date is required"}
                                    />
                                </Col>
                                <Col>
                                    <Form.Control
                                        type="text"
                                        name="invoice_no"
                                        className="nc-modal-custom-text"
                                        value={franchiseeInvoice.invoice_no}
                                        onChange={(e) => handleChange(e)}
                                    />
                                    <InputError
                                        isValid={isError.invoice_no}
                                        message={"Invoice Number is required"}
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
                                        isValid={isError.cheque_date}
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
                                        isValid={isError.bank_name}
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
                                        isValid={isError.cheque_number}
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
                                        name="term_days"
                                        className="nc-modal-custom-text"
                                        value={franchiseeInvoice.term_days}
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
                    {franchiseeInvoice.payment_method === "others" && (
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
                                        Invoice Number
                                        <label className="badge-required">{` *`}</label>
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Control
                                        type="text"
                                        name="invoice_no"
                                        className="nc-modal-custom-text"
                                        value={franchiseeInvoice.invoice_no}
                                        onChange={(e) => handleChange(e)}
                                    />
                                    <InputError
                                        isValid={isError.invoice_no}
                                        message={"Invoice Number is required"}
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
                                        isValid={isError.reference_number}
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
                                        name="term_days"
                                        className="nc-modal-custom-text"
                                        value={franchiseeInvoice.term_days}
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

                    {/* FOOTER: CANCEL & SUBMIT BUTTONS */}
                    <div className="d-flex justify-content-end pt-5 pb-3">
                        <button
                            type="button"
                            className="button-secondary me-3"
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </button>
                        {isSubmitClicked ? (
                            <div className="button-primary d-flex justify-content-center">
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
                                className="button-primary"
                                onClick={handleSubmit}
                            >
                                Submit
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <Modal
                show={showAddModal}
                onHide={handleCloseAddModal}
                size="lg"
                centered
            >
                <Modal.Header closeButton>
                    <p className="custom-modal-body-title"> CHOOSE STORE </p>
                </Modal.Header>
                <Modal.Body>
                    <div className="text">
                        <Form.Select
                            name="type"
                            className="date-filter me-3"
                            onChange={(e) => setAddTo(e.target.value)}
                        >
                            <option value="" hidden selected>
                                Select Type
                            </option>
                            <option value="MANGO MAGIC">Mango Magic</option>
                            <option value="POTATO CORNER">Potato Corner</option>
                        </Form.Select>
                    </div>
                </Modal.Body>
            </Modal>
            <AddModal
                title="BRANCH"
                type="branch"
                show={showAddBranchModal}
                onHide={handleCloseAddBranchModal}
                onSave={() => create()}
                isProceed={addBranchData.is_franchise === "1" ? true : false}
                isClicked={isClicked}
            >
                <div className="mt-3 edit-form">
                    <Row className="nc-modal-custom-row mt-0">
                        <Col>
                            BRANCH NAME
                            <span className="required-icon">*</span>
                            <Form.Control
                                type="text"
                                name="name"
                                value={addBranchData.name}
                                className="nc-modal-custom-input-edit"
                                onChange={(e) => handleAddChange(e)}
                                required
                            />
                            <InputError
                                isValid={isError.name}
                                message={"Branch name is required"}
                            />
                        </Col>
                        <Col>
                            ADDRESS
                            <span className="required-icon">*</span>
                            <Form.Control
                                type="text"
                                name="address"
                                value={addBranchData.address}
                                className="nc-modal-custom-input-edit"
                                onChange={(e) => handleAddChange(e)}
                                required
                            />
                            <InputError
                                isValid={isError.address}
                                message={"Address is required"}
                            />
                        </Col>
                        <Col xl={3}>
                            PHONE NUMBER
                            <span className="required-icon">*</span>
                            <Form.Control
                                type="text"
                                name="phone_no"
                                value={addBranchData.phone_no}
                                className="nc-modal-custom-input-edit"
                                onChange={(e) => handleAddChange(e)}
                                required
                            />
                            <InputError
                                isValid={isError.phone_no}
                                message={"Phone number is required"}
                            />
                        </Col>
                    </Row>
                    {addTo !== "POTATO CORNER" && (
                        <>
                            <Row className="nc-modal-custom-row">
                                <Col xl={3}>
                                    BRANCH TYPE
                                    <span className="required-icon">*</span>
                                    <InputError
                                        isValid={isError.is_franchise}
                                        message={"Branch type is required"}
                                    />
                                </Col>
                            </Row>
                            <Row className="nc-modal-custon-row">
                                <Col xl={3}>
                                    <input
                                        type="radio"
                                        name="is_franchise"
                                        value="1"
                                        className=""
                                        onChange={(e) => handleAddChange(e)}
                                        required
                                    />
                                    <span className="radio-label">
                                        FRANCHISE
                                    </span>
                                </Col>
                                <Col xl={3}>
                                    <input
                                        type="radio"
                                        name="is_franchise"
                                        value="0"
                                        className=""
                                        onChange={(e) => handleAddChange(e)}
                                        required
                                    />
                                    <span className="radio-label">
                                        COMPANY-OWNED
                                    </span>
                                </Col>
                                <Col xl={3}>
                                    <input
                                        type="radio"
                                        name="is_franchise"
                                        value="2"
                                        className=""
                                        onChange={(e) => handleAddChange(e)}
                                        required
                                    />
                                    <span className="radio-label">OTHERS</span>
                                </Col>
                            </Row>
                        </>
                    )}
                    {addBranchData.is_franchise === "0" && (
                        <Row className="nc-modal-custom-row">
                            <Col>
                                MONTHLY RENTAL FEE
                                <Form.Control
                                    type="text"
                                    name="monthly_rental_fee"
                                    value={addBranchData.monthly_rental_fee}
                                    className="nc-modal-custom-input-edit"
                                    onChange={(e) => handleAddChange(e)}
                                    required
                                />
                                <InputError
                                    isValid={isError.monthly_rental_fee}
                                    message={"Monthly rental fee is required"}
                                />
                            </Col>
                        </Row>
                    )}
                    {addBranchData.is_franchise !== "2" ? (
                        <>
                            <Row className="nc-modal-custom-row">
                                <Col>
                                    PRICE LEVEL 
                                    <Form.Select 
                                        name="price_level"
                                        className="nc-modal-custom-input"
                                        value={addBranchData.price_level}
                                        onChange={(e) => handleAddChange(e)} 
                                    >
                                        <option value="">
                                            Select price level...
                                        </option>
                                        {priceLevel.map((data) => {
                                            return (
                                                <option value={data.name}>
                                                    {data.name}
                                                </option>
                                            );
                                        })}
                                    </Form.Select>
                                </Col>
                                <Col>
                                    BRANCH GROUP 
                                    <Form.Select 
                                        name="branch_group_id"
                                        className="nc-modal-custom-input"
                                        value={addBranchData.branch_group_id}
                                        onChange={(e) => handleAddChange(e)} 
                                    >
                                        <option value="">
                                            Select Branch group...
                                        </option>
                                        {branchGroup.map((data) => {
                                            return (
                                                <option value={data.id}>
                                                    {data.name}
                                                </option>
                                            );
                                        })}
                                    </Form.Select>
                                </Col>
                                <Col>
                                    INVENTORY GROUP
                                    {/* <span className="required-icon">*</span> */}
                                    <Form.Select 
                                        name="inventory_group_id"
                                        className="nc-modal-custom-input"
                                        value={addBranchData.inventory_group_id}
                                        onChange={(e) => handleAddChange(e)} 
                                    >
                                        <option value="">
                                            Select inventory group...
                                        </option>
                                        {inventoryGroup.map((data) => {
                                            return (
                                                <option value={data.id}>
                                                    {data.name}
                                                </option>
                                            );
                                        })}
                                    </Form.Select>
                                    <InputError
                                        isValid={isError.inventory_group_id}
                                        message={"Inventory group is required"}
                                    />
                                </Col>
                            </Row>
                            <Row className="nc-modal-custom-row">
                                <Col>
                                    INITIAL DRAWER
                                    <span className="required-icon">*</span>
                                    <Form.Control
                                        type="text"
                                        name="initial_drawer"
                                        value={addBranchData.initial_drawer}
                                        className="nc-modal-custom-input-edit"
                                        onChange={(e) => handleAddChange(e)}
                                        required
                                    />
                                    <InputError
                                        isValid={isError.initial_drawer}
                                        message={"Initial drawer is required"}
                                    />
                                </Col>
                            </Row>
                            <Row className="nc-modal-custom-row">
                                <Col xl={3}>
                                    TIN NUMBER
                                    <Form.Control
                                        type="text"
                                        name="tin_no"
                                        value={addBranchData.tin_no}
                                        className="nc-modal-custom-input-edit"
                                        onChange={(e) => handleAddChange(e)}
                                        required
                                    />
                                </Col>
                                <Col xl={3}>
                                    BIR NUMBER
                                    <Form.Control
                                        type="text"
                                        name="bir_no"
                                        value={addBranchData.bir_no}
                                        className="nc-modal-custom-input-edit"
                                        onChange={(e) => handleAddChange(e)}
                                        required
                                    />
                                </Col>
                                <Col xl={3}>
                                    CONTRACT START
                                    <Form.Control
                                        type="date"
                                        name="contract_start"
                                        value={addBranchData.contract_start}
                                        className="nc-modal-custom-input-edit"
                                        onChange={(e) => handleAddChange(e)}
                                        required
                                    />
                                </Col>
                                <Col xl={3}>
                                    CONTRACT END
                                    <Form.Control
                                        type="date"
                                        name="contract_end"
                                        value={addBranchData.contract_end}
                                        className="nc-modal-custom-input-edit"
                                        onChange={(e) => handleAddChange(e)}
                                        required
                                    />
                                </Col>
                            </Row>
                            <Row className="nc-modal-custom-row">
                                <Col>OPERATION SCHEDULE</Col>
                            </Row>
                            <Row className="nc-modal-custom-row">
                                <Col sm={6}>
                                    FROM
                                    <Form.Select
                                        name="os_startDate"
                                        className="nc-modal-custom-input"
                                        value={addBranchData.os_startDate}
                                        onChange={(e) => handleAddChange(e)}
                                        required
                                    >
                                        <option value="monday" selected>
                                            Monday
                                        </option>
                                        <option value="tuesday">Tuesday</option>
                                        <option value="wednesday">
                                            Wednesday
                                        </option>
                                        <option value="thursday">
                                            Thursday
                                        </option>
                                        <option value="friday">Friday</option>
                                        <option value="saturday">
                                            Saturday
                                        </option>
                                        <option value="sunday">Sunday</option>
                                    </Form.Select>
                                </Col>
                                <Col sm={6}>
                                    To
                                    <Form.Select
                                        name="os_endDate"
                                        className="nc-modal-custom-input"
                                        value={addBranchData.os_endDate}
                                        onChange={(e) => handleAddChange(e)}
                                        required
                                    >
                                        {addBranchData.os_startDate ===
                                            "monday" && (
                                            <>
                                                <option value="tuesday">
                                                    Tuesday
                                                </option>
                                                <option value="wednesday">
                                                    Wednesday
                                                </option>
                                                <option value="thursday">
                                                    Thursday
                                                </option>
                                                <option value="friday">
                                                    Friday
                                                </option>
                                                <option value="saturday">
                                                    Saturday
                                                </option>
                                                <option value="sunday">
                                                    Sunday
                                                </option>
                                            </>
                                        )}
                                        {addBranchData.os_startDate ===
                                            "tuesday" && (
                                            <>
                                                <option value="wednesday">
                                                    Wednesday
                                                </option>
                                                <option value="thursday">
                                                    Thursday
                                                </option>
                                                <option value="friday">
                                                    Friday
                                                </option>
                                                <option value="saturday">
                                                    Saturday
                                                </option>
                                                <option value="sunday">
                                                    Sunday
                                                </option>
                                            </>
                                        )}
                                        {addBranchData.os_startDate ===
                                            "wednesday" && (
                                            <>
                                                <option value="thursday">
                                                    Thursday
                                                </option>
                                                <option value="friday">
                                                    Friday
                                                </option>
                                                <option value="saturday">
                                                    Saturday
                                                </option>
                                                <option value="sunday">
                                                    Sunday
                                                </option>
                                            </>
                                        )}
                                        {addBranchData.os_startDate ===
                                            "thursday" && (
                                            <>
                                                <option value="friday">
                                                    Friday
                                                </option>
                                                <option value="saturday">
                                                    Saturday
                                                </option>
                                                <option value="sunday">
                                                    Sunday
                                                </option>
                                            </>
                                        )}
                                        {addBranchData.os_startDate ===
                                            "Friday" && (
                                            <>
                                                <option value="saturday">
                                                    Saturday
                                                </option>
                                                <option value="sunday">
                                                    Sunday
                                                </option>
                                            </>
                                        )}
                                        {addBranchData.os_startDate ===
                                            "Saturday" && (
                                            <option value="saturday">
                                                Sunday
                                            </option>
                                        )}
                                        {addBranchData.os_startDate ===
                                            "Sunday" && <></>}
                                    </Form.Select>
                                </Col>
                            </Row>
                            <Row className="nc-modal-custom-row">
                                <Col sm={4}>
                                    FROM
                                    <Form>
                                        <ReactDatePicker
                                            selected={osStartTime}
                                            onChange={(date) =>
                                                setOsStartTime(date)
                                            }
                                            showTimeSelect
                                            showTimeSelectOnly
                                            timeIntervals={15}
                                            timeCaption="Time"
                                            dateFormat="h:mm aa"
                                        />
                                    </Form>
                                </Col>
                                <Col sm={4}>
                                    To
                                    <Form>
                                        <ReactDatePicker
                                            selected={osEndTime}
                                            onChange={(date) =>
                                                setOsEndTime(date)
                                            }
                                            showTimeSelect
                                            showTimeSelectOnly 
                                            timeIntervals={15}
                                            timeCaption="Time"
                                            dateFormat="h:mm aa"
                                        />
                                    </Form>
                                </Col>
                            </Row>
                            <Row className="nc-modal-custom-row">
                                <Col>GRABFOOD/FOODPANDA OPERATION SCHEDULE</Col>
                            </Row>
                            <Row className="nc-modal-custom-row">
                                <Col sm={6}>
                                    FROM
                                    <Form.Select
                                        name="delivery_startDate"
                                        className="nc-modal-custom-input"
                                        value={addBranchData.delivery_startDate}
                                        onChange={(e) => handleAddChange(e)}
                                        required
                                    >
                                        <option value="monday" selected>
                                            Monday
                                        </option>
                                        <option value="tuesday">Tuesday</option>
                                        <option value="wednesday">
                                            Wednesday
                                        </option>
                                        <option value="thursday">
                                            Thursday
                                        </option>
                                        <option value="friday">Friday</option>
                                        <option value="saturday">
                                            Saturday
                                        </option>
                                        <option value="sunday">Sunday</option>
                                    </Form.Select>
                                </Col>
                                <Col sm={6}>
                                    To
                                    <Form.Select
                                        name="delivery_endDate"
                                        className="nc-modal-custom-input"
                                        value={addBranchData.delivery_endDate}
                                        onChange={(e) => handleAddChange(e)}
                                        required
                                    >
                                        {addBranchData.delivery_startDate ===
                                            "monday" && (
                                            <>
                                                <option value="tuesday">
                                                    Tuesday
                                                </option>
                                                <option value="wednesday">
                                                    Wednesday
                                                </option>
                                                <option value="thursday">
                                                    Thursday
                                                </option>
                                                <option value="friday">
                                                    Friday
                                                </option>
                                                <option value="saturday">
                                                    Saturday
                                                </option>
                                                <option value="sunday">
                                                    Sunday
                                                </option>
                                            </>
                                        )}
                                        {addBranchData.delivery_startDate ===
                                            "tuesday" && (
                                            <>
                                                <option value="wednesday">
                                                    Wednesday
                                                </option>
                                                <option value="thursday">
                                                    Thursday
                                                </option>
                                                <option value="friday">
                                                    Friday
                                                </option>
                                                <option value="saturday">
                                                    Saturday
                                                </option>
                                                <option value="sunday">
                                                    Sunday
                                                </option>
                                            </>
                                        )}
                                        {addBranchData.delivery_startDate ===
                                            "wednesday" && (
                                            <>
                                                <option value="thursday">
                                                    Thursday
                                                </option>
                                                <option value="friday">
                                                    Friday
                                                </option>
                                                <option value="saturday">
                                                    Saturday
                                                </option>
                                                <option value="sunday">
                                                    Sunday
                                                </option>
                                            </>
                                        )}
                                        {addBranchData.delivery_startDate ===
                                            "thursday" && (
                                            <>
                                                <option value="friday">
                                                    Friday
                                                </option>
                                                <option value="saturday">
                                                    Saturday
                                                </option>
                                                <option value="sunday">
                                                    Sunday
                                                </option>
                                            </>
                                        )}
                                        {addBranchData.delivery_startDate ===
                                            "Friday" && (
                                            <>
                                                <option value="saturday">
                                                    Saturday
                                                </option>
                                                <option value="sunday">
                                                    Sunday
                                                </option>
                                            </>
                                        )}
                                        {addBranchData.delivery_startDate ===
                                            "Saturday" && (
                                            <option value="saturday">
                                                Sunday
                                            </option>
                                        )}
                                        {addBranchData.delivery_startDate ===
                                            "Sunday" && <></>}
                                    </Form.Select>
                                </Col>
                            </Row>
                            <Row className="nc-modal-custom-row">
                                <Col sm={4}>
                                    FROM
                                    <Form>
                                        <ReactDatePicker
                                            selected={deliveryStartTime}
                                            onChange={(date) =>
                                                setDeliveryStartTime(date)
                                            }
                                            showTimeSelect
                                            showTimeSelectOnly
                                            timeIntervals={15}
                                            timeCaption="Time"
                                            dateFormat="h:mm aa"
                                        />
                                    </Form>
                                </Col>
                                <Col sm={4}>
                                    To
                                    <Form>
                                        <ReactDatePicker
                                            selected={deliveryEndTime}
                                            onChange={(date) =>
                                                setDeliveryEndTime(date)
                                            }
                                            showTimeSelect
                                            showTimeSelectOnly
                                            timeIntervals={15}
                                            timeCaption="Time"
                                            dateFormat="h:mm aa"
                                        />
                                    </Form>
                                </Col>
                            </Row>
                            <Row className="nc-modal-custom-row">
                                <Col xl={3}>
                                    OPENING DATE
                                    <Form.Control
                                        type="date"
                                        name="opening_date"
                                        value={addBranchData.opening_date}
                                        className="nc-modal-custom-input-edit"
                                        onChange={(e) => handleAddChange(e)}
                                        required
                                    />
                                </Col>
                                <Col>
                                    CONTACT PERSON
                                    <span className="required-icon">*</span>
                                    <Form.Control
                                        type="text"
                                        name="contact_person"
                                        value={addBranchData.contact_person}
                                        className="nc-modal-custom-input-edit"
                                        onChange={(e) => handleAddChange(e)}
                                        required
                                    />
                                    <InputError
                                        isValid={isError.contact_person}
                                        message={"Contact person is required"}
                                    />
                                </Col>
                                <Col>
                                    CONTACT PERSON PHONE NUMBER
                                    <span className="required-icon">*</span>
                                    <Form.Control
                                        type="text"
                                        name="contact_person_no"
                                        value={addBranchData.contact_person_no}
                                        className="nc-modal-custom-input-edit"
                                        onChange={(e) => handleAddChange(e)}
                                        required
                                    />
                                    <InputError
                                        isValid={isError.contact_person_no}
                                        message={
                                            "Contact person phone number is required"
                                        }
                                    />
                                </Col>
                            </Row>
                        </>
                    ) : (
                        <></>
                    )}
                </div>
            </AddModal>
        </div>
    );
}

FormFranchiseInvoice.defaultProps = {
    add: false,
    edit: false,
};

export default FormFranchiseInvoice;
