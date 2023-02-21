import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button, Col, Form, Row, Table } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../../Components/Navbar/Navbar";
import trash from "./../../../../Assets/Images/trash.png";
import Select from "react-select";
import "./../PurchaseOrders.css";
import {
    createSupplier,
    getAllSuppliers,
} from "../../../../Helpers/apiCalls/suppliersApi";
import {
    numberFormat,
    numberFormatInt,
    refreshPage,
    toastStyle,
    TokenExpiry,
    getTodayDateISO,
} from "../../../../Helpers/Utils/Common";
import {
    createPurchaseOrder,
    getItems,
    getAllItems,
} from "../../../../Helpers/apiCalls/Purchases/purchaseOrderApi";
import { getAllForwarders } from "../../../../Helpers/apiCalls/forwardersApi";
import InputError from "../../../../Components/InputError/InputError";
import { validateAddPO } from "../../../../Helpers/Validation/Purchase/PurchaseOrderValidation";
import AddModal from "../../../../Components/Modals/AddModal";
import toast, { Toaster } from "react-hot-toast";
import SelectSearch from "react-select-search";
import "react-select-search/style.css";
import { getAllBranches } from "../../../../Helpers/apiCalls/Purchases/purchaseOrderApi";
import { validateSuppliers } from "../../../../Helpers/Validation/Manage/SuppliersValidation";
import {
    createPurchaseOrderPotato,
    getItemsPotato,
    getAllItemsPotato,
} from "../../../../Helpers/apiCalls/PotatoCorner/Purchases/purchaseOrderApi";
import {
    createSupplierPotato,
    getAllSuppliersPotato,
} from "../../../../Helpers/apiCalls/PotatoCorner/suppliersApi";
import { getAllVendors } from "../../../../Helpers/apiCalls/Manage/Vendors";
import { getAllVendorsPotato } from "../../../../Helpers/apiCalls/PotatoCorner/VendorsApi";
import { getAllEmployees } from "../../../../Helpers/apiCalls/employeesApi";
import ReactLoading from "react-loading";
const customControlStyles = (base) => ({
    height: 20,
    minHeight: 20,
});

