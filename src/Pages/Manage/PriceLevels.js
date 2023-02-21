import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Col,
    Container,
    Form,
    Row,
    Table,
    Button,
    DropdownButton,
    ButtonGroup,
    Dropdown,
    Tabs,
    Tab,
} from "react-bootstrap";
import { isAdmin, refreshPage, toastStyle } from "../../Helpers/Utils/Common";
import toast, { Toaster } from "react-hot-toast";

//components
import TableTemplate from "../../Pages/Manage/Components/DataTable";
import Navbar from "../../Components/Navbar/Navbar";
import DeleteModal from "../../Components/Modals/DeleteModal";
import AddModal from "../../Components/Modals/AddModal";
import EditModal from "../../Components/Modals/EditModal";
import ViewModal from "../../Components/Modals/ViewModal";

//css
import "./Manage.css";
import "../../Components/Navbar/Navbar.css";
import trash from "../../Assets/Images/trash.png";

import { productsMockData } from "../../Helpers/mockData/mockData";
import {
    deletePriceLevel,
    getAllPriceLevels,
    searchPriceLevel,
} from "../../Helpers/apiCalls/Manage/PriceLevels";
import {
    deletePriceLevelPotato,
    getAllPriceLevelsPotato,
    searchPriceLevelPotato,
} from "../../Helpers/apiCalls/PotatoCorner/Manage/PriceLevels";

