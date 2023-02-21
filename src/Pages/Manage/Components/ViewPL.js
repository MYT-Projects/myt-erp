import React, { useState, useEffect } from "react";
import { Button, Col, Form, Row, Table, Tab, Tabs } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../Components/Navbar/Navbar";
import trash from "../../../Assets/Images/trash.png";
import Select from "react-select";
import "./PL.css";
import {
    numberFormat,
    refreshPage,
    toastStyle,
    TokenExpiry,
} from "../../../Helpers/Utils/Common";
import toast from "react-hot-toast";
import {  getPriceLevel, updatePriceLevel, deletePriceLevel } from "../../../Helpers/apiCalls/Manage/PriceLevels";

import DeleteModal from "../../../Components/Modals/DeleteModal";
import InputError from "../../../Components/InputError/InputError";
import { validatePriceLevel } from "../../../Helpers/Validation/Manage/PriceLevelValidation";
import { updatePriceLevelPotato, deletePriceLevelPotato } from "../../../Helpers/apiCalls/PotatoCorner/Manage/PriceLevels";
import ReactLoading from "react-loading";

export default function ViewPriceLevel(props) {

    /**
     *  @id - param for edit cash out form
     *  @destination - param for targetapi
     */
     const { id, destination } = useParams();

     // MODALS //
    // DELETE
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const handleShowDeleteModal = () => setShowDeleteModal(true);
    const handleCloseDeleteModal = () => setShowDeleteModal(false);

    let navigate = useNavigate();
    const [inactive, setInactive] = useState(false);
    const [commissionRates, setCommissionRates] = useState({});
    const [priceLevel, setPriceLevel] = useState({});
    const [name, setName] = useState('');
    const [isClicked, setIsClicked] = useState(false);
    const [storeSet,setStoreSet] = useState([{title: "store", eventKey: "store", has_commission: false}, {title: "foodpanda", eventKey: "foodpanda", has_commission: true}, {title: "grabfood", eventKey: "grabfood", has_commission: true}]); //preparation for future change

    //modify this function in the future
    function repackage_data(){
        var price_level_package = {"name": name, "names": []};
        price_level_package["names"] = storeSet.map((store) => store.eventKey);
        price_level_package["commission_rates"] = [];
        price_level_package["names"].forEach((name) => {
            price_level_package["commission_rates"].push(commissionRates[name]);
        })
        price_level_package["product_ids_0"] = []
        priceLevel[price_level_package.names[0]].forEach((product) => {
            product.variant.forEach((product_variant) => price_level_package["product_ids_0"].push(product_variant.id));
        })
        price_level_package["product_ids_1"] = []
        priceLevel[price_level_package.names[1]].forEach((product) => {
            product.variant.forEach((product_variant) => price_level_package["product_ids_1"].push(product_variant.id));
        })
        price_level_package["product_ids_2"] = []
        priceLevel[price_level_package.names[2]].forEach((product) => {
            product.variant.forEach((product_variant) => price_level_package["product_ids_2"].push(product_variant.id));
        })
        price_level_package["prices_0"] = [];
        priceLevel[price_level_package.names[0]].forEach((product) => {
            product.variant.forEach((product_variant) => price_level_package["prices_0"].push(product_variant.price === null ? "0.00" : numberFormat(product_variant.price)));
        })
        price_level_package["prices_1"] = [];
        priceLevel[price_level_package.names[1]].forEach((product) => {
            product.variant.forEach((product_variant) => price_level_package["prices_1"].push(product_variant.price === null ? "0.00" : numberFormat(product_variant.price)));
        })
        price_level_package["prices_2"] = [];
        priceLevel[price_level_package.names[2]].forEach((product) => {
            product.variant.forEach((product_variant) => price_level_package["prices_2"].push(product_variant.price === null ? "0.00" : numberFormat(product_variant.price)));
        })
        return price_level_package;
    }

    async function add() {
        const packaged_price_level = repackage_data();
        if (validatePriceLevel(packaged_price_level, setIsError)) {
            if (destination === "mango") {
                const response = await updatePriceLevel(id, packaged_price_level);
                if (response.data.status === 200) {
                    toast.success("Price Level edited Successfully!", {
                        style: toastStyle(),
                    });
                    setTimeout(() => navigate("/pricelevels"), 1000);
                } else {
                    toast.error("Error editing price level", {
                        style: toastStyle(),
                    });
                    setTimeout(() => refreshPage(), 1000);
                }
            } else if (destination === "potato") {
                const response = await updatePriceLevelPotato(id, packaged_price_level);
                if (response.data.status === 200) {
                    toast.success("Price Level edited Successfully!", {
                        style: toastStyle(),
                    });
                    setTimeout(() => navigate("/pricelevels"), 1000);
                } else {
                    toast.error("Error editing price level", {
                        style: toastStyle(),
                    });
                }
            }
        } else {
            setIsClicked(false);
            toast.error(
                "Please fill in all fields",
                { style: toastStyle() }
            );
        }
    }

    async function del() {
        if (destination=== "mango") {
            const response = await deletePriceLevel(id);
            if (response.data) {
                toast.success("Successfully deleted price level!", {
                    style: toastStyle(),
                });
                handleCloseDeleteModal();
                setTimeout(() => navigate("/pricelevels"), 1000);
            } else {
                toast.error(response.error.data.messages.error, {
                    style: toastStyle(),
                });
            }
        } else if (destination === "potato") {
            const response = await deletePriceLevelPotato(id);
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

    //ERROR HANDLING
    const [isError, setIsError] = useState({
        name: false,
    });


    useEffect(() => {
        fetchPriceLevels();
    }, []);
    

    async function fetchPriceLevels(){
        const response = await getPriceLevel(id);
        if (response) {
            if (response.data.status === "404") {
                toast.error(response.data.response, {
                    style: toastStyle(),
                });
                setTimeout(() => navigate('/pricelevels/'), 1000);
            } else if (response.data.data.status === "success") {
                const data = response.data.data.data;
                setFetchedName(data);
                setFetchedCommissionRates(data);
                setFetchedPriceLevels(data);
            }
        } else {
            var errMsg = response.error;
            toast.error(errMsg, { style: toastStyle() });
        }
        return
    }

    function setFetchedName(data){
        setName(data.name);
    }

    function setFetchedCommissionRates(data){
        data.price_level_types.forEach((price_level_type) => {
            setCommissionRates((prev) => {
                var tmp = structuredClone(prev)
                tmp[price_level_type.name] = price_level_type.commission_rate;
                return {...tmp}
            })
        })
    }

    function setFetchedPriceLevels(data){
        var price_levels = {}
        data.price_level_types.forEach((price_level_type) => {
            price_levels[price_level_type.name] = price_level_type.products;
        })

        setPriceLevel(price_levels);
    }

  

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
                    <Col xl={6}>
                    <h1 className="page-title mb-4">
                        EDIT PRICE LEVEL{" "}
                        {destination === "mango_magic" && "TO MANGO MAGIC"}
                        {destination === "potato_corner" && "TO POTATO CORNER"}
                    </h1>
                    </Col>

                    </Row>
                    <Row>
                    <Col className="nc-modal-custom-row mt-0 mb-4" xs={5}>
                        PRICE LEVEL NAME
                        <Form.Control
                            type="text"
                            name="name"
                            placeholder="Price Level Name"
                            value={name}
                            className="nc-modal-custom-input"
                            onChange={(e) => {setName(e.target.value)}}
                            disabled
                        />
                        <InputError
                            isValid={isError.name}
                            message={"Price level name is required"}
                        />
                    </Col>
                </Row>
                <Tabs defaultActiveKey="store" id="PL-tabs">
                    {storeSet.map((store) => {
                        return (
                            <Tab eventKey={store.eventKey} title={store.title} className="p-3">
                                {store.has_commission ? 
                                     (
                                        <Row className="mt-2 me-3 mb-5">
                                            <Col xs={2}>
                                            INITIAL COMISSION RATE:
                                            </Col>
                                            
                                            <Col className="text-capitalize nc-modal-custom-row-green-not-bold" xs={2}>
                                                <Form.Control
                                                    min={0}
                                                    type="number"
                                                    value={
                                                        commissionRates[store.eventKey]
                                                    }
                                                    defaultValue= "0.00"
                                                    name={store.eventKey + " - COMMISSION RATES"}
                                                    className="nc-modal-custom-input-number"
                                                    onChange={(e) =>
                                                        setCommissionRates((prev) => {
                                                            var tmp = structuredClone(commissionRates);
                                                            tmp[store.eventKey] = e.target.value;
                                                            return {...tmp}
                                                        })
                                                    }
                                                    required
                                                    disabled
                                                />
                                            </Col>

                                        </Row>
                                     )
                                     
                                     :""   
                                        
                                    }
                                <div className="product-tab">
                                {/* {console.log(priceLevel)} */}
                                {Object.keys(priceLevel).length > 0 ? priceLevel[store.eventKey].map((product, product_index) => {
                                    //   <Row className="nc-modal-custom-row-view mt-4 ms-2 mb-4">
                                    return (
                                            <Col className="me-3 product-container">
                                                {product.product_name}
                                                <Row className="container-wrapper align-left mt-3 me-3 mb-3">
                                                    {/* {console.log(product.variant)} */}
                                                    {product.variant.map((product_variant, product_variant_index) => {
                                                        return (<Row className="mt-2 me-3 mb-2">
                                                            <Col className="text-capitalize nc-modal-custom-row-green-not-bold ms-4">
                                                                {product_variant.name}
                                                            </Col>
                                                            <Col>
                                                                <Form.Control
                                                                    // defaultValue=".00"
                                                                    min={0}
                                                                    type="number"
                                                                    value={
                                                                        priceLevel[store.eventKey][product_index].variant[product_variant_index].price
                                                                    }
                                                                    defaultValue= "0.00"
                                                                    name={product.product_name + " - " + product_variant.name}
                                                                    className="nc-modal-custom-input-number"
                                                                    onChange={(e) =>
                                                                        setPriceLevel((prev) => {
                                                                            // console.log(priceLevel[store.eventKey][product_index].variant[product_variant_index].price);
                                                                            // console.log(e.target.value);
                                                                            // console.log({...prev});
                                                                            var temp_price = structuredClone(priceLevel);
                                                                            temp_price[store.eventKey][product_index].variant[product_variant_index].price = e.target.value;
                                                                            // console.log("tmp");
                                                                            // console.log(temp_price);
                                                                            return {...temp_price}
                                                                        })
                                                                    }
                                                                    required
                                                                    disabled
                                                                />
                                                            </Col>
                                                        </Row>)

                                                    }
                                                    )}
                                                </Row>
                                            </Col>
                                        
                                    );
                                }):(<Row className="nc-modal-custom-row-view mt-4 ms-2 mb-4">No Data</Row>)}
                            </div></Tab>
                        )
                        
                    }
                    )
                }

                </Tabs>
                <div className="d-flex justify-content-end mt-3">
                    <button
                        type="button"
                        className="button-secondary me-3"
                        onClick={() => navigate("/pricelevels")}
                    >
                        Cancel
                    </button>
                    {isClicked ? (
                            <div className="button-warning-fill d-flex justify-content-center">
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
                                className="button-warning-fill me-3 justify-content-center"
                                onClick={handleShowDeleteModal}
                            >
                                Delete
                            </button>
                        )}
                    <button
                        type="button"
                        className="button-tertiary me-3"
                        onClick={() => {setTimeout(() => navigate('/pricelevels/edit/' + id + "/" + destination + "/"), 1000);}}
                    >
                        Edit
                    </button>
                    <DeleteModal
						show={showDeleteModal}
						onHide={() => handleCloseDeleteModal()}
						text="price level"
						onDelete={() => del()}
					/>
                </div>
            </div>
        </div>
    );
}