export default function AddPurchaseOrder() {
    let navigate = useNavigate();
    const { state } = useLocation();
    const [isSubmitClicked, setIsSubmitClicked] = useState(false);
    const [isSaveClicked, setIsSaveClicked] = useState(false);
    const { shopType } = useParams();
    const [inactive, setInactive] = useState(true);
    const today = getTodayDateISO();
    const [newPO, setNewPO] = useState({
        purchase_date: today,
        grand_total: 0,
        service_fee: 0,
        discount: 0,
        subtotal: 0,
    });
    console.log(newPO)
    const [items, setItems] = useState([
        { item: "", qty: 0, current_qty: 0, unit: "", price: 0, amount: 0 },
        { item: "", qty: 0, current_qty: 0, unit: "", price: 0, amount: 0 },
        { item: "", qty: 0, current_qty: 0, unit: "", price: 0, amount: 0 },
    ]);
    const [itemsList, setItemsList] = useState([]);
    const [itemsOptions, setItemsOptions] = useState([]);
    const [selectedItem, setSelectedItem] = useState("");
    const [branchList, setBranchList] = useState([]);
    const [branches, setBranches] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [isChanged, setIsChanged] = useState(false);
    // var branchList = []

    const [suppliersValue, setSuppliersValue] = useState({
        name: "supplier_id",
        label: "",
        value: "",
    });
    const [forwardersValue, setForwardersValue] = useState({
        name: "forwarder_id",
        label: "",
        value: "",
    });
    const [branchValue, setBranchValue] = useState({
        name: "branch_id",
        label: "",
        value: "",
    });
    const [itemsValue, setItemsValue] = useState({
        name: "item_id",
        label: "",
        value: "",
        content: "",
    });

    // ADD
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
    const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
    const handleShowAddSupplierModal = () => setShowAddSupplierModal(true);
    const handleCloseAddSupplierModal = () => {
        setShowAddSupplierModal(false);
    };

    //ERROR HANDLING
    const [isError, setIsError] = useState({
        supplierName: false,
        purchaseDate: false,
        deliveryDate: false,
        requisitioner: false,
        deliveryAddress: false,
        price: false,
        POItems: false,
    });

    function handleAddItem() {
        {
            window.open("/items", "_blank");
        }
    }

    async function fetchItems() {
        if (shopType === "mango") {
            const response = await getAllItems(branchValue.value);

            if (response.data) {
                var items_list = response.data.data;
                setItemsList(response.data.data);

                let result = response.data.data.map((a) => {
                    return {
                        label: a.name,
                        value: a.id,
                    };
                });
                setItemsOptions(result);
            } else {
                TokenExpiry(response);
            }
        } else if (shopType === "potato") {
            const response = await getAllItemsPotato(branchValue.value);

            if (response.data) {
                var items_list = response.data.data;
                setItemsList(response.data.data);

                let result = response.data.data.map((a) => {
                    return {
                        label: a.name,
                        value: a.id,
                    };
                });
                setItemsOptions(result);
            } else {
                TokenExpiry(response);
            }
        }
    }

    async function fetchBranches() {
        const response = await getAllBranches();

        if (response.data) {
            var branches_list = response.data.data;
            branches_list.map((branch) => {
                var info = {};

                if (branch.name === "Warehouse" || branch.id === "2") {
                    info.name = "branch_id";
                    info.label = branch.name;
                    info.value = branch.id;
                    info.address = branch.address;

                    setBranchList((prev) => [...prev, info]);
                }
            });
        } else {
            TokenExpiry(response);
        }
    }

    async function fetchEmployees() {
        setEmployees([]);
        const response = await getAllEmployees();

        if (response.data) {
            let result = response.data.data.map((data) => {
                return {
                    label:
                        data.first_name +
                        " " +
                        data.middle_name +
                        " " +
                        data.last_name,
                    value: data.id,
                };
            });
            setEmployees(result);
        } else {
            TokenExpiry(response);
        }
    }

    function handleRemoveItem(id) {
        setIsChanged(true);

        setShowLoader(true);
        const rowId = id;
        const newItemList = [...items];
        newItemList.splice(rowId, 1);
        setItems(newItemList);

        newPO.grand_total = newItemList
            .map((item) => item.amount)
            .reduce((a, b) => a + b, 0);

        setTimeout(() => setShowLoader(false), 1);
        setTimeout(() => setIsChanged(false), 1);
    }

    function AddItem() {
        const newItem = { item: "", qty: 1, unit: "", price: 0, amount: 0 };
        setItems((prevItems) => [...prevItems, newItem]);
    }

    const [showLoader, setShowLoader] = useState(false);

    function handleItemChange(e, id, search) {

        setIsChanged(true);
        if (search) {
            const list = [...items];
            list[id]["item_id"] = parseInt(e.value);

            itemsList?.map((data) => {
                data.item_units?.map((info) => {
                    if (e.value === info.item_id) {
                        if (parseInt(info.current_qty) < parseInt(info.max)) {
                            list[id]["qty"] = info.max - info.current_qty;
                        } else {
                            list[id]["qty"] = parseInt(info.max);
                        }

                        list[id]["unit"] = info.inventory_unit;
                        list[id]["current_qty"] = info.current_qty;
                        list[id]["price"] = info.previous_item_price || "0";
                        list[id]["amount"] =
                            parseFloat(list[id]["qty"] ? list[id]["qty"] : 0) *
                            parseFloat(
                                list[id]["price"] ? list[id]["price"] : 0
                            );
                    }
                });
            });
            setItems(list);
        } else {
            const { name, value } = e.target;
            const list = [...items];

            if (name === "item_id") {
                let values = value.split("|");
                var ingredient_id = values[0];
                var unit_id = values[1];
                var unit = parseFloat(values[2]).toFixed(2);
                var qty =
                    values[3] === "null" || values[3] === "undefined"
                        ? 0
                        : parseFloat(values[3]);
                var price = values[4] === "null" ? 0 : parseFloat(values[4]);

                items.map((item, index) => {
                    if (index === id) {
                        item["item_id"] = ingredient_id;
                        item["qty"] = qty;
                        item.unit = unit;
                        item["price"] = price;

                        item.amount = item.qty * item.price;
                    }
                });

                newPO.grand_total = items
                    .map((item) => item.amount)
                    .reduce((a, b) => a + b, 0);
                setShowLoader(true);
            }

            if (name === "qty" || name === "price") {
                setShowLoader(true);
                items.map((item, index) => {
                    if (index === id) {
                        item[name] = value;

                        item.amount = item.qty * item.price;
                    }
                });
                newPO.grand_total = items
                    .map((item) => item.amount)
                    .reduce((a, b) => a + b, 0);
            } else {
                items.map((item, index) => {
                    if (index === id) {
                        item[name] = value;
                        item.amount = item.qty * item.price;
                    }
                });

                newPO.grand_total = items
                    .map((item) => item.amount)
                    .reduce((a, b) => a + b, 0);
            }
            if (name === "remarks") {
                items.map((item, index) => {
                    if (index === id) {
                        item[name] = value;
                        item.amount = item.qty * item.price;
                    }
                });

                newPO.grand_total = items
                    .map((item) => item.amount)
                    .reduce((a, b) => a + b, 0);
            }
            if (name === "item_id") {
                itemsList?.map((data) => {
                    data.item_units.map((info) => {
                        if (value === info.item_id) {
                            if (info.current_qty < info.max) {
                                list[id]["qty"] = info?.max
                                    ? info?.max
                                    : 0 - info?.current_qty
                                    ? info?.current_qty
                                    : 0;
                            }

                            list[id]["unit"] = parseFloat(
                                info.inventory_unit
                            ).toFixed(2);
                            list[id]["price"] = info.previous_item_price || "0";
                            list[id]["amount"] =
                                (info.max - info.current_qty) *
                                (info.previous_item_price === null
                                    ? 0.0
                                    : parseFloat(
                                          info.previous_item_price
                                      ).toFixed(2));
                        }
                    });
                });

                setItems(list);
            }

            if (name === "unit") {
                itemsList?.map((data) => {
                    data.item_units.map((info) => {
                        if (list[id]["item_id"] === info.item_id) {
                            if (value === info.inventory_unit) {
                                list[id]["price"] =
                                    info.info.previous_item_price === null
                                        ? 0.0
                                        : parseFloat(
                                              info.previous_item_price
                                          ).toFixed(2);
                                list[id]["amount"] =
                                    (info.max - info.current_qty) *
                                    (info.previous_item_price === null
                                        ? 0.0
                                        : parseFloat(
                                              info.previous_item_price
                                          ).toFixed(2));
                            }
                        }
                    });
                });

                setItems(list);
            }

            setTimeout(() => setShowLoader(false), 1);
            setTimeout(() => setIsChanged(false), 1);

        }
    }

    async function handleAddSupplier() {
        if (validateSuppliers(supplierDetails, setIsError)) {
            if (shopType === "mango") {
                const response = await createSupplier(supplierDetails);
                if (response.response) {
                    toast.success(response.response.response, {
                        style: toastStyle(),
                    });
                    handleCloseAddSupplierModal();
                } else {
                    TokenExpiry(response);
                    toast.error("Error Creating New Supplier", {
                        style: toastStyle(),
                    });
                }
            } else if (shopType === "potato") {
                const response = await createSupplierPotato(supplierDetails);
                if (response.response) {
                    toast.success(response.response.response, {
                        style: toastStyle(),
                    });
                    handleCloseAddSupplierModal();
                    refreshPage();
                } else {
                    TokenExpiry(response);
                    toast.error("Error Creating New Supplier", {
                        style: toastStyle(),
                    });
                }
            }
        }
    }

    function renderTable() {
        return (
            <Table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Current Quantity</th>
                        <th>Unit</th>
                        <th>Unit Price</th>
                        <th>Amount</th>
                        <th>Remarks</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => {
                        return (
                            <tr>
                                <td>
                                    {state && item.isReadOnly ? (
                                        <Form.Control
                                            type="text"
                                            name="item_id"
                                            value={item.item_name}
                                            disabled
                                        />
                                    ) : (
                                        <Select
                                            options={itemsOptions}
                                            defaultValue={item.item_id}
                                            name="item_id"
                                            placeholder="Choose item"
                                            onChange={(e) =>
                                                handleItemChange(e, index, true)
                                            }
                                            search={true}
                                        />
                                    )}
                                </td>
                                <td>
                                    <Form.Control
                                        type="text"
                                        name="qty"
                                        value={item.qty}
                                        onChange={(e) =>
                                            handleItemChange(e, index, false)
                                        }
                                    />
                                </td>
                                <td>
                                    <Form.Control
                                        type="text"
                                        name="current_qty"
                                        className="nc-modal-custom-input"
                                        value={
                                            item.current_qty === null
                                                ? 0
                                                : item.current_qty
                                        }
                                        disabled
                                    />
                                </td>
                                <td>
                                    {state && item.isReadOnly ? (
                                        <Form.Control
                                            type="text"
                                            name="inventory_unit_name"
                                            className="nc-modal-custom-input"
                                            value={item.inventory_unit_name}
                                            disabled
                                        />
                                    ) : (
                                        <Form.Select
                                            name="unit"
                                            id={item.id}
                                            value={item.unit}
                                            onChange={(e) =>
                                                handleItemChange(
                                                    e,
                                                    index,
                                                    false
                                                )
                                            }
                                        >
                                            <option value="">Select</option>
                                            {itemsList
                                                ?.filter(
                                                    (info) =>
                                                        info.id == item.item_id
                                                )
                                                .map((data) => {
                                                    return data.item_units.map(
                                                        (info) => {
                                                            return (
                                                                <option
                                                                    value={
                                                                        info.inventory_unit
                                                                    }
                                                                >
                                                                    {
                                                                        info.inventory_unit
                                                                    }
                                                                </option>
                                                            );
                                                        }
                                                    );
                                                })}
                                        </Form.Select>
                                    )}
                                </td>
                                <td className="row align-contents">
                                    <Col xs={2} className="align-middle">
                                        PHP
                                    </Col>
                                    <Col>
                                        <Form.Control
                                            type="number"
                                            name="price"
                                            value={item.price}
                                            onChange={(e) =>
                                                handleItemChange(
                                                    e,
                                                    index,
                                                    false
                                                )
                                            }
                                        />
                                        <InputError
                                            isValid={isError.price}
                                            message={"Price is required"}
                                        />
                                    </Col>
                                </td>
                                <td>
                                    {showLoader
                                        ? null
                                        : "PHP " + numberFormat(item.amount)}
                                </td>
                                <td>
                                    <Form.Control
                                        type="text"
                                        name="remarks"
                                        value={item.remarks}
                                        onChange={(e) =>
                                            handleItemChange(e, index, false)
                                        }
                                    />
                                </td>
                                <td>
                                    <img
                                        src={trash}
                                        onClick={() => handleRemoveItem(index)}
                                        className="cursor-pointer"
                                    />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        );
    }

    /** Suppliers **/
    const [suppliers, setSuppliers] = useState([]);

    async function fetchSuppliers() {
        setSuppliers([]);

        if (shopType === "mango") {
            const response = await getAllSuppliers();
            const response2 = await getAllVendors();

            if (response.error) {
                TokenExpiry(response);
            } else {
                var suppliers = response.data.data.sort((a, b) =>
                    a.trade_name > b.trade_name
                        ? 1
                        : b.trade_name > a.trade_name
                        ? -1
                        : 0
                );

                suppliers.map((supplier) => {
                    var info = {};

                    info.name = "supplier_id";
                    info.label = supplier.trade_name;
                    info.value = "supplier-" + supplier.id;

                    setSuppliers((prev) => [...prev, info]);
                });
            }

            if (response2.error) {
                TokenExpiry(response2);
            } else {
                var vendors = response2.response.data.sort((a, b) =>
                    a.trade_name > b.trade_name
                        ? 1
                        : b.trade_name > a.trade_name
                        ? -1
                        : 0
                );

                vendors.map((vendor) => {
                    var info = {};

                    info.name = "supplier_id";
                    info.label = vendor.trade_name;
                    info.value = "vendor-" + vendor.id;

                    setSuppliers((prev) => [...prev, info]);
                });
            }
        } else if (shopType === "potato") {
            const response = await getAllSuppliersPotato();
            const response2 = await getAllVendorsPotato();

            if (response.error) {
                TokenExpiry(response);
            } else {
                var suppliers = response.response.data.sort((a, b) =>
                    a.trade_name > b.trade_name
                        ? 1
                        : b.trade_name > a.trade_name
                        ? -1
                        : 0
                );

                suppliers.map((supplier) => {
                    var info = {};

                    info.name = "supplier_id";
                    info.label = supplier.trade_name;
                    info.value = "supplier-" + supplier.id;

                    setSuppliers((prev) => [...prev, info]);
                });
            }

            if (response2.error) {
                TokenExpiry(response2);
            } else {
                var vendors = response2.response.data.sort((a, b) =>
                    a.trade_name > b.trade_name
                        ? 1
                        : b.trade_name > a.trade_name
                        ? -1
                        : 0
                );

                vendors.map((vendor) => {
                    var info = {};

                    info.name = "supplier_id";
                    info.label = vendor.trade_name;
                    info.value = "vendor-" + vendor.id;

                    setSuppliers((prev) => [...prev, info]);
                });
            }
        }
    }

    /** Forwarders **/
    const [forwarders, setForwarders] = useState([]);

    async function fetchForwarders() {
        setForwarders([]);

        const response = await getAllForwarders();

        if (response.data) {
            var forwarders = response.data.sort((a, b) =>
                a.name > b.name ? 1 : b.name > a.name ? -1 : 0
            );

            forwarders.map((forwarder) => {
                var info = {};

                info.name = "forwarder_id";
                info.label = forwarder.name;
                info.value = forwarder.id;

                setForwarders((prev) => [...prev, info]);
            });
        } else {
            TokenExpiry(response);
        }
    }

    /** Ingredients **/
    const [ingredients, setIngredients] = useState([]);

    async function fetchIngredients() {
        setIngredients([]);

        const response = await getAllItems();

        if (response.data) {
            var ingredients = response.response.data.sort((a, b) =>
                a.name > b.name ? 1 : b.name > a.name ? -1 : 0
            );

            setIngredients(ingredients);
        } else {
            TokenExpiry(response);
        }
    }

    function handleSelectChange(e, type) {
        const newList = newPO;
        newList[e.name] = e.value;
        setNewPO(newList);

        if (type === "requisitioner") {
            setNewPO({
                ...newPO,
                requisitioner: { label: e.label, value: e.value },
            });
        } else if (e.name === "supplier_id") {
            setSuppliersValue({ name: e.name, label: e.label, value: e.value });
            if (e.value.split("-")[0] === "vendor") {
                setNewPO({
                    ...newPO,
                    vendor_id: e.value,
                    supplier_id: "",
                });
            } else if (e.value.split("-")[0] === "supplier") {
                setNewPO({
                    ...newPO,
                    vendor_id: "",
                    supplier_id: e.value,
                });
            }
        } else if (e.name === "branch_id") {
            setBranchValue({ name: e.name, label: e.label, value: e.value });
            var address = branchList.filter((data) => data.value === e.value)[0]
                .address;
            setNewPO({
                ...newPO,
                delivery_address: address !== null ? address : "",
                branch_id: e.value,
            });
        } else {
            setForwardersValue({
                name: e.name,
                label: e.label,
                value: e.value,
            });
        }
    }

    function handleSelectItemChange(e, id) {
        setItemsValue({
            name: e.name,
            label: e.label,
            value: e.value,
            content: e.content,
        });
        setShowLoader(true);
        var ingredient_id = e.content.split("|")[0];
        var unit_id = e.content.split("|")[1];
        var unit = e.content.split("|")[2];
        var qty =
            e.content.split("|")[3] === "null"
                ? 0
                : parseFloat(e.content.split("|")[3]);
        var price =
            e.content.split("|")[4] === "null"
                ? 0
                : parseFloat(e.content.split("|")[4]);
        var current_qty =
            e.content.split("|")[5] === "null"
                ? 0
                : parseFloat(e.content.split("|")[5]);

        items.map((item, index) => {
            if (index === id) {
                item["item_id"] = ingredient_id;
                item["qty"] = qty;
                item["current_qty"] = current_qty;
                item.unit = unit;
                item["price"] = price;

                item.amount = item.qty * item.price;
            }
        });

        newPO.grand_total = items
            .map((item) => item.amount)
            .reduce((a, b) => a + b, 0);
        setTimeout(() => setShowLoader(false), 1);
    }

    function handlePOChange(e) {
        const { name, value } = e.target;

        if (name === "branch_id") {
            var address = branchList.filter((data) => data.id === value)[0]
                .address;
            setNewPO({
                ...newPO,
                delivery_address: address !== null ? address : "",
                branch_id: value,
            });
        } else {
            setNewPO({ ...newPO, [name]: value });
        }

        if (name === "service_fee" || name === "discount" ) {
            setIsChanged(!isChanged);
        }
    }

    async function savePO() {
        newPO.is_save = 1;
        newPO.status = "pending";
        if (isSaveClicked || isSubmitClicked) {
            return;
        }
        setIsSaveClicked(true);
        if (shopType === "mango") {
            const response = await createPurchaseOrder(newPO, items);
            if (response.status === 200) {
                toast.success("Purchase Order Saved Successfully!", {
                    style: toastStyle(),
                });
                setTimeout(() => navigate("/purchaseorders"), 1000);
            } else {
                setIsSaveClicked(false);
                TokenExpiry(response);
                toast.error("Error Saving Purchase Order", {
                    style: toastStyle(),
                });
            }
        } else if (shopType === "potato") {
            const response = await createPurchaseOrderPotato(newPO, items);
            if (response.status === 200) {
                toast.success("Purchase Order Saved Successfully!", {
                    style: toastStyle(),
                });
                setTimeout(() => navigate("/purchaseorders"), 1000);
            } else {
                setIsSaveClicked(false);
                TokenExpiry(response);
                toast.error("Error Saving Purchase Order", {
                    style: toastStyle(),
                });
            }
        }
    }

    async function submitPO() {
        newPO.is_save = 0;
        newPO.status = "for approval";
        var hasItems = items.length > 0 ? true : false;
        var hasItemContent = hasItems
            ? items[0].qty != "" &&
              items[0].unit != "" &&
              items[0].qty != "0" &&
              items[0].unit != 0
            : false;
        isError["POItems"] = !(hasItems && hasItemContent);
        if (isSaveClicked || isSubmitClicked) {
            return;
        }
        if (validateAddPO(newPO, items, setIsError) && !isError.POItems) {
            setIsSubmitClicked(true);
            if (shopType === "mango") {
                const response = await createPurchaseOrder(newPO, items);
                if (response.status === 200) {
                    toast.success("Purchase Order Created Successfully!", {
                        style: toastStyle(),
                    });
                    setTimeout(
                        () =>
                            navigate(
                                "/purchaseorders/review/0/mango/mango - " +
                                    response.data.purchase_id
                            ),
                        1000
                    );
                } else {
                    setIsSubmitClicked(false);
                    TokenExpiry(response);
                    toast.error("Error Creating Purchase Order", {
                        style: toastStyle(),
                    });
                }
            } else {
                const response = await createPurchaseOrderPotato(newPO, items);
                if (response.status === 200) {
                    toast.success("Purchase Order Created Successfully!", {
                        style: toastStyle(),
                    });
                    setTimeout(
                        () =>
                            navigate(
                                "/purchaseorders/review/0/potato/potato - " +
                                    response.data.purchase_id
                            ),
                        1000
                    );
                } else {
                    setIsSubmitClicked(false);
                    TokenExpiry(response);
                    toast.error("Error Creating Purchase Order", {
                        style: toastStyle(),
                    });
                }
            }
        } else {
            toast.error("Please fill in all fields", {
                style: toastStyle(),
            });
        }
    }

    React.useEffect(() => {
        fetchSuppliers();
        fetchForwarders();
        fetchIngredients();
        fetchBranches();
        fetchEmployees();
    }, []);

    React.useEffect(() => {
        fetchItems();
    }, [branchValue]);

    React.useEffect(() => {
        if (state) {
            var initialOrders = state.purchased_items.map((item) => {
                var info = {};
                info.item_id = parseInt(item.item_id);
                info.qty = (
                    parseFloat(item.max) - parseFloat(item.current_qty)
                ).toString();
                info.item_name = item.item_name;
                info.current_qty = item.current_qty;
                info.unit = item.item_unit_id;
                info.inventory_unit_name = item.inventory_unit_name;
                info.price = item.price || "0";
                info.amount = (
                    parseFloat(info.qty) * parseFloat(info.price)
                ).toString();
                // info.remarks = "";
                info.isReadOnly = true;

                return info;
            });

            setItems(initialOrders);
            setBranchValue({
                name: "branch_id",
                label: state.branch_name,
                value: state.branch_id,
            });
            var _grandTotal = initialOrders
                .map((item) => parseFloat(item.amount))
                .reduce((a, b) => a + b, 0);
            setNewPO({
                grand_total: _grandTotal,
                branch_id: state.branch_id,
                delivery_address:
                    "Tacloban City Ice Plant, 164 Justice Romualdez St. Tacloban City, Leyte",
                purchase_date: new Date().toLocaleDateString("en-CA"),
                delivery_date: new Date().toLocaleDateString("en-CA"),
            });
        }
    }, []);

    useEffect(() => {
        var tempServiceFee = newPO.service_fee
            ? parseFloat(newPO.service_fee)
            : 0;

        var tempDiscount = newPO.discount
            ? parseFloat(newPO.discount)
            : 0;

        var _subtotal = items
            .map((item) => parseFloat(item.amount))
            .reduce((a, b) => a + b, 0);

        var _grandTotal = (_subtotal + tempServiceFee) - tempDiscount;
        setNewPO((prev) => {
            return {
                ...prev,
                subtotal: _subtotal.toFixed(2),
                grand_total: _grandTotal.toFixed(2),
            };
        });
    }, [isChanged]);

    return (
        <div>
            <Toaster position="top-right" reverseOrder={false} />
            <div className="page">
                <Navbar
                    onCollapse={(inactive) => {
                        setInactive(inactive);
                    }}
                    active={"PURCHASES"}
                />
            </div>
            <div className={`container ${inactive ? "inactive" : "active"}`}>
                <div className="row">
                    <h1 className="page-title mb-4">ADD PURCHASE ORDER</h1>
                </div>

                {/* content */}
                <div className="edit-form">
                    <Row className="pt-3 mb-2">
                        <Col xs={6}>
                            <span className="edit-label">
                                Supplier Name{" "}
                                <label className="badge-required">{` *`}</label>
                            </span>
                        </Col>
                        <Col xs={3}>
                            <span className="edit-label">
                                Purchase Date{" "}
                                <label className="badge-required">{` *`}</label>
                            </span>
                        </Col>
                        <Col xs={3}>
                            <span className="edit-label">
                                Delivery Date{" "}
                                <label className="badge-required">{` *`}</label>
                            </span>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={6}>
                            <Select
                                className="react-select-container"
                                classNamePrefix="react-select"
                                placeholder="Select Supplier..."
                                value={suppliersValue}
                                options={suppliers}
                                onChange={(e) => handleSelectChange(e)}
                            />
                            <InputError
                                isValid={isError.supplierName}
                                message={"Supplier Name is required"}
                            />
                            <div className="d-flex justify-content-end">
                                <span
                                    className="edit-label"
                                    style={{ color: "#df1227" }}
                                >
                                    Supplier Not Found?{" "}
                                    <a
                                        onClick={handleShowAddSupplierModal}
                                        className="add-supplier-label"
                                    >
                                        Click here to add supplier
                                    </a>
                                </span>
                            </div>
                        </Col>

                        <Col xs={3}>
                            <Form.Control
                                type="date"
                                name="purchase_date"
                                className="nc-modal-custom-text"
                                value={newPO.purchase_date}
                                onChange={(e) => handlePOChange(e)}
                            />
                            <InputError
                                isValid={isError.purchaseDate}
                                message={"Purchase date is required"}
                            />
                            <div className="d-flex justify-content-end">
                                <span
                                    className="edit-label"
                                    style={{ color: "white" }}
                                >{` -`}</span>
                            </div>
                        </Col>
                        <Col xs={3}>
                            <Form.Control
                                type="date"
                                name="delivery_date"
                                className="nc-modal-custom-input"
                                defaultValue={newPO.delivery_date}
                                onChange={(e) => handlePOChange(e)}
                            />
                            <InputError
                                isValid={isError.deliveryDate}
                                message={"delivery date is required"}
                            />
                            <div className="d-flex justify-content-end">
                                <span
                                    className="edit-label"
                                    style={{ color: "white" }}
                                >{` -`}</span>
                            </div>
                        </Col>
                    </Row>

                    <Row>
                        <Col xs={4}>
                            <span className="edit-label ">Branch</span>
                        </Col>
                        <Col xs={4}>
                            <span className="edit-label">Forwarder</span>
                        </Col>
                        <Col xs={4}>
                            <span className="edit-label">
                                Requested by{" "}
                                <label className="badge-required">{` *`}</label>
                            </span>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={4}>
                            <Select
                                className="react-select-container"
                                classNamePrefix="react-select"
                                placeholder="Select Branch..."
                                value={branchValue}
                                options={branchList}
                                onChange={(e) => handleSelectChange(e)}
                            />
                        </Col>
                        <Col xs={4}>
                            <Select
                                className="react-select-container"
                                classNamePrefix="react-select"
                                placeholder="Select Forwarder..."
                                value={forwardersValue}
                                options={forwarders}
                                onChange={(e) => handleSelectChange(e)}
                            />
                        </Col>
                        <Col xs={4}>
                            <Select
                                className="react-select-container"
                                classNamePrefix="react-select"
                                placeholder="Select Employee..."
                                value={newPO.requisitioner}
                                options={employees}
                                onChange={(e) =>
                                    handleSelectChange(e, "requisitioner")
                                }
                            />
                            <InputError
                                isValid={isError.requisitioner}
                                message={"requisitioner is required"}
                            />
                        </Col>
                    </Row>

                    <Row className="mt-4 mb-2">
                        <Col xs={7}>
                            <span className="edit-label">
                                Delivery Address{" "}
                                <label className="badge-required">{` *`}</label>
                            </span>
                            <br />
                        </Col>
                        <Col xs={5}>
                            <span className="edit-label">
                                Remarks
                                <span className="edit-optional px-2">
                                    (Optional)
                                </span>
                            </span>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={7}>
                            <Form.Control
                                type="text"
                                name="delivery_address"
                                className="nc-modal-custom-input"
                                value={newPO.delivery_address}
                                onChange={(e) => handlePOChange(e)}
                            />
                            <InputError
                                isValid={isError.deliveryAddress}
                                message={"delivery address is required"}
                            />
                        </Col>
                        <Col xs={5}>
                            <Form.Control
                                type="text"
                                name="remarks"
                                className="nc-modal-custom-input"
                                onChange={(e) => handlePOChange(e)}
                            />
                        </Col>
                    </Row>
                    <Row className="mt-4 pt-3">
                        <span className="edit-label mb-2">
                            Purchased Items{" "}
                            <label className="badge-required">{` *`}</label>
                        </span>
                        <div className="edit-purchased-items">
                            {items.length === 0 ? (
                                <span>No Purchased Item Found!</span>
                            ) : (
                                renderTable()
                            )}
                            <InputError
                                isValid={isError.POItems}
                                message={
                                    "You must add at least 1 purchased item"
                                }
                            />
                        </div>
                        <div className="d-flex justify-content-end">
                            <span
                                className="edit-label"
                                style={{ color: "#df1227" }}
                            >
                                Item Not Found?{" "}
                                <a
                                    onClick={handleAddItem}
                                    className="add-supplier-label"
                                >
                                    Click here to add item
                                </a>
                            </span>
                        </div>
                    </Row>
                    <Row className="pt-3 PO-add-item">
                        <Button
                            type="button"
                            onClick={() => AddItem()}
                            disabled={branchValue.value === "" ? true : false}
                        >
                            Add Item
                        </Button>
                    </Row>

                    <Row className="align-right pt-3">
                            <Col xs={2} className="text-end">
                                <span className="edit-label color-gray">
                                    Subtotal
                                </span>
                            </Col>
                            <Col xs={1} className="text-end">
                                <span className="edit-label align-middle">
                                    PHP
                                </span>
                            </Col>
                            <Col xs={3} className="text-end">
                                <span className="edit-label align-middle">
                                    {numberFormat(newPO.subtotal)}
                                </span>
                            </Col>
                        </Row>
                    <Row className="align-right pt-3">
                        <Col xs={2} className="text-end">
                            <span className="edit-label color-gray">
                                Delivery/Service Fee
                            </span>
                        </Col>
                        <Col xs={1} className="text-end">
                            <span className="edit-label align-middle">PHP</span>
                        </Col>
                        <Col xs={3}>
                            <Form.Control
                                type="number"
                                name="service_fee"
                                min={0}
                                step="0.01"
                                className="align-middle nc-modal-custom-text"
                                onChange={(e) => handlePOChange(e)}
                            />
                        </Col>
                    </Row>

                    <Row className="align-right pt-3">
                        <Col xs={2} className="text-end">
                            <span className="edit-label color-gray">
                                Discount
                            </span>
                        </Col>
                        <Col xs={1} className="text-end">
                            <span className="edit-label align-middle">PHP</span>
                        </Col>
                        <Col xs={3}>
                            <Form.Control
                                type="number"
                                name="discount"
                                min={0}
                                step="0.01"
                                className="align-middle nc-modal-custom-text"
                                onChange={(e) => handlePOChange(e)}
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
                                {"PHP " + numberFormat(newPO.grand_total)} 
                            </span>
                        </Col>
                    </Row>
                    
                    <div className="d-flex justify-content-end pt-5 pb-3">
                        <button
                            type="button"
                            className="button-secondary me-3"
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </button>

                        {isSaveClicked ? (
                            <div className="button-tertiary me-3 d-flex justify-content-center">
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
                                className="button-tertiary me-3"
                                onClick={() => savePO()}
                            >
                                Save
                            </button>
                        )}
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
                                onClick={submitPO}
                            >
                                Submit
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <AddModal
                title="SUPPLIER"
                show={showAddSupplierModal}
                onHide={handleCloseAddSupplierModal}
                onSave={handleAddSupplier}
            >
                <div className="mt-3 edit-form">
                    <Row className="nc-modal-custom-row mt-0">
                        <Col>
                            BIR NAME{" "}
                            <label className="badge-required">{` *`}</label>
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
                                required
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
                                required
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
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col>
                            TIN NUMBER{" "}
                            <label className="badge-required">{` *`}</label>
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
                                required
                            />
                        </Col>
                        <Col>
                            BIR NUMBER
                            <Form.Control
                                type="text"
                                name="bir_number"
                                className="nc-modal-custom-input"
                                required
                            />
                        </Col>
                        <Col xl={3}>
                            TERM (DAYS){" "}
                            <label className="badge-required">{` *`}</label>
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
                            />
                        </Col>
                        <Col xl={5}>
                            PRIMARY ACCOUNT NAME
                            <Form.Control
                                type="text"
                                name="primary_account_name"
                                className="nc-modal-custom-input"
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
                            />
                        </Col>
                        <Col xl={5}>
                            ALTERNATE ACCOUNT NAME
                            <Form.Control
                                type="text"
                                name="alternate_account_name"
                                className="nc-modal-custom-input"
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
                    <Row className="m-divider mt-3 mb-3"></Row>
                    <Row className="nc-modal-custom-row">
                        <Col>
                            REQUIREMENTS
                            <Form.Control
                                type="file"
                                multiple
                                name="requirements"
                                className="nc-modal-custom-input"
                                required
                            />
                        </Col>
                    </Row>
                </div>
            </AddModal>
        </div>
    );
}
