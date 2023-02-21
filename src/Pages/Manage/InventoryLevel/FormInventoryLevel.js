import React, { Fragment, useState, useEffect } from "react";
import { Button, Col, Container, Form, Row, Table } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../Components/Navbar/Navbar";
import trash from "./../../../Assets/Images/trash.png";
import Select from "react-select";
import ReactLoading from "react-loading";
import toast from "react-hot-toast";

//Components
import {
    toastStyle,
    refreshPage,
    isAdmin,
    formatDate,
    TokenExpiry,
    capitalizeFirstLetter,
} from "../../../Helpers/Utils/Common";

//Api
import { getAllBranches } from "../../../Helpers/apiCalls/Purchases/purchaseOrderApi";
import { getAllBranchesPotato } from "../../../Helpers/apiCalls/PotatoCorner/Purchases/purchaseOrderApi";
import {
    getAllInventoryGroup,
    getAllInventoryGroupPotato,
    getInventoryGroup,
    getInventoryGroupPotato,
    createInventoryGroup,
    createInventoryGroupPotato,
    updateInventoryGroup,
    updateInventoryGroupPotato,
    deleteInventoryGroup,
    deleteInventoryGroupPotato,
    searchBranch,
    searchBranchPotato,
} from "../../../Helpers/apiCalls/Manage/InventoryGroup";

