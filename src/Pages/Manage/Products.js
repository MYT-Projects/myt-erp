import React, { useState, useRef, useEffect } from "react";
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

//components
import TableTemplate from "../../Components/TableTemplate/Table";
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
    createProduct,
    deleteProduct,
    getAllProducts,
    searchProduct,
    updateProducts,
} from "../../Helpers/apiCalls/Manage/Products";
import { getAllItems } from "../../Helpers/apiCalls/itemsApi";
import toast from "react-hot-toast";
import { toastStyle, refreshPage, isAdmin } from "../../Helpers/Utils/Common";
import { validateProducts } from "../../Helpers/Validation/Manage/ProductsValidation";
import InputError from "../../Components/InputError/InputError";
import {
    createProductPotato,
    deleteProductPotato,
    getAllProductsPotato,
    searchProductPotato,
    updateProductsPotato,
} from "../../Helpers/apiCalls/PotatoCorner/Manage/Products";
import { getAllItemsPotato } from "../../Helpers/apiCalls/PotatoCorner/Manage/ItemsApi";
import {
    getAllPriceLevels,
} from "../../Helpers/apiCalls/Manage/PriceLevels";
import {
    getAllPriceLevelsPotato,
} from "../../Helpers/apiCalls/PotatoCorner/Manage/PriceLevels";


