import React, { useState } from "react";
import { Button, Col, Form, Row, Tab, Tabs, Table } from "react-bootstrap";
import toast from "react-hot-toast";
import { Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Delete from "../../Components/Modals/DeleteModal";
import Navbar from "../../Components/Navbar/Navbar";
import DatePicker from "react-datepicker";
import TableTemplate from "../../Components/TableTemplate/Table";
import { registerLocale, setDefaultLocale } from "react-datepicker";

import {
    dateFormat,
    formatDate,
    formatDateNoTime,
    formatDateSlash,
    getTodayDate,
    isAdmin,
    numberFormat,
    refreshPage,
    toastStyle,
    TokenExpiry,
} from "../../Helpers/Utils/Common";
import "./Manage.css";
import {
    createBuildItem,
    deleteBuildItem,
    getAllBuildItem,
    getBuildItem,
    searchBuildItem,
    updateBuildItem,
} from "../../Helpers/apiCalls/Manage/BuildItem";
import { getAllBranches } from "../../Helpers/apiCalls/branchApi";
import InputError from "../../Components/InputError/InputError";
import AddModal from "../../Components/Modals/AddModal";
import trash from "../../Assets/Images/trash.png";
import { getAllItems } from "../../Helpers/apiCalls/itemsApi";
import Select from "react-select";
import { getAllEmployees } from "../../Helpers/apiCalls/employeesApi";
import { validateBuildItem } from "../../Helpers/Validation/Manage/BuildItemValidation";
import EditModal from "../../Components/Modals/EditModal";
import ViewModal from "../../Components/Modals/ViewModal";
import Moment from "moment";
import { getAllBranchesPotato } from "../../Helpers/apiCalls/PotatoCorner/Purchases/purchaseOrderApi";
export default function BuildItem() {
    let navigate = useNavigate();
    const [isClicked, setIsClicked] = useState(false);
    /* delete modal handler */
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const handleShowDeleteModal = () => setShowDeleteModal(true);
    const handleCloseDeleteModal = () => refreshPage();
    const [inactive, setInactive] = useState(true);
    const [paymentList, setPaymentList] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [showLoader, setShowLoader] = useState(false);
    const [shopType, setShopType] = useState("");
    const [selectedPayment, setSelectedPayment] = useState("");
    const [filterDate, setFilterDate] = useState({
        to: getTodayDate(),
        from: getTodayDate(),
        supplier_id: "",
        payment_mode: "",
        type: "",
    });
    const [search, setSearch] = useState("");
    const [selectedRow, setSelectedRow] = useState({});
    const [build, setBuild] = useState({
        branch: "2", // default - commissary
        item: "",
        branchTo: "2",
        qty: "",
        unitId: "",
        production_date: "",
        expiration_date: "",
        batch: "",
        production_slip_no: "",
        yield: "",
    });
    const [branchInfo, setBranchInfo] = useState([]);
    const [itemInfo, setItemInfo] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [products, setProducts] = useState([
        { id: "", quantity: "1", unit: "", unitList: [] },
    ]);
    const [labor, setLabor] = useState([
        { employee_id: "", job_description: "", rate: "" },
    ]);
    const [totalLabor, setTotalLabor] = useState(0);
    const [qty, setQty] = useState("");
    const [branchFrom, setBranchFrom] = useState("2"); // building to commissary by default
    const [branchTo, setBranchTo] = useState("2|Commissary"); // items from commissary by default

    const date = new Date();
    date.setDate(date.getDate() - 7);
    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);

    //Error Handling
    const [isError, setIsError] = useState({
        branch_from: false,
        qty: false,
        ingredients: false,
    });

    //MODAL HANDLERS
    const [showAddBranchModal, setShowAddBranchModal] = useState(false);
    const handleShowAddBranchModal = () => {
        clearTables();
        setShowAddBranchModal(true);
        setBranchInfo(branches.filter((info) => info.id === "2"));
        setProducts([{ id: "", quantity: "1", unit: "", unitList: [] }]);
    };
    const handleCloseAddBranchModal = () => {
        setShowAddBranchModal(false);
    };

    // ADD
    const [showAddItemModal, setShowAddItemModal] = useState(false);
    const handleShowAddItemModal = () => {
        setBranchFrom("2");
        setShowAddItemModal(true);
    };
    const handleCloseAddItemModal = () => {
        clearTables();
        setShowAddItemModal(false);
    };

    //EDIT
    const [showEditItemModal, setShowEditItemModal] = useState(false);
    const handleShowEditItemModal = () => {
        setShowEditItemModal(true);
    };
    const handleCloseEditItemModal = () => setShowEditItemModal(false);

    //VIEW
    const [showViewItemModal, setShowViewItemModal] = useState(false);
    const handleShowViewItemModal = () => {
        setShowViewItemModal(true);
    };
    const handleCloseViewItemModal = () => setShowViewItemModal(false);

    function clearTables() {
        setQty("");
        // setBranchFrom("");
        setBuild([]);
        // setBranchInfo([]);
        setItemInfo([]);
        setProducts([]);
        setLabor([]);
    }

    async function save() {
        if (isClicked) {
            return;
        }
        if (validateBuildItem(qty, branchFrom, products, setIsError)) {
            setIsClicked(true);
            const response = await createBuildItem(
                build,
                branchFrom,
                branchInfo[0],
                itemInfo[0],
                products,
                qty,
                branchTo
            );
            if (response.data) {
                toast.success("Build Item Created Successfully!", {
                    style: toastStyle(),
                });
                handleCloseAddItemModal();
                setFilterConfig((prev) => {
                    return { ...prev, hasChanged: !filterConfig.hasChanged };
                });
            } else {
                setIsClicked(false);
                toast.error("Error Creating Build Item", {
                    style: toastStyle(),
                });
            }
            setIsClicked(false);
        }
    }

    async function update() {
        if (validateBuildItem(qty, branchFrom, products, setIsError)) {
            const response = await updateBuildItem(
                selectedRow.id,
                build,
                branchFrom,
                branchInfo[0],
                itemInfo[0],
                products,
                qty
            );
            if (response) {
                toast.success("Build item updated successfully!", {
                    style: toastStyle(),
                });
                handleCloseEditItemModal();
                setFilterConfig((prev) => {
                    return { ...prev, hasChanged: !filterConfig.hasChanged };
                });
            } else {
                toast.error("Error updating build item", {
                    style: toastStyle(),
                });
            }
        }
    }

    async function handleDeleteSP() {
        const response = await deleteBuildItem(selectedRow.id);
        if (response) {
            toast.success("Item Deleted Successfully!", {
                style: toastStyle(),
            });
            setTimeout(() => refreshPage(), 1000);
        } else {
            toast.error("Error Deleting Item", {
                style: toastStyle(),
            });
        }
    }

    //FETCH
    const [branches, setBranches] = useState([]);
    const [items, setItems] = useState([]);
    const [employees, setEmployees] = useState([]);

    async function fetchBranches() {
        setBranches([]);
        const response = await getAllBranches();

        setBranches([response.data.data[0], response.data.data[1]]);
    }

    async function fetchEmployees() {
        setEmployees([]);
        const response = await getAllEmployees();
        setEmployees(response.data.data);
    }

    async function fetchBuildItem() {
        const response = await getBuildItem(selectedRow.id);

        if (response.data) {
            let itemResult = response.data?.data[0]?.build_item_details.map(
                (a, index) => {
                    let itemList = items.filter(
                        (info) => info.id === a.item_id
                    );
                    return {
                        id: a.item_id,
                        item_name: a.item_name,
                        quantity: a.qty,
                        unit: a.breakdown_unit,
                        inventory_unit: a.inventory_unit,
                        unitList: { item_units: itemList[0]?.item_units },
                    };
                }
            );

            let branchInfo = branches.filter(
                (info) => info.id === response.data?.data[0]?.to_branch_id
            );
            let itemInfo = items.filter(
                (info) => info.id === response.data?.data[0]?.item_id
            );
            let prod_date =
                response.data?.data[0]?.production_date !== null
                    ? response.data?.data[0]?.production_date.split(" ")[0]
                    : response.data?.data[0]?.production_date;
            let exp_date =
                response.data?.data[0]?.expiration_date !== null
                    ? response.data?.data[0]?.expiration_date.split(" ")[0]
                    : response.data?.data[0]?.expiration_date;
            setBuild({
                total_qty: response.data?.data[0]?.total_qty,
                production_date: prod_date,
                expiration_date: exp_date,
                batch: response.data?.data[0]?.batch,
                production_slip_no: response.data?.data[0]?.production_slip_no,
            });
            setBranchInfo(branchInfo);
            setItemInfo(itemInfo);
            setProducts(itemResult);
            setQty(response.data?.data[0].qty);
            setBranchFrom(response.data?.data[0].from_branch_id);
        } else if (response.error) {
            setBuild({});
            setBranchInfo([]);
            setItemInfo([]);
            setProducts([]);
            setQty("");
            setBranchFrom("");
            TokenExpiry(response);
        }
    }

    async function fetchAllsBuildItems() {
        setShowLoader(true);
        const response = await getAllBuildItem();
        if (response?.data) {
            setShowLoader(false);
            if (response.data.data.status === "success") {
                let result = response.data.data.data.map((a) => {
                    let raw_materials = "";

                    a.build_item_details.map((data, index) => {
                        raw_materials +=
                            numberFormat(data.qty) +
                            " " +
                            data.breakdown_unit +
                            " - " +
                            data.item_name +
                            ",";
                    });

                    return {
                        id: a.id,
                        date_encoded: Moment(a.added_on).format("MM-DD-YYYY"),
                        build_date: Moment(a.production_date).format("MM-DD-YYYY"),
                        branch: a.to_branch_name,
                        built_item: `${numberFormat(a.qty)} - ${a.item_name}`,
                        raw_materials: raw_materials,
                    };
                });

                setPaymentList(result);
                setFilteredData(result);
            }
        }
    }
    const [totalBuiltItem, setTotalBuiltItem] = useState("");
    async function searchBuildItems(filterConfig) {
        setTotalBuiltItem(0);
        setBuildItemManager([]);
        setShowLoader(true);
        const response = await searchBuildItem(filterConfig);
        var material = []
        if (response.data) {
            if (response.data.status === 200) {
                let result = response.data.data.data.map((a) => {
                    let raw_materials = "";

                    a.build_item_details?.map((data) => {
                        raw_materials +=
                            numberFormat(data.qty) +
                            " " +
                            data.breakdown_unit +
                            " - " +
                            data.item_name + "," ;
                    });

                    return {
                        id: a.id,
                        date: Moment(a.added_on).format("MM-DD-YYYY"),
                        build_date: Moment(a.production_date).format("MM-DD-YYYY"),
                        branch: a.to_branch_name,
                        qty: numberFormat(a.qty),
                        build_item: a.item_name,
                        yield: a.yield ? numberFormat(a.yield) : "N/A",
                        raw_materials: raw_materials,
                    };
                });
                // var _totalBuiltItem = result
                //     .map((item) => parseFloat(item.qty))
                //     .reduce((a, b) => a + b, 0);
                var _totalBuiltItem = result.length;

                setTotalBuiltItem(_totalBuiltItem);
                setBuildItemManager(result);
                setMaterials(material)
            }
        } else if (response.error) {
            TokenExpiry(response);
        }
        setShowLoader(false);
    }

    const handleBuildInfoChange = (e) => {
        if (typeof e === "string") {
            setBuild((prevState) => ({
                ...prevState,
                ["item"]: e,
            }));
            setItemInfo(items.filter((info) => info.id === e));
        } else if (e.target.name === "branch") {
            const { name, value } = e.target;
            setBuild((prevState) => ({
                ...prevState,
                [name]: value,
            }));
            setBranchInfo(branches.filter((info) => info.id === value));
            fetchItems(value);
        } else {
            const { name, value } = e.target;
            setBuild((prevState) => ({
                ...prevState,
                [name]: value,
            }));
        }
    };

    function handleSelectChange(e, row) {
        setBuild([]);
        setSelectedRow(row);
        if (e.target.value === "edit-ps") {
            handleShowEditItemModal();
        } else if (e.target.value === "delete-ps") {
            handleShowDeleteModal();
        } else if (e.target.value === "view-ps") {
            window.open("/buildItem/" + row.id);
        }
    }

    function getUnits(id) {
        return items.filter((item) => item.id === id);
    }

    function handleProductChange(e, index) {
        const { name, value } = e.target;
        const list = [...products];
        list[index][name] = value;

        if (name === "id") {
            const unit = getUnits(value);
            list[index]["unitList"] = unit[0];
            list[index]["unit"] = unit[0].item_units[0].id;
        }
        setProducts(list);
    }

    function AddProductBtn() {
        const newProduct = { name: "", quantity: "1", unit: "" };
        setProducts((prevProduct) => [...prevProduct, newProduct]);
    }

    function handleRemoveProduct(id) {
        const rowId = id;
        const newProductList = [...products];
        newProductList.splice(rowId, 1);
        setProducts(newProductList);
    }

    function ActionBtn(row) {
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
                <option value="view-ps" className="color-options">
                    View
                </option>
                {isAdmin() && (
                    <option value="edit-ps" className="color-options">
                        Edit
                    </option>
                )}
                {isAdmin() && (
                    <option value="delete-ps" className="color-red">
                        Delete
                    </option>
                )}
            </Form.Select>
        );
    }

    /* FILTER CONFIGS */
    const today = Moment().format("MM/DD/YYYY");
    const [buildItemManager, setBuildItemManager] = useState([]);
    const [filterConfig, setFilterConfig] = useState({
        name: "",
        item_id: "",
        added_on_from: date,
        added_on_to: nextDay,
        totalBuiltItem: "",
        hasChanged: false,
    });
    function handleFilterChange(e) {
        const { name, value } = e.target;
        setFilterConfig((prev) => {
            return { ...prev, [name]: value };
        });
    }
    React.useEffect(() => {
        searchBuildItems(filterConfig);
    }, [filterConfig]);

    function renderTable(type) {
        return (
            <Table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Quantity</th>
                        <th>Unit</th>
                        {type !== "view" && <th>Action</th>}
                    </tr>
                </thead>
                <tbody>
                    {products.map((product, index) => {
                        return (
                            <tr>
                                <td>
                                    {type !== "view" && (
                                        <Form.Select
                                            name="id"
                                            id={product.id}
                                            value={product.id}
                                            onChange={(e) =>
                                                handleProductChange(e, index)
                                            }
                                            disabled={type === "view"}
                                        >
                                            <option value="">Select</option>
                                            {items.map((data) => {
                                                return (
                                                    <option value={data.id}>
                                                        {data.item_name}
                                                    </option>
                                                );
                                            })}
                                        </Form.Select>
                                    )}
                                    {type === "view" && (
                                        <Form.Control
                                            type="text"
                                            name="item_name"
                                            value={product.item_name}
                                            disabled
                                        />
                                    )}
                                </td>
                                <td>
                                    <Form.Control
                                        type="number"
                                        name="quantity"
                                        min="0"
                                        value={product.quantity}
                                        onChange={(e) =>
                                            handleProductChange(e, index)
                                        }
                                        disabled={type === "view"}
                                    />
                                </td>
                                <td>
                                    {type !== "view" && (
                                        <Form.Select
                                            name="unit"
                                            id={product.id}
                                            value={product.unit}
                                            className={
                                                type === "view"
                                                    ? "date-filter"
                                                    : ""
                                            }
                                            onChange={(e) =>
                                                handleProductChange(e, index)
                                            }
                                            disabled={type === "view"}
                                        >
                                            {product?.unitList?.item_units?.map(
                                                (data) => {
                                                    return (
                                                        <option
                                                            key={data.id}
                                                            selected={
                                                                data.inventory_unit ===
                                                                product.unit
                                                            }
                                                            value={data.id}
                                                        >
                                                            {
                                                                data.inventory_unit
                                                            }
                                                        </option>
                                                    );
                                                }
                                            )}
                                        </Form.Select>
                                    )}

                                    {type === "view" && (
                                        <Form.Control
                                            type="text"
                                            name="unit"
                                            value={product.unit}
                                            disabled
                                        />
                                    )}
                                </td>
                                {type !== "view" && (
                                    <td>
                                        <div className="align-middle">
                                            <img
                                                src={trash}
                                                alt="delete"
                                                onClick={() =>
                                                    handleRemoveProduct(index)
                                                }
                                                className="cursor-pointer"
                                            />
                                        </div>
                                    </td>
                                )}
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        );
    }

    const [itemValue, setItemValue] = useState({
        name: "item_id",
        label: "",
        value: "",
    });
    async function fetchItems() {
        setItems([]);
        const response = await getAllItems(branchFrom);
        let result = response.response.data.map((a) => {
            return {
                label: a.name,
                value: a.id,
                id: a.id,
                name: "item_id",
                item_name: a.name,
                detail: a.detail,
                type: a.type,
                current_qty: a.item_units[0]?.current_qty ?? 0,
                item_units: a.item_units,
            };
        });
        setItems([{name: "item_id", label: "All Items", value:""}, ...result]);
    }
    const handleSelectDropsearch = (e) => {
        console.log(e)
        if (e.name === "item_id") {
            setItemValue(e);
            setFilterConfig((prev) => {
                return {
                    ...prev,
                    "item_id": e.value,
                };
            });
        } else {
            setFilterConfig((prev) => {
                return {
                    ...prev,
                    [e.name]: e.value,
                };
            });
        }
        
    };

    function materialsList(row) {
        var split = row.raw_materials.split(",").slice(0, -1)
        
         return (
            <Row>{
                split.map((data) => {
                    return (
                        <>
                            <label>{data}</label><br/>
                        </>
                    );
                })}
            </Row>
        )
    }

    React.useEffect(() => {
        setBranchFrom("2");
        fetchItems();
        fetchEmployees();
        fetchBranches();
    }, []);

    React.useEffect(() => {
        var total = 0;
        labor.map((data) => {
            total += parseFloat(data.rate);
        });
        setTotalLabor(parseFloat(total));
    }, [labor]);

    React.useEffect(() => {
        fetchItems();
    }, [branchFrom]);

    React.useEffect(() => {
        fetchBuildItem();
    }, [selectedRow]);

    React.useEffect(() => {
        if (shopType !== "") {
            navigate("/paysuppliers/add/" + selectedPayment + "/" + shopType);
        }
    }, [shopType]);

    // calculate yield
    React.useEffect(() => {
        var buildQty = qty ? parseFloat(qty) : 0;
        products.map((product) => {
            if (product.id === "115") {
                var productQty = product.quantity
                    ? parseFloat(product.quantity)
                    : 0;
                var _yield =
                    buildQty && productQty
                        ? (buildQty * 800) / 1000 / productQty
                        : 0;
                setBuild((prevState) => ({
                    ...prevState,
                    yield: _yield.toFixed(2),
                }));
            }
        });
    }, [products, qty]);

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
                {/* headers */}
                <Row className="mb-4">
                    <Col xs={6}>
                        <h1 className="page-title"> BUILD ITEM </h1>
                    </Col>
                    <Col xs={6} className="d-flex justify-content-end">
                        <input
                            name="name"
                            type="text"
                            placeholder="Search built item name..."
                            className="search-bar"
                            onChange={handleFilterChange}
                        />
                        <button
                            className="add-btn"
                            onClick={() => handleShowAddBranchModal()}
                        >
                            Add
                        </button>
                    </Col>
                </Row>

                <div className="tab-content build-item-register">
                    <div className="my-2 ms-2 PO-filters PI-filters d-flex">
                        <span className="me-4 align-middle mt-2">
                            Filter By
                        </span>
                        <span className="me-3 align-middle mt-2">ITEM:</span>
                        <Select
                            className="dropsearch-filter px-0 py-0"
                            classNamePrefix="react-select"
                            placeholder="Select Item..."
                            styles={{
                                control: (baseStyles, state) => ({
                                ...baseStyles,
                                backgroundColor: state.isSelected ? 'white' : '#5ac8e1',
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
                            // value={itemValue}
                            options={items}
                            onChange={handleSelectDropsearch}
                        />
                        <span className="me-3 align-middle mt-2">
                            DATE FROM:
                        </span>
                        <DatePicker
                            className="builditem-date-btn me-3 form-control"
                            selected={filterConfig.added_on_from}
                            name="added_on_from"
                            onChange={(date) => {
                                setFilterConfig((prev) => {
                                    return {
                                        ...prev,
                                        added_on_from: date,
                                    };
                                });
                            }}
                            fixedHeight
                            showYearDropdown
                            dateFormatCalendar="MMMM"
                            yearDropdownItemNumber={20}
                            scrollableYearDropdown
                        />

                        <span className="me-3 align-middle mt-2">TO:</span>
                        <DatePicker
                            className="builditem-date-btn me-5 form-control"
                            selected={filterConfig.added_on_to}
                            name="added_on_to"
                            minDate={filterConfig.added_on_from}
                            onChange={(date) => {
                                setFilterConfig((prev) => {
                                    return {
                                        ...prev,
                                        added_on_to: date,
                                    };
                                });
                            }}
                            showYearDropdown
                            dateFormatCalendar="MMMM"
                            yearDropdownItemNumber={20}
                            scrollableYearDropdown
                        />
                        <div className="d-flex justify-content-end align-middle mt-2 ml-5">
                            <span>
                                Total built item:{" "}
                                <strong>{totalBuiltItem.toLocaleString()}</strong>
                            </span>
                        </div>
                    </div>
                    <div className="below">
                        {/* table */}
                        <TableTemplate
                            tableHeaders={[
                                "DATE ENCODED",
                                "BUILD DATE",
                                "BRANCH",
                                "QTY",
                                "BUILT ITEM",
                                "YIELD",
                                "RAW MATERIALS",
                                "ACTIONS",
                            ]}
                            headerSelector={[
                                "date",
                                "build_date",
                                "branch",
                                "qty",
                                "build_item",
                                "yield",
                            ]}
                            tableData={buildItemManager}
                            ActionBtn={(row) => ActionBtn(row)}
                            showLoader={showLoader}
                            materialsList={(row) => materialsList(row)}
                        />
                    </div>
                    <div className="mb-2" />
                </div>
            </div>

            {/* modals */}
            <Delete
                show={showDeleteModal}
                onHide={handleCloseDeleteModal}
                text="build item"
                onDelete={handleDeleteSP}
            />
            <Modal
                show={showAddBranchModal}
                onHide={handleCloseAddBranchModal}
                size="lg"
                centered
            >
                <Modal.Header closeButton>
                    <p className="custom-modal-body-title"> Build Item </p>
                </Modal.Header>
                <Modal.Body>
                    <div className="text">
                        Branch
                        <Form.Select
                            name="branch"
                            className="date-filter me-3"
                            onChange={(e) => setBranchTo(e.target.value)}
                        >
                            <option value="2" selected>
                                Commissary
                            </option>
                            {branches
                                .filter(
                                    (info) =>
                                        info.name === "Warehouse"
                                )
                                .map((data) => {
                                    return (
                                        <option
                                            value={`${data.id}|${data.name}`}
                                        >
                                            {data.name}
                                        </option>
                                    );
                                })}
                        </Form.Select>
                    </div>
                    <div className="text mt-3">
                        Item to Build
                        <Select
                            className="react-select-container"
                            classNamePrefix="react-select"
                            placeholder="Select item..."
                            options={items}
                            onChange={(e) => handleBuildInfoChange(e.value)}
                        />
                        <p className="add-supplier-prompt mb-0">
                            ITEM NOT FOUND?{" "}
                            <a
                                className="add-supplier-label"
                                onClick={() => navigate("/items")}
                            >
                                Click to add item
                            </a>
                        </p>
                    </div>
                    <div className="col-sm-12 mt-3 d-flex justify-content-end">
                        <button
                            className="button-primary  me-3"
                            onClick={() => {
                                handleShowAddItemModal();
                                handleCloseAddBranchModal();
                            }}
                        >
                            Proceed
                        </button>
                    </div>
                </Modal.Body>
            </Modal>
            <AddModal
                title={`BUILD ITEM`}
                type="product"
                show={showAddItemModal}
                onHide={handleCloseAddItemModal}
                onSave={() => save()}
                isClicked={isClicked}
            >
                <div className="mt-3 ">
                    <Row className="nc-modal-custom-row mt-0">
                        <Col sm={4}>Branch</Col>
                        <Col>
                            <div className="plain-text">
                                {branchTo.split("|")[1]}
                            </div>
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row mt-0">
                        <Col sm={4}>Item description</Col>
                        <Col>
                            <div className="plain-text">
                                {itemInfo[0]?.label}
                            </div>
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row mt-0">
                        <Col sm={4}>Current Level</Col>
                        <Col>
                            <div className="plain-text">
                                {itemInfo[0]?.current_qty}
                            </div>
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row mt-0">
                        <Col sm={4}>Qty</Col>
                        <Col sm={4}>
                            <Form.Control
                                type="number"
                                name="qty"
                                value={qty}
                                className="nc-modal-custom-input"
                                onChange={(e) => setQty(e.target.value)}
                                required
                            />
                            <InputError
                                isValid={isError.qty}
                                message={"Quantity is required"}
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col sm={4}>Production Date</Col>
                        <Col sm={4}>
                            <Form.Control
                                type="date"
                                name="production_date"
                                value={build.production_date}
                                className="nc-modal-custom-input"
                                onChange={(e) => handleBuildInfoChange(e)}
                                required
                            />
                            <InputError
                                isValid={isError.production_date}
                                message={"Production date is required"}
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col sm={4}>Expiration Date</Col>
                        <Col sm={4}>
                            <Form.Control
                                type="date"
                                name="expiration_date"
                                value={build.expiration_date}
                                className="nc-modal-custom-input"
                                onChange={(e) => handleBuildInfoChange(e)}
                                required
                            />
                            <InputError
                                isValid={isError.expiration_date}
                                message={"Expiration date is required"}
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col sm={4}>Batch</Col>
                        <Col sm={4}>
                            <Form.Control
                                type="text"
                                name="batch"
                                value={build.batch}
                                className="nc-modal-custom-input"
                                onChange={(e) => handleBuildInfoChange(e)}
                                required
                            />
                            <InputError
                                isValid={isError.batch}
                                message={"Batch is required"}
                            />
                        </Col>
                    </Row>

                    <Row className="nc-modal-custom-row">
                        <Col sm={4}>Yield</Col>
                        <Col sm={4}>
                            <Form.Control
                                type="text"
                                name="yield"
                                value={build.yield}
                                className="nc-modal-custom-input"
                                disabled
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col sm={4}>Production Slip No.</Col>
                        <Col sm={4}>
                            <Form.Control
                                type="text"
                                name="production_slip_no"
                                value={build.production_slip_no}
                                className="nc-modal-custom-input"
                                onChange={(e) => handleBuildInfoChange(e)}
                                required
                            />
                            <InputError
                                isValid={isError.production_slip_no}
                                message={"Production slip number is required"}
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row ">
                        <Col sm={4}>Ingredients From</Col>
                        <Col sm={4}>
                            <Form.Select
                                name="branch_from"
                                className="date-filter me-3"
                                value={branchFrom}
                                onChange={(e) => setBranchFrom(e.target.value)}
                            >
                                {branches.map((data) => {
                                    return (
                                        <option
                                            selected={branchFrom}
                                            value={data.id}
                                        >
                                            {data.name}
                                        </option>
                                    );
                                })}
                            </Form.Select>
                            <InputError
                                isValid={isError.branch_from}
                                message={"Ingredients from value is required"}
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col>INGREDIENTS</Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <div className="edit-purchased-items">
                            {products.length === 0 ? (
                                <span>No Ingredients for Products Found!</span>
                            ) : (
                                renderTable()
                            )}
                            <InputError
                                isValid={isError.ingredients}
                                message={"At least 1 ingredient is required"}
                            />
                        </div>
                    </Row>
                    <Row className="pt-3 PO-add-item">
                        <Button type="button" onClick={() => AddProductBtn()}>
                            Add Ingredient
                        </Button>
                    </Row>
                </div>
            </AddModal>
            <EditModal
                title={`BUILD ITEM`}
                type="product"
                show={showEditItemModal}
                onHide={handleCloseEditItemModal}
                onSave={() => update()}
            >
                <div className="mt-3 ">
                    <Row className="nc-modal-custom-row mt-0">
                        <Col sm={4}>Branch</Col>
                        <Col>
                            <div className="plain-text">
                                {branchInfo[0]?.name}
                            </div>
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row mt-0">
                        <Col sm={4}>Item description</Col>
                        <Col>
                            <div className="plain-text">
                                {itemInfo[0]?.item_name}
                            </div>
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row mt-0">
                        <Col sm={4}>Current Level</Col>
                        <Col>
                            <div className="plain-text">
                                {itemInfo[0]?.currentlevel}
                            </div>
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row mt-0">
                        <Col sm={4}>Qty</Col>
                        <Col sm={4}>
                            <Form.Control
                                type="number"
                                name="qty"
                                value={qty}
                                className="nc-modal-custom-input"
                                onChange={(e) => setQty(e.target.value)}
                                required
                            />
                            <InputError
                                isValid={isError.qty}
                                message={"Quantity is required"}
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col sm={4}>Production Date</Col>
                        <Col sm={4}>
                            <Form.Control
                                type="date"
                                name="production_date"
                                defaultValue={build.production_date}
                                className="nc-modal-custom-input"
                                onChange={(e) => handleBuildInfoChange(e)}
                                required
                            />
                            <InputError
                                isValid={isError.production_date}
                                message={"Production date is required"}
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col sm={4}>Expiration Date</Col>
                        <Col sm={4}>
                            <Form.Control
                                type="date"
                                name="expiration_date"
                                defaultValue={build.expiration_date}
                                className="nc-modal-custom-input"
                                onChange={(e) => handleBuildInfoChange(e)}
                                required
                            />
                            <InputError
                                isValid={isError.expiration_date}
                                message={"Expiration date is required"}
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col sm={4}>Batch</Col>
                        <Col sm={4}>
                            <Form.Control
                                type="text"
                                name="batch"
                                defaultValue={build.batch}
                                className="nc-modal-custom-input"
                                onChange={(e) => handleBuildInfoChange(e)}
                                required
                            />
                            <InputError
                                isValid={isError.batch}
                                message={"Batch is required"}
                            />
                        </Col>
                    </Row>
                    {itemInfo[0]?.id === "112" && (
                        <Row className="nc-modal-custom-row">
                            <Col sm={4}>Yield</Col>
                            <Col sm={4}>
                                <Form.Control
                                    type="text"
                                    name="yield"
                                    defaultValue={build.yield}
                                    className="nc-modal-custom-input"
                                    onChange={(e) => handleBuildInfoChange(e)}
                                    required
                                />
                                <InputError
                                    isValid={isError.batch}
                                    message={"Yield is required"}
                                />
                            </Col>
                        </Row>
                    )}
                    <Row className="nc-modal-custom-row">
                        <Col sm={4}>Production Slip No.</Col>
                        <Col sm={4}>
                            <Form.Control
                                type="text"
                                name="production_slip_no"
                                defaultValue={build.production_slip_no}
                                className="nc-modal-custom-input"
                                onChange={(e) => handleBuildInfoChange(e)}
                                required
                            />
                            <InputError
                                isValid={isError.production_slip_no}
                                message={"Production slip number is required"}
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row mt-2">
                        <Col sm={4}>Ingredients From</Col>
                        <Col sm={4}>
                            <Form.Select
                                name="branch_from"
                                className="date-filter me-3"
                                value={branchFrom}
                                onChange={(e) => setBranchFrom(e.target.value)}
                            >
                                <option value="" selected disabled>
                                    Select...
                                </option>
                                {branches.map((data) => {
                                    return (
                                        <option value={data.id}>
                                            {data.name}
                                        </option>
                                    );
                                })}
                            </Form.Select>
                            <InputError
                                isValid={isError.branch_from}
                                message={"Ingredients from value is required"}
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col>INGREDIENTS</Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <div className="edit-purchased-items">
                            {products.length === 0 ? (
                                <span>No Ingredients for Products Found!</span>
                            ) : (
                                renderTable()
                            )}
                            <InputError
                                isValid={isError.ingredients}
                                message={"At least 1 ingredient is required"}
                            />
                        </div>
                    </Row>
                    <Row className="pt-3 PO-add-item">
                        <Button type="button" onClick={() => AddProductBtn()}>
                            Add Ingredient
                        </Button>
                    </Row>
                </div>
            </EditModal>
            <ViewModal
                title={`BUILD ITEM`}
                type="product"
                show={showViewItemModal}
                onHide={handleCloseViewItemModal}
            >
                <div className="mt-3 edit-form">
                    <Row className="nc-modal-custom-row mt-0">
                        <Col sm={4}>Branch</Col>
                        <Col>
                            <div className="plain-text">
                                {branchInfo[0]?.name}
                            </div>
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row mt-0">
                        <Col sm={4}>Item description</Col>
                        <Col>
                            <div className="plain-text">
                                {itemInfo[0]?.item_name}
                            </div>
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row mt-0">
                        <Col sm={4}>Current Level</Col>
                        <Col>
                            <div className="plain-text">{build?.total_qty}</div>
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row mt-0">
                        <Col sm={4}>Qty</Col>
                        <Col sm={4}>
                            <Form.Control
                                type="number"
                                name="qty"
                                value={qty}
                                className="nc-modal-custom-input"
                                onChange={(e) => setQty(e.target.value)}
                                disabled
                            />
                            <InputError
                                isValid={isError.qty}
                                message={"Quantity is required"}
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col sm={4}>Production Date</Col>
                        <Col sm={4}>
                            <Form.Control
                                type="date"
                                name="production_date"
                                value={build.production_date}
                                className="nc-modal-custom-input"
                                disabled
                            />
                            <InputError
                                isValid={isError.production_date}
                                message={"Production date is required"}
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col sm={4}>Expiration Date</Col>
                        <Col sm={4}>
                            <Form.Control
                                type="date"
                                name="expiration_date"
                                value={build.expiration_date}
                                className="nc-modal-custom-input"
                                disabled
                            />
                            <InputError
                                isValid={isError.expiration_date}
                                message={"Expiration date is required"}
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col sm={4}>Batch</Col>
                        <Col sm={4}>
                            <Form.Control
                                type="text"
                                name="batch"
                                value={build.batch}
                                className="nc-modal-custom-input"
                                disabled
                            />
                            <InputError
                                isValid={isError.batch}
                                message={"Batch is required"}
                            />
                        </Col>
                    </Row>
                    {itemInfo[0]?.id === "112" && (
                        <Row className="nc-modal-custom-row">
                            <Col sm={4}>Yield</Col>
                            <Col sm={4}>
                                <Form.Control
                                    type="text"
                                    name="yield"
                                    value={build.yield}
                                    className="nc-modal-custom-input"
                                    disabled
                                />
                                <InputError
                                    isValid={isError.batch}
                                    message={"Yield is required"}
                                />
                            </Col>
                        </Row>
                    )}
                    <Row className="nc-modal-custom-row">
                        <Col sm={4}>Production Slip No.</Col>
                        <Col sm={4}>
                            <Form.Control
                                type="text"
                                name="production_slip_no"
                                value={build.production_slip_no}
                                className="nc-modal-custom-input"
                                disabled
                            />
                            <InputError
                                isValid={isError.production_slip_no}
                                message={"Production slip number is required"}
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row mt-2">
                        <Col sm={4}>Ingredients From</Col>
                        <Col sm={4}>
                            <select
                                name="branch_from"
                                className="date-filter me-3"
                                value={branchFrom}
                                onChange={(e) => setBranchFrom(e.target.value)}
                                readonly
                                disabled
                            >
                                {branches.map((data) => {
                                    return (
                                        <option value={data.id}>
                                            {data.name}
                                        </option>
                                    );
                                })}
                            </select>
                            <InputError
                                isValid={isError.branch_from}
                                message={"Ingredients from value is required"}
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col>INGREDIENTS</Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <div className="edit-purchased-items">
                            {products.length === 0 ? (
                                <span>No Ingredients for Products Found!</span>
                            ) : (
                                renderTable("view")
                            )}
                            <InputError
                                isValid={isError.ingredients}
                                message={"At least 1 ingredient is required"}
                            />
                        </div>
                    </Row>
                    <Row className="pt-3 PO-add-item">
                    </Row>
                </div>
            </ViewModal>
        </div>
    );
}