function FormInventoryLevel({ add, edit }) {

    //*****VARIABLES*****
    const { id, type } = useParams();
    let navigate = useNavigate();
    const [inactive, setInactive] = useState(true);
    const [isClicked, setIsClicked] = useState(false);
    const [branchOptions, setBranchOptions] = useState([]);
    const [addTo, setAddTo] = useState("");
    const [selectedBranches, setSelectedBranches] = useState([
        {
            id: "", name: "",
        },
    ])
    const [addInventoryData, setAddInventoryData] = useState({});


    //*****FUNCTIONS*****
    function renderTable() {
        return (
            <Table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {selectedBranches.map((selectedBranch, index) => {
                        return (
                            <tr>
                                <td >
                                    <Select
                                        className="react-select-container"
                                        placeholder="Select Branch..."
                                        value={selectedBranch.entry}
                                        options={branchOptions}
                                        onChange={(e) => handleAddNameChange(e, index)}
                                    />
                                </td>
                                <td>
                                    <div className="align-middle">
                                        <img
                                            src={trash}
                                            alt="delete"
                                            onClick={() =>
                                                handleRemoveBranch(index)
                                            }
                                            className="cursor-pointer"
                                        />
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        );
    }

    const handleAddNameChange = (e, id) => {
        const { name, value, label } = e;
        if (e.name === "branch_id") {
            var newBranchList = selectedBranches;
            var newEntries = newBranchList.map((branch, index) => {
                if (index === id) {
                    var info = {
                        name: name,
                        label: label,
                        value: value,
                    };
                    branch.entry = info;
                    branch.name = name;
                    branch.label = label;
                    branch.value = value;
                }
                return branch;
            });
            setSelectedBranches(newEntries);
        }
    };

    function handleRemoveBranch(id) {
        const rowId = id;
        const newItemList = [...selectedBranches];
        newItemList.splice(rowId, 1);
        setSelectedBranches(newItemList);
    }

    function handleAddBranch() {
        const newItem = {
            id: "",
            name: ""
        };
        setSelectedBranches((prevItems) => [...prevItems, newItem]);
    }

    const handleAddChange = (e) => {
        const { name, value } = e.target;
        setAddInventoryData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        if(add) {
            createInventory()
        } else if(edit) {
            updateInventory()
        }
    };

    //*****API CALLS*****
    async function fetchBranches() {

        if(type  === "mango") {
            const response = await searchBranch();

            var branches = response.data.data.sort((a, b) =>
                a.name > b.name ? 1 : b.name > a.name ? -1 : 0
            );

            var cleanedArray = branches.map((branch) => {
                var info = {};

                info.name = "branch_id";
                info.label = `${branch.name} Branch`;
                info.value = `${branch.id}`;

                return info;
            });
            setBranchOptions(cleanedArray);
        } else if(type  === "potato") {
            const response = await searchBranchPotato();

            var branches = response.data.data.sort((a, b) =>
                a.name > b.name ? 1 : b.name > a.name ? -1 : 0
            );

            var cleanedArray = branches.map((branch) => {
                var info = {};

                info.name = "branch_id";
                info.label = `${branch.name} Branch`;
                info.value = `${branch.id}`;

                return info;
            });
            setBranchOptions(cleanedArray);
        }
        
    }

    async function createInventory() {
        setIsClicked(true);
        if (type === "mango") {
            const response = await createInventoryGroup(addInventoryData, selectedBranches);
            if (response) {
                if (response?.data?.status === "success") {
                    toast.success("Successfully added inventory group!", {
                        style: toastStyle(),
                    });
                    navigate(-1)
                }
                if (response?.error) {
                    toast.error(response.error.data.messages.error, {
                        style: toastStyle(),
                    });
                    navigate(-1)

                }
            }
        } else if (type === "potato") {
            const response = await createInventoryGroupPotato(addInventoryData, selectedBranches);
            if (response) {
                if (response?.data?.status === "success") {
                    toast.success("Successfully added inventory group!", {
                        style: toastStyle(),
                    });
                    navigate(-1)

                }
                if (response?.error) {
                    toast.error(response.error.data.messages.error, {
                        style: toastStyle(),
                    });
                    navigate(-1)

                }
            }
        }
    }

        async function updateInventory() {
        setIsClicked(true);
        if (type === "mango") {
            const response = await updateInventoryGroup(addInventoryData, selectedBranches);
            if (response) {
                if (response?.data?.status === "success") {
                    toast.success("Successfully edited inventory group!", {
                        style: toastStyle(),
                    });
                    navigate(-1)
                }
                if (response?.error) {
                    toast.error(response.error.data.messages.error, {
                        style: toastStyle(),
                    });
                    navigate(-1)

                }
            }
        } else if (type === "potato") {
            const response = await updateInventoryGroupPotato(addInventoryData, selectedBranches);
            if (response) {
                if (response?.data?.status === "success") {
                    toast.success("Successfully edited inventory group!", {
                        style: toastStyle(),
                    });
                    navigate(-1)

                }
                if (response?.error) {
                    toast.error(response.error.data.messages.error, {
                        style: toastStyle(),
                    });
                    navigate(-1)

                }
            }
        }
    }

    async function fetchInventory() {

        //Mango
        if (type === "mango") {
            const response = await getInventoryGroup(id);
            if (response.data) {
                var result = response.data.data;
                var mangoBranches = result.map((branch) => {
                    return {
                        type: "mango",
                        id: branch.id,
                        name: branch.name,
                        details: branch.details,
                        no_of_branches: branch.inventory_group_details.length,
                        inventory_group_details: branch.inventory_group_details,
                    };
                });

                var details = mangoBranches[0].inventory_group_details.map((data) => {
                    var info = data;
                    info.name  = "branch";
                    info.label  = data.branch_name;
                    info.value  = data.branch_id;
                    info.entry = info;
                    return info;
                })
                setSelectedBranches(details);

                setAddInventoryData(mangoBranches[0]);
            } else if (response.error) {
                TokenExpiry(response);
            }
        }

        //Potato
        if (type === "potato") {
            const response2 = await getInventoryGroupPotato(id);

            if (response2.data) {
                var result = response2.data.data;
                var potatoBranches = result.map((branch) => {
                    return {
                        type: "mango",
                        id: branch.id,
                        name: branch.name,
                        details: branch.details,
                        no_of_branches: branch.inventory_group_details.length,
                        inventory_group_details: branch.inventory_group_details,
                    };
                });

                var details = potatoBranches[0].inventory_group_details.map((data) => {
                    var info = data;
                    info.name  = "branch";
                    info.label  = data.branch_name;
                    info.value  = data.branch_id;
                    info.entry = info;
                    return info;
                })
                setSelectedBranches(details);

                setAddInventoryData(potatoBranches[0]);
            } else if (response2.error) {
                TokenExpiry(response2);
            }
        }
    }

    //****** Useeffect *****/
    React.useEffect(() => {
        fetchBranches();
        if(edit) {
            fetchInventory();
        }
    }, []);

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
                    <h1 className="page-title mb-4"> Inventory Level</h1>
                </div>

                <div className="edit-form">
                    
                    <Row className="nc-modal-custom-row mt-0">
                        <Col>
                            NAME
                            <span className="required-icon">*</span>
                            <Form.Control
                                type="text"
                                name="name"
                                defaultValue={addInventoryData?.name}
                                className="nc-modal-custom-input-edit"
                                onChange={(e) => handleAddChange(e)}
                                required
                            />
                        </Col>
                    </Row>

                    <Row className="nc-modal-custom-row">
                        <Col>BRANCHES</Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <div className="edit-purchased-items">
                            {selectedBranches.length === 0 ? (
                                <span>No Branch Found!</span>
                            ) : (
                                renderTable() 
                            )}
                        </div>
                    </Row>
                    <Row className="pt-3 PO-add-item">
                        <Button type="button" onClick={() => handleAddBranch()}>
                            Add Branch
                        </Button>
                    </Row>
                
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
            
            
        </div>
    );

}


export default FormInventoryLevel;