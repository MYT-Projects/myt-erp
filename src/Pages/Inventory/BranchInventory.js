import React, { useState, useEffect } from "react";
import { Form, Col, Tabs, Tab } from "react-bootstrap";
import Select from "react-select";
//components
import Navbar from "../../Components/Navbar/Navbar";
import Table from "../../Components/TableTemplate/Table";

//css
import "./Inventory.css";
import "../../Components/Navbar/Navbar.css";
import { getAllItemList, searchAllItemList } from "../../Helpers/apiCalls/Inventory/ItemListApi";
import { getAllItemListPotato, searchAllItemListPotato } from "../../Helpers/apiCalls/PotatoCorner/Inventory/ItemListApi";
import { getAllBranches } from "../../Helpers/apiCalls/Purchases/purchaseOrderApi";
import { getAllBranchesPotato } from "../../Helpers/apiCalls/PotatoCorner/Manage/Branches";
import { useNavigate } from "react-router-dom";
import { isAdmin, numberFormat } from "../../Helpers/Utils/Common";

export default function BranchInventory() {
    const navigate = useNavigate();
    const [inactive, setInactive] = useState(false);
    const [showLoader, setShowLoader] = useState(false);
    const [inventoryList, setInventoryList] = useState([]);
    const [inventoryListAll, setInventoryListAll] = useState([]);
    const [branches, setBranches] = useState([]);
    const [name, setName] = useState("");
    const [filterConfig, setFilterConfig] = useState({})

    useEffect(() => {
        fetchBranches();
    }, []);


    const [branchOptions, setBranchOptions] = useState([]);

    useEffect(()=>{
        // console.log(franchisees)
        // console.log(branches);
        // return;
        // var branchName = "";
        var currentBranch = {}
        setBranchOptions(branches.filter((_branch)=>{return _branch.id !== "1" && _branch.id !== "2"}).map((_branch)=>{
            var retval = {label: _branch.name, value:_branch.type + "-" + _branch.id}
            return retval;
        }))
    },[branches])

    function handleBranchChange(e){
        // console.log(e)
        // setBranch(e);
        const toFilter = {target: {name: "id", value: e.value}};
        handleFilters(toFilter);
    }




    React.useEffect(() => {
        fetchFromBranch();
    }, [filterConfig]);

    // API INTEGRATIONS

    async function fetchBranches() {
        const response = await getAllBranches();
        const response2 = await getAllBranchesPotato();
        setBranches([]);
        setShowLoader(true);

        if (response.data) {
            var data = response.data.data;
            data.map((d) => {
                if(d.is_franchise === "0") {
                    var info = d;
                    info.type = "mango";
                    setBranches((prev) => [...prev, info]);
                }
            });
        }
        if (response2.data) {
            var data = response2.data.data.data;
            data.map((d) => {
                if(d.is_franchise === "0") {
                    var info = d;
                    info.type = "potato";
                    setBranches((prev) => [...prev, info]);
                }
            });
        }

        setShowLoader(false);
    }

    async function fetchFromBranch() {
        setShowLoader(true);
        setInventoryList([])
        if (filterConfig.id.split("-")[0] === "mango") {
            const response = await searchAllItemList(filterConfig);
            if (response.data) {
                var data = response.data.data;
                data.map((d) => {
                    var classificationSplit = d.item_type.split("_")
                    var info = d;
                    info.type = "mango_magic";
                    info.min = d.min ? numberFormat(d.min) : "";
                    info.max = d.max ? numberFormat(d.max) : "";
                    info.acceptable_variance = d.acceptable_variance ? numberFormat(d.acceptable_variance) : "";
                    info.current_qty = numberFormat(d.current_qty);
                    info.breakdown_value = numberFormat(d.breakdown_value);
                    info.item_type = classificationSplit.length < 2 ? d.item_type : classificationSplit[0] + " " + classificationSplit[1]
                    setInventoryList((prev) => [...prev, info]);
                });
            } else {
                setInventoryList([]);
            }
        } else if (filterConfig.id.split("-")[0] === "potato") {
            const response = await searchAllItemListPotato(filterConfig);
            if (response.data) {
                var data = response.data.data;
                data.map((d) => {
                    var classificationSplit = d.item_type.split("_")
                    var info = d;
                    info.type = "potato_corner";
                    info.min = d.min ? numberFormat(d.min) : "";
                    info.max = d.max ? numberFormat(d.max) : "";
                    info.acceptable_variance = d.acceptable_variance ? numberFormat(d.acceptable_variance) : "";
                    info.current_qty = numberFormat(d.current_qty);
                    info.breakdown_value = numberFormat(d.breakdown_value);
                    info.item_type = classificationSplit.length < 2 ? d.item_type : classificationSplit[0] + " " + classificationSplit[1]
                    setInventoryList((prev) => [...prev, info]);
                });
            } else {
                setInventoryList([]);
            }
        }
        setShowLoader(false);
    }

    // SIDE BUTTONS
    function AdjustBtn(row) {
        return (
            <button
                name="action"
                className="btn btn-sm view-btn-table"
                id={`${row.id}|${row.type}`}
                onClick={handleSelectChange}
                value="adjust"
            >
                Adjust
            </button>
        );
    }

    function ActionBtn(row) {
        return (
            <Form.Select
                name="action"
                className="PO-select-action"
                id={`${row.id}|${row.branch_id}|${row.item_id}|${row.item_unit_id}|${row.inventory_unit_name}|${row.type}`}
                onChange={handleSelectChange}
            >
                <option value="" selected hidden>
                    Select
                </option>
                <option value="history" className="color-options">
                    History
                </option>
                <option value="adjust" className="color-options">
                    Adjustment
                </option>
                {isAdmin && (
                    <option value="delete" className="color-red">
                        Delete
                    </option>
                )}
            </Form.Select>
        );
    }

    //FILTERS
    const handleFilters = (e) => {
        console.log(e);
        const { name, value } = e.target;
        if(name === "id") {
            setFilterConfig((prev) => {
                return { ...prev, "id": value };
            });
        } else {
            setFilterConfig((prev) => {
                return { ...prev, [name]: value };
            });
        }
        
    };

    // HANDLERS
    const handleSelectChange = (e) => {
        const { value, id } = e.target;
        var itemSelected = id.split("|");
        var item_id = itemSelected[0];
        var branchID = itemSelected[1];
        var itemID = itemSelected[2];
        var itemUnitID = itemSelected[3];
        var itemUnit = itemSelected[4];
        var api = itemSelected[5];

        var endpoint = `${branchID}/${itemID}/${itemUnitID}/${itemUnit}-${api}`;
        if (value === "history") {navigate("/itemlists/history/" + endpoint)};
        if (value === "adjust"){
            var api = id.split("|")[1];
            navigate("/itemlists/branch-adjustment/" + item_id + "/" + api)};
    };

    return (
        <div>
            <div className="page">
                <Navbar
                    onCollapse={(inactive) => {
                        setInactive(inactive);
                    }}
                    active={"INVENTORY"} 
                />
            </div>
            <div
                className={`manager-container ${
                    inactive ? "inactive" : "active"
                }`}
            >
                <div className="row">
                    <div className="col-sm-6">
                        <h1 className="page-title"> BRANCH INVENTORY </h1>
                    </div>
                    {/* input search button */}
                    <div className="col-sm-6 d-flex justify-content-end">
                        <input
                            type="text"
                            name="name"
                            className="search-bar"
                            onKeyPress={(e) =>
                                e.key === ("Enter" || "NumpadEnter") &&
                                handleFilters(e)
                            }
                            placeholder="Search item name then press enter"
                        ></input>
                    </div>{" "}
                </div>{" "}
                <div className="row mb-4 my-2 PO-filters d-flex filter">
                    <Col xs={20}>
                    <Select
                            className="dropsearch-filter px-0 py-0 me-2"
                            classNamePrefix="react-select"
                            placeholder="Select Branch"
                            // value={branch}
                            options={branchOptions}
                            onChange={handleBranchChange}
                        />
                        {/* <Form.Select
                            name="id"
                            className="date-filter warehouse me-3"
                            onChange={handleFilters}
                        >
                            <option value="all">Select Branch</option>
                            {branches.map((data) => {
                                if (data.id !== "1")
                                    if (data.id !== "2") {
                                        return (
                                            <option
                                                value={
                                                    data.type + "-" + data.id
                                                }
                                            >
                                                {data.name}
                                            </option>
                                        );
                                    }
                            })}
                        </Form.Select> */}
                    </Col>
                </div>
                {/* for tables */}
                <Tabs
                    defaultActiveKey="all"
                    id="PO-tabs"
                    className="manager-tabs"
                >
                    <Tab eventKey="all" title="All">
                        <div className="col my-2 px-4 PO-filters d-flex">
                            <span className="me-4 align-middle mt-2 font-medium">
                                FILTER BY:
                            </span>
                            <Form.Select
                                name="item_type"
                                className="date-filter me-3"
                                onChange={handleFilters}
                            >
                                <option value="" hidden selected>
                                    Classification
                                </option>
                                <option value="all">All</option>
                                <option value="ingredient">Ingredient</option>
                                <option value="supplies">Supplies</option>
                                <option value="cleaning_supplies">
                                    Cleaning Supplies
                                </option>
                                <option value="office_supplies">
                                    Office Supplies
                                </option>
                                <option value="equipment">Equipment</option>
                                <option value="uniform">Uniform</option>
                                <option value="beverage">Beverage</option>
                                <option value="finished_product">
                                    Finished Product
                                </option>
                            </Form.Select>
                        </div>
                        <Table
                            tableHeaders={[
                                " ",
                                "Item",
                                "Classification",
                                "CUR QTY",
                                "INV UNIT",
                                "BRKDN VALUE",
                                "BRKDN UNIT",
                                "MIN",
                                "MAX",
                                "ACCEPTABLE VARIANCE",
                                "ACTIONS",
                            ]}
                            headerSelector={[
                                "",
                                "item_name",
                                "item_type",
                                "current_qty",
                                "inventory_unit_name",
                                "breakdown_value",
                                "breakdown_unit_name",
                                "min",
                                "max",
                                "acceptable_variance",
                            ]}
                            tableData={inventoryList}
                            showLoader={showLoader}
                            PendingBtn={(row) => AdjustBtn(row)}
                            ActionBtn={(row) => ActionBtn(row)}
                        />
                    </Tab>
                </Tabs>
                <div className="mb-2" />
            </div>
        </div>
    );
}