export default function Products() {
    const [inactive, setInactive] = useState(false);
    const [option, setOption] = useState("Select");
    const [isClicked, setIsClicked] = useState(false);
    const [showLoader, setShowLoader] = useState(false);
    const [addOn, setAddOn] = useState("");

    const [filterConfig, setFilterConfig] = useState({
        tab: "MANGO MAGIC",

    });
    const handleTabSelect = (tabKey) => {
        setAddOn("")
        setFilterConfig((prev) => {
            return { ...prev, tab: tabKey };
        });
    };
    const isInitialMount = useRef(true);
    const filterConfigKey = 'manage-products-filterConfig';
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
    const [showViewProductModal, setShowViewProductModal] = useState(false);
    const handleShowViewProductModal = () => setShowViewProductModal(true);
    const handleCloseViewProductModal = () => setShowViewProductModal(false);

    // EDIT
    const [showEditProductModal, setShowEditProductModal] = useState(false);
    const handleShowEditProductModal = () => setShowEditProductModal(true);
    const handleCloseEditProductModal = () => {
        setShowEditProductModal(false)
    };

    // ADD
    const [showAddProductModal, setShowAddProductModal] = useState(false);
    const handleShowAddProductModal = () => {
        setShowAddProductModal(true);
        setAddProductData([{}])
        setOptionalItems([{}])
        setProducts([{ id: "", quantity: "", unit: "", unitList: [] }]);
    };
    const handleCloseAddProductModal = () => {
        setShowAddProductModal(false)
    };
    const [priceLevelsData, setPriceLevelsData] = useState([]);
    const [addTo, setAddTo] = useState("");
    const handleAddSelect = (e) => {
        setAddTo(e);
    };

    // MODAL TABLE
    const [products, setProducts] = useState([
        { id: "", quantity: "", unit: "", unitList: [] },
    ]);

    const [optionalItems, setOptionalItems] = useState([
        { product_item_id: "", item_id: "", qty: "", unit: ""},
    ]);
    const [file, setFile] = useState([]);

    function handleRemoveProduct(id) {
        const rowId = id;
        const newProductList = [...products];
        newProductList.splice(rowId, 1);
        setProducts(newProductList);
    }

    function handleRemoveOptionalItem(id) {
        const rowId = id;
        const newProductList = [...optionalItems];
        newProductList.splice(rowId, 1);
        setOptionalItems(newProductList);
    }

    function AddProductBtn() {
        const newProduct = { name: "", quantity: "", unit: "" };
        setProducts((prevProduct) => [...prevProduct, newProduct]);
    }

    function EditProductBtn() {
        const newProduct = { name: "", quantity: "", unit: "" };
        setProducts((prevProduct) => [...prevProduct, newProduct]);
    }

    function AddOptionalItemBtn() {
        const newProduct = { name: "", quantity: "", unit: "" };
        setOptionalItems((prevProduct) => [...prevProduct, newProduct]);
    }

    function getUnits(id) {
        return itemsData.filter((item) => item.id === id);
    }

    function handleProductChange(e, index) {
        const { name, value } = e.target;
        const list = [...products];
        list[index][name] = value;

        if (name === "id") {
            const unit = getUnits(value);
            list[index]["item_id"] = value;
            list[index]["unitList"] = unit[0];
            list[index]["unit"] = unit[0].item_units[0].breakdown_unit;
        }
        setProducts(list);
    }

    function handleOptionalItemChange(e, index) {
        const { name, value } = e.target;
        const list = [...optionalItems];
        list[index][name] = value;
        console.log(name, value)
        if (name === "item_id") {
            const unit = getUnits(value);
            console.log(unit)
            list[index]["unitList"] = unit[0];
            list[index]["unit"] = unit[0].item_units[0].breakdown_unit;
        }
        setOptionalItems(list);
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
                                    <Form.Select
                                        name="id"
                                        id={product.item_id}
                                        value={product.item_id}
                                        onChange={(e) =>
                                            handleProductChange(e, index)
                                        }
                                    >
                                        <option value="">Select</option>
                                        {itemsData.map((data) => {
                                            return (
                                                <option value={data.id}>
                                                    {data.name}
                                                </option>
                                            );
                                        })}
                                    </Form.Select>
                                </td>
                                <td>
                                    <Form.Control
                                        type="number"
                                        name="quantity"
                                        min="0"
                                        defaultValue={product.qty}
                                        onChange={(e) =>
                                            handleProductChange(e, index)
                                        }
                                    />
                                </td>
                                <td>
                                    {showAddProductModal && (
                                        <Form.Select
                                        name="unit"
                                        id={product.id}
                                        value={product.unit}
                                        onChange={(e) =>
                                            handleProductChange(e, index)
                                        }
                                    >
                                        <option value="">Select</option>
                                        {product?.unitList?.item_units?.map((data) => {
                                            return <option value={data.breakdown_unit}>{data.breakdown_unit}</option>
                                        })}
                                        
                                    </Form.Select>
                                    )}

                                    {showEditProductModal && (
                                        <Form.Select
                                            name="unit"
                                            id={product.id}
                                            value={product.unit}
                                            onChange={(e) =>
                                                handleProductChange(e, index)
                                            }
                                        >
                                            <option value="">Select</option>
                                            <option value={product.unit}>{product.unit}</option>
                                        </Form.Select>
                                    )}
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

    function renderAddOnTable() {
        return (
            <Table>
                <thead>
                    <tr>
                        <th>Ingredient to replace</th>
                        <th>New Ingredient</th>
                        <th>Quantity</th>
                        <th>Unit</th>
                    </tr>
                </thead>
                <tbody>
                    {optionalItems.map((product, index) => {
                        return (
                            <tr>
                                <td>
                                    <Form.Select
                                        name="product_item_id"
                                        id={product.product_item_id}
                                        value={product.product_item_id}
                                        onChange={(e) =>
                                            handleOptionalItemChange(e, index)
                                        }
                                    >
                                        <option value="">Select</option>
                                        {itemsData.map((data) => {
                                            return (
                                                <option value={data.id}>
                                                    {data.name}
                                                </option>
                                            );
                                        })}
                                    </Form.Select>
                                </td>
                                <td>
                                    <Form.Select
                                        name="item_id"
                                        id={product.item_id}
                                        value={product.item_id}
                                        onChange={(e) =>
                                            handleOptionalItemChange(e, index)
                                        }
                                    >
                                        <option value="">Select</option>
                                        {itemsData.map((data) => {
                                            return (
                                                <option value={data.id}>
                                                    {data.name}
                                                </option>
                                            );
                                        })}
                                    </Form.Select>
                                </td>
                                <td>
                                    <Form.Control
                                        type="number"
                                        name="qty"
                                        min="0"
                                        defaultValue={product.qty}
                                        onChange={(e) =>
                                            handleOptionalItemChange(e, index)
                                        }
                                    />
                                </td>
                                <td>
                                    {showAddProductModal && (
                                        <Form.Select
                                        name="unit"
                                        id={product.unit}
                                        value={product.unit}
                                        onChange={(e) =>
                                            handleOptionalItemChange(e, index)
                                        }
                                    >
                                        <option value="">Select</option>
                                        {product?.unitList?.item_units?.map((data) => {
                                            return <option value={data.breakdown_unit}>{data.breakdown_unit}</option>
                                        })}
                                        
                                    </Form.Select>
                                    )}

                                    {showEditProductModal && (
                                        <Form.Select
                                            name="unit"
                                            id={product.unit}
                                            value={product.unit}
                                            onChange={(e) =>
                                                handleOptionalItemChange(e, index)
                                            }
                                        >
                                            <option value="">Select</option>
                                            <option value={product.unit}>{product.unit}</option>
                                        </Form.Select>
                                    )}
                                </td>
                                <td>
                                    <div className="align-middle">
                                        <img
                                            src={trash}
                                            alt="delete"
                                            onClick={() =>
                                                handleRemoveOptionalItem(index)
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
                <tbody>
                    {products.map((product, index) => {
                        return (
                            <tr>
                                <td>{product.item_name}</td>
                                <td>{product.qty}</td>
                                <td>{product.unit}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        );
    }

    function viewAddOnTable() {
        return (
            <Table>
                <thead>
                    <tr>
                        <th>Ingredient to Replace</th>
                        <th>New Ingredient</th>
                        <th>Quantity</th>
                        <th>Unit</th>
                    </tr>
                </thead>
                <tbody>
                    {optionalItems.map((product, index) => {
                        return (
                            <tr>
                                <td>{product.ingredient_to_replace}</td>
                                <td>{product.new_ingredient}</td>
                                <td>{product.qty}</td>
                                <td>{product.unit}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        );
    }

    //ERROR HANDLING
    const [isError, setIsError] = useState({
        name: false,
        list: false,
        listInfo: false,
        optionalInfo: false,
    });

    const [isErrorEdit, setIsErrorEdit] = useState({
        name: false,
        list: false,
        listInfo: false,
        optionalInfo: false,
    });

    //API
    const [itemsData, setItemsData] = useState([]);
    const [productsData, setProductsData] = useState([]);
    const [productsDataMango, setProductsDataMango] = useState([]);
    const [productsDataPotato, setProductsDataPotato] = useState([]);
    const [priceLevelIDs, setPriceLevelIDs] = useState([]);
    const [searchProductName, setSearchProductName] = useState("");
    const [selectedRow, setSelectedRow] = useState({
        name: "",
        is_addon: "",
        items: [],
    });
    const [addProductData, setAddProductData] = useState({
        name: "",
        is_addon: "",
        price_level_id: [],
        items: [],
    });
    const [editProductData, setEditProductData] = useState({
        id: "",
        name: "",
        is_addon: "",
        items: [],
    });

    const handleEditChange = (e) => {
        const { name, value, checked } = e.target;
        console.log(name, value)
        console.log(editProductData)
        if (name === "is_addon") {
            if (editProductData.is_addon === 1 || editProductData.is_addon === "1") {
                setEditProductData((prevState) => ({
                    ...prevState,
                    [name]: 0,
                }));
            } else {
                setEditProductData((prevState) => ({
                    ...prevState,
                    [name]: 1,
                }));
            }
        } else if (name === "price_level_id") {
            console.log(priceLevelsData)
            console.log(checked)

            var array = [...priceLevelsData]
            array.map((data) => {
                if(data.id === value) {
                    data.is_selected = checked
                }
            })
            setPriceLevelsData(array)
            
        }  else {
            setEditProductData((prevState) => ({
                ...prevState,
                [name]: value,
            }));
        }
    };

    const handleAddChange = (e) => {
        const { name, value, checked } = e.target;
        console.log(name, value)
        if (name === "is_addon") {
            if (addProductData.is_addon === 1) {
                setAddProductData((prevState) => ({
                    ...prevState,
                    [name]: 0,
                }));
            } else {
                setAddProductData((prevState) => ({
                    ...prevState,
                    [name]: 1,
                }));
            }
        } else if (name === "price_level_id") {
            console.log(priceLevelsData)

            var array = [...priceLevelsData]
            array.map((data) => {
                if(data.id === value) {
                    data.is_selected = checked
                }
            })
            setPriceLevelsData(array)

        } else {
            setAddProductData((prevState) => ({
                ...prevState,
                [name]: value,
            }));
        }
    };

    console.log(priceLevelIDs)

    //DROPDOWN
    function handleSelectChange(e, row) {
        setSelectedRow(row);
        fetchItems();
        console.log(row)

        if (e.target.value === "delete-product") {
            setEditProductData(row);
            handleShowDeleteModal();
        } else if (e.target.value === "edit-product") {
            // var array = []
            // row.items.map((item) => {
            //     array.push(item.id)
            // })
            // console.log(array)
            // getProductOptionalItems(array)
            setEditProductData(row);
            setProducts(row.items);
            setOptionalItems(row.optional_items);
            handleShowEditProductModal();
            setEditProductData(row);
            fetchItems()
        } else if (e.target.value === "view-product") {
            handleShowViewProductModal();
            setProducts(row.items);
            setOptionalItems(row.optional_items);
            setEditProductData(row);
            fetchItems();
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
        handleCloseViewProductModal();
        handleShowEditProductModal();
    }

    async function fetchAllPriceLevels() {
        setShowLoader(true);
        //MANGO
        if (addTo === "MANGO MAGIC" || selectedRow?.type === "mango") {
            const response = await getAllPriceLevels();
            var result1 = response.data.data.data;
            if (response.data.data) {
                response.data.data.data.map((data) => {
                    data.type = "mango";
                    data.is_selected = false;
                });
                setPriceLevelsData(result1);
            }

            var otherData = result1;
            otherData.map((data,index) => {
                selectedRow?.price_levels?.map((price) => {
    
                    if (data.id === price.id) {
                        otherData[index]["is_selected"] = true;
                    }
                });
                setPriceLevelsData(otherData);
            });
        }
        else if (addTo === "POTATO CORNER" || selectedRow?.type === "potato") {
            //Potato
            const response2 = await getAllPriceLevelsPotato();
            var result2 = response2.data.data.data;
            if (response2.data.data) {
                response2.data.data.data.map((data) => {
                    data.type = "potato";
                    data.is_selected = false;
                });
                setPriceLevelsData(result2);
            }

            var otherData = result2;
            otherData.map((data,index) => {
                selectedRow?.price_levels?.map((price) => {
    
                    if (data.id === price.id) {
                        otherData[index]["is_selected"] = true;
                    }
                });
                setPriceLevelsData(otherData);
            });
        }
        
        setShowLoader(false);
    }

    async function fetchItems() {
        setShowLoader(true);
        setItemsData([]);
        if (addTo === "MANGO MAGIC" || selectedRow?.type === "mango") {
            const response = await getAllItems();
            if (response) {
                let result = response.response.data
                    .filter((item) => item.type === "ingredient")
                    .map((a) => {
                        return {
                            name: a.name,
                            id: a.id,
                            item_units: a.item_units,
                            type: a.type,
                        };
                    });
                setItemsData(result);
            }
        } else if (addTo === "POTATO CORNER" || selectedRow?.type === "potato") {
            const response = await getAllItemsPotato();
            if (response) {
                let result = response.response.data
                    .filter((item) => item.type === "ingredient")
                    .map((a) => {
                        return {
                            name: a.name,
                            id: a.id,
                            item_units: a.item_units,
                            type: a.type,
                        };
                    });
                setItemsData(result);
            }
        }
        setShowLoader(false);
    }

    async function fetchProducts() {
        setShowLoader(true);
        setProductsData([]);
        setProductsDataMango([]);
        setProductsDataPotato([]);

        if (filterConfig.tab === "MANGO MAGIC") {
            var array = []
            //MANGO
            const response = await getAllProducts(searchProductName, addOn);
    
            if (response) {
                let result = response?.data?.data?.data.map((a) => {
                    var info = a;
                    info.product_name = a.name
                    info.type = "mango"
                    return info;
                });
                setProductsData(result);
                
            } else if (response.error) {
                setProductsData([]);
            }
        } 
        
        if (filterConfig.tab === "POTATO CORNER") {
            //POTATO
            const response2 = await getAllProductsPotato(searchProductName, addOn);
            if (response2.data?.data.status === "success") {
                let result2 = response2.data?.data?.data.map((a) => {
                    var info = a;
                    info.product_name = a.name
                    info.type = "potato"
                    return info;
                });
                setProductsData(result2);
            } else if (response2.data?.error) {
                setProductsData([]);
            }
        }
        
        setShowLoader(false);
    }

    function handleSetPriceLevel() {
        var otherData = priceLevelsData;
        priceLevelsData.map((data,index) => {
            selectedRow.price_levels?.map((price) => {
                console.log(data, index)
                console.log(data.id, price.id)

                if (data.id === price.id) {
                    otherData[index]["is_selected"] = true;
                }
            });
            setPriceLevelsData(otherData);
        });
    }
    console.log(priceLevelsData)

    async function searchProducts() {
        setShowLoader(true);
        //MANGO
        const response = await searchProduct(searchProductName);
        if (response.data) {
            var productlist = response.data.data;
            setProductsData(productlist);
            setProductsDataMango(productlist);
        } else {
            setProductsData([]);
        }

        const response2 = await searchProductPotato(searchProductName);
        if (response2.data) {
            var productlist2 = response2.data.data;
            setProductsData(productlist2);
            setProductsDataPotato(productlist2);
        } else {
            setProductsData([]);
        }
        setShowLoader(false);
    }

    async function create() {
        if (validateProducts(addProductData, products, optionalItems, setIsError)) {
            setIsClicked(true);
            if (addTo === "MANGO MAGIC") {
                const response = await createProduct(addProductData, priceLevelsData, products, optionalItems, file);
                if (response.data) {
                    if (response.data.status === "success") {
                        toast.success("Successfully added product!", {
                            style: toastStyle(),
                        });
                        setTimeout(() => {
                            refreshPage()
                        }, 1000);
                    } 
                } else {
                    toast.error(response.data.message, {
                        style: toastStyle(),
                    });
                }
            } else if (addTo === "POTATO CORNER") {
                const response = await createProductPotato(
                    addProductData,
                    priceLevelsData,
                    products,
                    optionalItems,
                    file
                );
                if (response.data) {
                    if (response.data.status === "success") {
                        toast.success("Successfully added product!", {
                            style: toastStyle(),
                        });
                        setTimeout(() => {
                            refreshPage()
                        }, 1000);
                    } 
                } else {
                    toast.error(response.data.message, {
                        style: toastStyle(),
                    });
                }
            }
        } else {
            toast.error("Please fill in all required fields", {
                style: toastStyle(),
            });
        }
    }

    async function editProduct() {
        if (validateProducts(editProductData, products, optionalItems, setIsErrorEdit)) {
            if (selectedRow.type === "mango") {
                const response = await updateProducts(
                    editProductData,
                    priceLevelsData,
                    products,
                    optionalItems,
                    file
                );
                console.log(response)
                if (response) {
                    if (response.data.status === "success") {
                        toast.success(response.data.response, {
                            style: toastStyle(),
                        });
                        setTimeout(() => {
                            refreshPage()
                        }, 1000);
                    } else {
                        toast.error(response.data.response, {
                            style: toastStyle(),
                        });
                    }
                } else {
                    toast.error(response.data.message, {
                        style: toastStyle(),
                    });
                }
            } else if (selectedRow.type === "potato") {
                const response = await updateProductsPotato(
                    editProductData,
                    priceLevelsData,
                    products,
                    optionalItems,
                    file
                );
                if (response) {
                    if (response.data.status === "success") {
                        toast.success(response.data.response, {
                            style: toastStyle(),
                        });
                        setTimeout(() => {
                            refreshPage()
                        }, 1000);
                    } else {
                        toast.error(response.data.response, {
                            style: toastStyle(),
                        });
                    }
                } else {
                    toast.error(response.data.response, {
                        style: toastStyle(),
                    });
                }
            }
        }
    }

    async function del() {

        if (selectedRow.type === "mango") {
            const response = await deleteProduct(selectedRow.id);
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
        } else if (selectedRow.type === "potato") {
            const response = await deleteProductPotato(selectedRow.id);
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

    function handleOnSearch(e) {
        const { name, value } = e.target;
        setAddOn(value)
    }

    //API CALL
    React.useEffect(() => {
        fetchItems();
        fetchAllPriceLevels();
    }, [addTo]);

    React.useEffect(() => {
        fetchItems();
        fetchAllPriceLevels();
    }, [selectedRow]);

    React.useEffect(() => {
        // searchProducts();
        fetchProducts();
    }, [searchProductName, addOn, filterConfig]);
    
    React.useEffect(() => {
        handleSetPriceLevel();
    }, [productsData, selectedRow]);

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
                        <h1 className="page-title"> PRODUCTS </h1>
                    </Col>
                    <Col className="d-flex justify-content-end">
                        <input
                            type="text"
                            className="search-bar"
                            defaultValue=""
                            name="search"
                            placeholder="Search name..."
                            onChange={(e) =>
                                setSearchProductName(e.target.value)
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
                                onClick={handleShowAddProductModal}
                            >
                                To Mango Magic
                            </Dropdown.Item>
                            <Dropdown.Item
                                eventKey="POTATO CORNER"
                                onClick={handleShowAddProductModal}
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
                    id="products-tabs"
                    className="manager-tabs"
                    onSelect={handleTabSelect}
                >
                    <Tab eventKey="MANGO MAGIC" title="Mango Magic">
                        <div>
                            <div className="my-2 px-2 PO-filters d-flex">
                                <span className="me-4 align-middle mt-2 ps-label">
                                    Filter By:
                                </span>
                                <Form.Select
                                    name="is_addon"
                                    className="date-filter me-2"
                                    onChange={(e) => handleOnSearch(e)}
                                >
                                    <option value="" selected> All </option>
                                    <option value="1"> Add On</option>
                                    <option value="0"> Product </option>
                                </Form.Select>
                            </div>
                            <TableTemplate
                                tableHeaders={["PRODUCT NAME", "ACTIONS"]}
                                headerSelector={["product_name", ""]}
                                tableData={productsData}
                                showLoader={showLoader}
                                ActionBtn={(row) => ActionBtn(row)}
                            />
                        </div>
                    </Tab>
                    <Tab eventKey="POTATO CORNER" title="Potato Corner">
                        <div>
                            <div className="my-2 px-2 PO-filters d-flex">
                                <span className="me-4 align-middle mt-2 ps-label">
                                    Filter By:
                                </span>
                                <Form.Select
                                    name="is_addon"
                                    className="date-filter me-2"
                                    onChange={(e) => handleOnSearch(e)}
                                >
                                    <option value="" selected> All </option>
                                    <option value="1"> Add On</option>
                                    <option value="0"> Product </option>
                                </Form.Select>
                            </div>
                            <TableTemplate
                                tableHeaders={["PRODUCT NAME", "ACTIONS"]}
                                headerSelector={["product_name", ""]}
                                tableData={productsData}
                                showLoader={showLoader}
                                ActionBtn={(row) => ActionBtn(row)}
                            />
                        </div>
                    </Tab>
                </Tabs>
            </div>

            {/* MODALS */}
            <DeleteModal
                text="product"
                show={showDeleteModal}
                onHide={handleCloseDeleteModal}
                onDelete={() => del()}
            />
            <AddModal
                title={`PRODUCT TO ${addTo}`}
                type="product"
                show={showAddProductModal}
                onHide={handleCloseAddProductModal}
                onSave={() => create()}
                isClicked={isClicked}
            >
                <div className="mt-3 ">
                    <Row className="nc-modal-custom-row mt-0">
                        <Col>
                            PRODUCT NAME
                            <Form.Control
                                type="text"
                                name="name"
                                value={addProductData.name}
                                className="nc-modal-custom-input"
                                onChange={(e) => handleAddChange(e)}
                                required
                            />
                            <InputError
                                isValid={isError.name}
                                message={"Product name is required"}
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
                                    name="is_addon"
                                    value="1"
                                    className="pt-2"
                                    onChange={(e) => handleAddChange(e)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row mt-3">                        
                        <Col>
                            PRICE LEVEL
                        </Col>
                    </Row>
                    <Row className=" mt-0">                        
                        {
                            priceLevelsData.map((data) => {
                                return (
                                    <>
                                        <Col xs={3}>
                                            <Form.Check
                                                inline
                                                label={data.name}
                                                name="price_level_id"
                                                value={data.id}
                                                type="checkbox"
                                                // defaultChecked
                                                onClick={(e) => { handleAddChange(e); }}
                                            />
                                        </Col>
                                    </>
                                )
                            })
                        }
                    </Row>
                    <Row className="pt-3 mb-2">
                        <Col>
                            <input 
                                class="form-control date-filter gotham" 
                                type="file" accept="image/png, image/gif, image/jpeg" 
                                id="formFileSm" 
                                onChange={(e)=>setFile(e.target.files[0])}/>
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
                        <InputError
                            isValid={isError.list}
                            message={
                                "There must be at least one ingredient for this product!"
                            }
                        />
                        <InputError
                            isValid={isError.listInfo}
                            message={
                                "Please make sure to fill all inputs for each ingredient added!"
                            }
                        />
                    </Row>
                    <Row className="pt-3 PO-add-item">
                        <Button type="button" onClick={() => EditProductBtn()}>
                            Add Ingredient
                        </Button>
                    </Row>
                    {addProductData.is_addon === 1 ? (
                        <>
                        <Row className="nc-modal-custom-row">
                            <Col>Optional Items</Col>
                        </Row>
                        <Row className="nc-modal-custom-row">
                            <div className="edit-purchased-items">
                                {products.length === 0 ? (
                                    <span>No Optional Items Found!</span>
                                ) : (
                                    renderAddOnTable()
                                )}
                            </div>
                        </Row>
                        <Row className="pt-3 PO-add-item">
                            <InputError
                                isValid={isError.optionalInfo}
                                message={
                                    "Please make sure to fill all inputs for each ingredient added!"
                                }
                            />
                        </Row>
                        <Row className="pt-3 PO-add-item">
                            <Button type="button" onClick={() => AddOptionalItemBtn()}>
                                Add Item
                            </Button>
                        </Row>
                        </>
                    ) : ""}
                    
                </div>
            </AddModal>
            <EditModal
                title="PRODUCT"
                type="product"
                show={showEditProductModal}
                onHide={handleCloseEditProductModal}
                onSave={() => editProduct()}
            >
                <div className=" mt-3 ">
                    <Row className="nc-modal-custom-row mt-0">
                        <Col>
                            PRODUCT NAME
                            <Form.Control
                                type="text"
                                name="name"
                                value={editProductData.name}
                                className="nc-modal-custom-input"
                                onChange={(e) => handleEditChange(e)}
                                required
                            />
                            <InputError
                                isValid={isErrorEdit.name}
                                message={"Product name is required"}
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
                                    name="is_addon"
                                    value="1"
                                    className="pt-2"
                                    checked={editProductData.is_addon === "1"}
                                    onChange={(e) => handleEditChange(e)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row mt-3">                        
                        <Col>
                            PRICE LEVEL
                        </Col>
                    </Row>
                    <Row className=" mt-0">                        
                        {
                            priceLevelsData.map((data) => {
                                return (
                                    <>
                                        <Col xs={3}>
                                            <Form.Check
                                                inline
                                                label={data.name}
                                                name="price_level_id"
                                                value={data.id}
                                                type="checkbox"
                                                checked={data.is_selected}
                                                onClick={(e) => { handleEditChange(e); }}
                                            />
                                        </Col>
                                    </>
                                )
                            })
                        }
                    </Row>
                    <Row className="pt-3 mb-2">
                        <Col xs={10}>
                            <input 
                                class="form-control date-filter gotham" 
                                type="file" accept="image/png, image/gif, image/jpeg" 
                                id="formFileSm" 
                                onChange={(e)=>setFile(e.target.files[0])}/>
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
                        <InputError
                            isValid={isErrorEdit.list}
                            message={
                                "There must be at least one ingredient for this product!"
                            }
                        />
                        <InputError
                            isValid={isErrorEdit.listInfo}
                            message={
                                "Please make sure to fill all inputs for each ingredient added!"
                            }
                        />
                    </Row>
                    <Row className="pt-3 PO-add-item">
                        <Button type="button" onClick={() => EditProductBtn()}>
                            Add Ingredient
                        </Button>
                    </Row>
                    {editProductData.is_addon === 1 || editProductData.is_addon === "1"? (
                        <>
                        <Row className="nc-modal-custom-row">
                            <Col>Optional Items</Col>
                        </Row>
                        <Row className="nc-modal-custom-row">
                            <div className="edit-purchased-items">
                                {products.length === 0 ? (
                                    <span>No Optional Items Found!</span>
                                ) : (
                                    renderAddOnTable()
                                )}
                            </div>
                        </Row>
                        <Row className="pt-3 PO-add-item">
                            <InputError
                                isValid={isErrorEdit.optionalInfo}
                                message={
                                    "Please make sure to fill all inputs for each ingredient added!"
                                }
                            />
                        </Row>
                        <Row className="pt-3 PO-add-item">
                            <Button type="button" onClick={() => AddOptionalItemBtn()}>
                                Add Item
                            </Button>
                        </Row>
                        </>
                    ) : ""}
                </div>
            </EditModal>
            <ViewModal
                withHeader
                title="PRODUCT"
                withButtons
                show={showViewProductModal}
                onHide={handleCloseViewProductModal}
                onEdit={handleOnEdit}
            >
                <div className=" mt-3">
                    <Row className="nc-modal-custom-row mt-0">
                        <Col>
                            PRODUCT NAME
                            <Form.Control
                                type="text"
                                name="ingredient_name"
                                value={editProductData.name}
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
                                    checked={editProductData.is_addon === "1"}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row mt-1">                        
                        <Col>
                            PRICE LEVEL
                        </Col>
                    </Row>
                    <Row className=" mt-0">                        
                        {
                            priceLevelsData.map((data) => {
                                return (
                                    <>
                                        <Col xs={3}>
                                            <Form.Check
                                                inline
                                                label={data.name}
                                                name="price_level_id"
                                                value={data.id}
                                                type="checkbox"
                                                checked={data.is_selected}
                                                // onClick={(e) => { handleEditChange(e); }}
                                            />
                                        </Col>
                                    </>
                                )
                            })
                        }
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col>INGREDIENT'S LIST</Col>
                    </Row>
                    <Row className="nc-modal-custom-row mt-0">
                        <div className="view-table mt-0 ">
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
                    {editProductData.is_addon === 1 || editProductData.is_addon === "1"? (
                        <>
                        <Row className="nc-modal-custom-row">
                            <Col>OPTIONAL ITEMS</Col>
                        </Row>
                        <Row className="nc-modal-custom-row mt-0">
                            <div className="view-table mt-0 ">
                                {products.length === 0 ? (
                                    <span>No Optional Items Found!</span>
                                ) : (
                                    viewAddOnTable()
                                )}
                            </div>
                        </Row>
                        </>
                    ) : ""}
                </div>
            </ViewModal>
        </div>
    );
}