export default function PriceLevels() {
    let navigate = useNavigate();
    const [inactive, setInactive] = useState(false);
    const [option, setOption] = useState("Select");
    const [isClicked, setIsClicked] = useState(false);
    const [showLoader, setShowLoader] = useState(false);

    const handleTabSelect = (tabKey) => {
        setFilterConfig((prev) => {
            return { ...prev, tab: tabKey };
        });
    };

    const [filterConfig, setFilterConfig] = useState({
        tab:"all",
    });

    const isInitialMount = useRef(true);
    const filterConfigKey = 'manage-priceLevels-filterConfig';
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
    const [showViewPriceModal, setShowViewPriceModal] = useState(false);
    const handleShowViewPriceModal = () => setShowViewPriceModal(true);
    const handleCloseViewPriceModal = () => setShowViewPriceModal(false);

    // EDIT
    const [showEditPriceModal, setShowEditPriceModal] = useState(false);
    const handleShowEditPriceModal = () => setShowEditPriceModal(true);
    const handleCloseEditPriceModal = () => setShowEditPriceModal(false);

    const [addTo, setAddTo] = useState("");
    const handleAddSelect = (e) => {
        setAddTo(e);
    };

    // MODAL TABLE

    const [products, setProducts] = useState([
        { name: "", quantity: "", unit: "" },
    ]);

    function handleRemoveProduct(id) {
        const rowId = id;
        const newProductList = [...products];
        newProductList.splice(rowId, 1);
        setProducts(newProductList);
    }

    function AddProductBtn() {
        const newProduct = { name: "", quantity: "", unit: "" };
        setProducts((prevProduct) => [...prevProduct, newProduct]);
    }

    function EditProductBtn() {
        const newProduct = { name: "", quantity: "", unit: "" };
        setProducts((prevProduct) => [...prevProduct, newProduct]);
    }

    function handleProductChange(e, id) {
        const { name, value } = e.target;
        products.map((product, index) => {
            if (index === id) {
                product[name] = value;
            }
        });
    }

    function renderTable() {
        return (
            <Table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Quantity</th>
                        <th>Unit</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product, index) => {
                        return (
                            <tr>
                                <td>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        defaultValue={product.name}
                                        onChange={(e) =>
                                            handleProductChange(e, index)
                                        }
                                    />
                                </td>
                                <td>
                                    <Form.Control
                                        type="text"
                                        name="quantity"
                                        defaultValue={product.quantity}
                                        onChange={(e) =>
                                            handleProductChange(e, index)
                                        }
                                    />
                                </td>
                                <td>
                                    <Form.Control
                                        type="text"
                                        name="unit"
                                        defaultValue={product.unit}
                                        onChange={(e) =>
                                            handleProductChange(e, index)
                                        }
                                    />
                                </td>
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
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        );
    }

    function viewTable() {
        return (
            <Table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Quantity</th>
                        <th>Unit</th>
                    </tr>
                </thead>
                <tbody className="text-transform-none">
                    {/* return ( */}
                    <tr>
                        <td>
                            <span>Mango</span>
                        </td>
                        <td>
                            <span>2</span>
                        </td>
                        <td className="row align-contents">
                            <span> pcs</span>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <span>Condensed Milk</span>
                        </td>
                        <td>
                            <span>1/2</span>
                        </td>
                        <td className="row align-contents">
                            <span> can</span>
                        </td>
                    </tr>
                    {/* ) */}
                </tbody>
            </Table>
        );
    }
    //API
    const [priceLevelsData, setPriceLevelsData] = useState([]);
    const [priceLevelsMango, setPriceLevelsMango] = useState([]);
    const [priceLevelsPotato, setPriceLevelsPotato] = useState([]);
    const [selectedRow, setSelectedRow] = useState({});

    async function fetchAllPriceLevels() {
        setShowLoader(true);
        setPriceLevelsData([]);
        setPriceLevelsMango([]);
        setPriceLevelsPotato([]);
            //MANGO
        const response = await getAllPriceLevels();
        var result1 = response.data.data.data;
        if (response.data.data) {
            response.data.data.data.map((data) => {
                data.type = "mango";
            });
            setPriceLevelsMango(response.data.data.data);
            setPriceLevelsData(result1);
        }
        //Potato
        const response2 = await getAllPriceLevelsPotato();
        var result2 = response2.data.data.data;
        if (response2.data.data) {
            response2.data.data.data.map((data) => {
                data.type = "potato";
            });
            setPriceLevelsData(result2.concat(result1));
            setPriceLevelsPotato(response2.data.data.data);
        }
        setShowLoader(false);
    }

    async function search(e) {
        setShowLoader(true);
        setPriceLevelsMango([]);
        setPriceLevelsPotato([]);
        setPriceLevelsData([]);
        //MANGO
        const response = await searchPriceLevel(e.target.value);
        if (response.data.data) {
            var result1 = response.data.data.data;
            response.data.data.data.map((data) => {
                data.type = "mango";
            });
            setPriceLevelsMango(response.data.data.data);
            setPriceLevelsData(result1);
        }
        //Potato
        const response2 = await searchPriceLevelPotato(e.target.value);
        var result = response2.data.data.data;
        setPriceLevelsData(result.concat(response.data.data.data));
        if (response2.data.data) {
            var result2 = response2.data.data.data;
            response2.data.data.data.map((data) => {
                data.type = "potato";
            });
            setPriceLevelsPotato(response2.data.data.data);
            setPriceLevelsData(result2.concat(result1));
        }
        setShowLoader(false);
    }

    async function del() {
        if (selectedRow.type === "mango") {
            const response = await deletePriceLevel(selectedRow.id);
            if (response.data) {
                toast.success("Successfully deleted price level!", {
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
            const response = await deletePriceLevelPotato(selectedRow.id);
            if (response.data) {
                toast.success("Successfully deleted price level!", {
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

    //DROPDOWN
    function handleSelectChange(e, row) {
        setSelectedRow(row);
        if (e.target.value === "delete-product") {
            handleShowDeleteModal();
        } else if (e.target.value === "edit-product") {
            return navigate(`/pricelevels/edit/${row.id}/${row.type}`);
        } else if (e.target.value === "view-product") {
            return navigate(`/pricelevels/view/${row.id}/${row.type}`);
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
                <option value="view-product" className="color-options">
                    View
                </option>
                {isAdmin && (
                    <option value="edit-product" className="color-options">
                        Edit
                    </option>
                )}
                {isAdmin && (
                    <option value="delete-product" className="color-red">
                        Delete
                    </option>
                )}
            </Form.Select>
        );
    }

    //onEdit
    function handleOnEdit() {
        handleCloseViewPriceModal();
        handleShowEditPriceModal();
    }

    //API CALL
    React.useEffect(() => {
        fetchAllPriceLevels();
    }, []);

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
                        <h1 className="page-title"> PRICE LEVELS </h1>
                    </Col>
                    <Col className="d-flex justify-content-end">
                        <input
                            type="text"
                            className="search-bar"
                            defaultValue=""
                            placeholder="Search name..."
                            onChange={(e) => search(e)}
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
                                onClick={() =>
                                    navigate("/pricelevels/add/mango")
                                }
                            >
                                To Mango Magic
                            </Dropdown.Item>
                            <Dropdown.Item
                                eventKey="POTATO CORNER"
                                onClick={() =>
                                    navigate("/pricelevels/add/potato")
                                }
                            >
                                To Potato Corner
                            </Dropdown.Item>
                        </DropdownButton>
                    </Col>
                </Row>

                {/* TABLE */}
                <Tabs
                    activeKey={filterConfig.tab}
                    defaultActiveKey={filterConfig.tab}
                    id="pricelevel-tabs"
                    className="manager-tabs"
                    onSelect={handleTabSelect}
                >
                    <Tab eventKey="all" title="All">
                        <TableTemplate
                            tableHeaders={["NAME", "ACTIONS"]}
                            headerSelector={["name"]}
                            tableData={priceLevelsData}
                            ActionBtn={(row) => ActionBtn(row)}
                            showLoader={showLoader}
                        />
                    </Tab>
                    <Tab eventKey="MANGO MAGIC" title="Mango Magic">
                        <TableTemplate
                            tableHeaders={["NAME", "ACTIONS"]}
                            headerSelector={["name"]}
                            tableData={priceLevelsMango}
                            ActionBtn={(row) => ActionBtn(row)}
                            showLoader={showLoader}
                        />
                    </Tab>
                    <Tab eventKey="POTATO CORNER" title="Potato Corner">
                        <TableTemplate
                            tableHeaders={["NAME", "ACTIONS"]}
                            headerSelector={["name"]}
                            tableData={priceLevelsPotato}
                            ActionBtn={(row) => ActionBtn(row)}
                            showLoader={showLoader}
                        />
                    </Tab>
                </Tabs>
            </div>

            {/* MODALS */}
            <DeleteModal
                text="price level"
                show={showDeleteModal}
                onHide={handleCloseDeleteModal}
                onDelete={del}
            />
            <EditModal
                title="PRICE LEVEL"
                type="price level"
                show={showEditPriceModal}
                onHide={handleCloseEditPriceModal}
                onSave={() => alert("Save")}
            >
                <div className=" ms-3 mt-3">
                    <Row className="nc-modal-custom-row">
                        <Col>
                            PRODUCT NAME
                            <Form.Control
                                type="text"
                                name="product_name"
                                value="Fresh Mango Shake"
                                className="nc-modal-custom-input"
                                required
                            />
                        </Col>
                        <Col>
                            <Form.Group
                                className="mt-3"
                                controlId="formBasicCheckbox"
                            >
                                <Form.Check
                                    type="checkbox"
                                    label="Add on"
                                    className="pt-2"
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col>INGREDIENT'S LIST</Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <div className="edit-purchased-items">
                            {products.length === 0 ? (
                                <span>No Ingredients for Products Found!</span>
                            ) : (
                                renderTable()
                            )}
                        </div>
                    </Row>
                    <Row className="pt-3 PO-add-item">
                        <Button type="button" onClick={() => EditProductBtn()}>
                            Add Ingredient
                        </Button>
                    </Row>
                </div>
            </EditModal>
            <ViewModal
                withHeader
                title="PRODUCT"
                withButtons
                show={showViewPriceModal}
                onHide={handleCloseViewPriceModal}
                onEdit={handleOnEdit}
            >
                <div className="ms-3 mt-3">
                    <Row className="nc-modal-custom-row">
                        <Col>
                            PRODUCT NAME
                            <Form.Control
                                type="text"
                                name="ingredient_name"
                                value="Fresh Mango Shake"
                                className="nc-modal-custom-input"
                                required
                            />
                        </Col>
                        <Col>
                            <Form.Group
                                className="mt-3"
                                controlId="formBasicCheckbox"
                            >
                                <Form.Check
                                    type="checkbox"
                                    label="Add on"
                                    className="pt-2"
                                    checked
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col>INGREDIENT'S LIST</Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <div className="view-table ">
                            {products.length === 0 ? (
                                <span>
                                    {" "}
                                    No Ingredients for Products Found!{" "}
                                </span>
                            ) : (
                                viewTable()
                            )}
                        </div>
                    </Row>
                </div>
            </ViewModal>
        </div>
    );
}
