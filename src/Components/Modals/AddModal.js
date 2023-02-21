import {
    Modal,
    Button,
    Form,
    Container,
    Row,
    Col,
    Table,
} from "react-bootstrap";
import React, { useState } from "react";
// import { render } from "react-dom";
import trash from "../../Assets/Images/trash.png";
import ReactLoading from "react-loading";
//css
import "./Modal.css";

function AddSupplier() {
    return (
        <Container className="modal-cont">
            <Row className="nc-modal-custom-row">
                <Col>
                    COMPANY NAME
                    <Form.Control
                        type="text"
                        name="company name"
                        // value = {data.response.companyname} **SAMPLE**
                        className="nc-modal-custom-input"
                        // onChange={(e) => handleAddChange(e)}
                        required
                    />
                </Col>
                <Col xl={3}>
                    COUNTRY
                    <Form.Control
                        type="text"
                        name="country"
                        className="nc-modal-custom-input"
                        // onChange={(e) => handleAddChange(e)}
                        required
                    />
                </Col>
                <Col>
                    STATE/PROVINCE
                    {/* <select className="nc-modal-custom-input">
            <option value="grapefruit">Grapefruit</option>
            <option value="lime">Lime</option>
            <option selected value="coconut">
              Coconut
            </option>
            <option value="mango">Mango</option>
          </select> */}
                    <Form.Control
                        type="text"
                        name="state/province"
                        className="nc-modal-custom-input"
                        // onChange={(e) => handleAddChange(e)}
                        required
                    />
                </Col>
            </Row>
            <Row className="nc-modal-custom-row">
                <Col xl={5}>
                    ADDRESS
                    <Form.Control
                        type="text"
                        name="address"
                        className="nc-modal-custom-input"
                        // onChange={(e) => handleAddChange(e)}
                        required
                    />
                </Col>
                <Col>
                    CITY
                    <Form.Control
                        type="text"
                        name="city"
                        className="nc-modal-custom-input"
                        // onChange={(e) => handleAddChange(e)}
                        required
                    />
                </Col>
                <Col>
                    ZIP CODE
                    {/* <select className="nc-modal-custom-input">
            <option value="grapefruit">Grapefruit</option>
            <option value="lime">Lime</option>
            <option selected value="coconut">
              Coconut
            </option>
            <option value="mango">Mango</option>
          </select> */}
                    <Form.Control
                        type="text"
                        name="zip code"
                        className="nc-modal-custom-input"
                        // onChange={(e) => handleAddChange(e)}
                        required
                    />
                </Col>
            </Row>
            <Row className="nc-modal-custom-row">
                <Col xl={3}>
                    TIN NUMBER
                    <Form.Control
                        type="text"
                        name="company name"
                        className="nc-modal-custom-input"
                        // onChange={(e) => handleAddChange(e)}
                        required
                    />
                </Col>
                <Col xl={3}>
                    BIR NUMBER
                    <Form.Control
                        type="text"
                        name="country"
                        className="nc-modal-custom-input"
                        // onChange={(e) => handleAddChange(e)}
                        required
                    />
                </Col>
                <Col>
                    COMPANY EMAIL
                    {/* <select className="nc-modal-custom-input">
            <option value="grapefruit">Grapefruit</option>
            <option value="lime">Lime</option>
            <option selected value="coconut">
              Coconut
            </option>
            <option value="mango">Mango</option>
          </select> */}
                    <Form.Control
                        type="text"
                        name="state/province"
                        className="nc-modal-custom-input"
                        // onChange={(e) => handleAddChange(e)}
                        required
                    />
                </Col>
            </Row>
            <Row className="nc-modal-custom-row">
                <Col xl={4}>
                    CONTACT PERSON
                    <Form.Control
                        type="text"
                        name="contact person"
                        className="nc-modal-custom-input"
                        // onChange={(e) => handleAddChange(e)}
                        required
                    />
                </Col>
                <Col xl={4}>
                    PHONE NUMBER
                    <Form.Control
                        type="text"
                        name="phone number"
                        className="nc-modal-custom-input"
                        // onChange={(e) => handleAddChange(e)}
                        required
                    />
                </Col>
            </Row>
        </Container>
    );
}

function AddBank() {
    return (
        <Container className="modal-cont">
            <Row className="nc-modal-custom-row">
                <Col>
                    BANK NAME
                    <Form.Control
                        type="text"
                        name="bank-name"
                        className="nc-modal-custom-input"
                        // onChange={(e) => handleAddChange(e)}
                        required
                    />
                </Col>
                <Col>
                    Print Template
                    <select className="nc-modal-custom-select">
                        <option selected value={"select"}>
                            Select
                        </option>
                        <option value="BDO">BDO</option>
                        <option value="BPI">BPI</option>
                        <option value="coconut">AUB</option>
                        <option value="mango">Metrobank</option>
                    </select>
                </Col>
            </Row>
        </Container>
    );
}

function AddBranch() {
    return (
        <Container className="modal-cont">
            <Row className="nc-modal-custom-row">
                <Col>
                    BRANCH NAME
                    <Form.Control
                        type="text"
                        name="branch_name"
                        // value={branchesMockData.branch_name}
                        // value = {data.response.companyname} **SAMPLE**
                        className="nc-modal-custom-input"
                        // onChange={(e) => handleAddChange(e)}
                        required
                    />
                </Col>
                <Col>
                    ADDRESS
                    <Form.Control
                        type="text"
                        name="address"
                        className="nc-modal-custom-input"
                        // onChange={(e) => handleAddChange(e)}
                        required
                    />
                </Col>
                <Col xl={3}>
                    PHONE NUMBER
                    <Form.Control
                        type="text"
                        name="phone_number"
                        className="nc-modal-custom-input"
                        // onChange={(e) => handleAddChange(e)}
                        required
                    />
                </Col>
            </Row>
            <Row className="nc-modal-custom-row">
                <Col>
                    FRANCHISEE
                    <Form.Control
                        type="text"
                        name="franchisee"
                        className="nc-modal-custom-input"
                        // onChange={(e) => handleAddChange(e)}
                        required
                    />
                </Col>
                <Col>
                    FRANCHISEE CONTACT NO.
                    <Form.Control
                        type="text"
                        name="franchisee_contact_no"
                        className="nc-modal-custom-input"
                        // onChange={(e) => handleAddChange(e)}
                        required
                    />
                </Col>
            </Row>
            <Row className="nc-modal-custom-row">
                <Col xl={3}>
                    TIN NUMBER
                    <Form.Control
                        type="text"
                        name="tin_number"
                        className="nc-modal-custom-input"
                        // onChange={(e) => handleAddChange(e)}
                        required
                    />
                </Col>
                <Col xl={3}>
                    BIR NUMBER
                    <Form.Control
                        type="text"
                        name="bir_number"
                        className="nc-modal-custom-input"
                        // onChange={(e) => handleAddChange(e)}
                        required
                    />
                </Col>
                <Col xl={3}>
                    CONTRACT START
                    <Form.Control
                        type="date"
                        name="contract_start"
                        className="nc-modal-custom-input"
                        // onChange={(e) => handleAddChange(e)}
                        required
                    />
                </Col>
                <Col xl={3}>
                    CONTRACT END
                    <Form.Control
                        type="date"
                        name="contract_end"
                        className="nc-modal-custom-input"
                        // onChange={(e) => handleAddChange(e)}
                        required
                    />
                </Col>
            </Row>
            <Row className="nc-modal-custom-row">
                <Col xl={3}>
                    OPENING DATE
                    <Form.Control
                        type="date"
                        name="opening_date"
                        className="nc-modal-custom-input"
                        // onChange={(e) => handleAddChange(e)}
                        required
                    />
                </Col>
                <Col>
                    CONTACT PERSON
                    <Form.Control
                        type="text"
                        name="contact_person"
                        className="nc-modal-custom-input"
                        // onChange={(e) => handleAddChange(e)}
                        required
                    />
                </Col>
                <Col>
                    CONTACT PERSON PHONE NUMBER
                    <Form.Control
                        type="text"
                        name="phone_number"
                        className="nc-modal-custom-input"
                        // onChange={(e) => handleAddChange(e)}
                        required
                    />
                </Col>
            </Row>
        </Container>
    );
}

function AddIngredient() {
    const [ingredients, setIngredients] = useState([{ unit: "", cost: 0 }]);

    function handleRemoveIngredient(id) {
        const rowId = id;
        const newIngredientList = [...ingredients];
        newIngredientList.splice(rowId, 1);
        setIngredients(newIngredientList);
    }

    function AddIngredientBtn() {
        const newIngredient = { unit: "", cost: 0 };
        setIngredients((prevIngredients) => [
            ...prevIngredients,
            newIngredient,
        ]);
    }

    function handleIngredientChange(e, id) {
        const { name, value } = e.target;
        ingredients.map((ingredient, index) => {
            if (index === id) {
                ingredient[name] = value;
            }
        });
    }

    function renderTable() {
        return (
            <Table>
                <thead>
                    <tr>
                        <th>Unit</th>
                        <th>Cost</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {ingredients.map((ingredient, index) => {
                        return (
                            <tr>
                                <td>
                                    <Form.Control
                                        type="text"
                                        name="unit"
                                        defaultValue={ingredient.unit}
                                        onChange={(e) =>
                                            handleIngredientChange(e, index)
                                        }
                                    />
                                </td>
                                <td className="row align-contents">
                                    <Col className="align-middle">PHP</Col>
                                    <Col>
                                        <Form.Control
                                            type="number"
                                            name="cost"
                                            defaultValue={ingredient.cost}
                                            onChange={(e) =>
                                                handleIngredientChange(e, index)
                                            }
                                        />
                                    </Col>
                                </td>
                                <td>
                                    <div className="align-middle">
                                        <img
                                            src={trash}
                                            alt="delete"
                                            onClick={() =>
                                                handleRemoveIngredient(index)
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

    return (
        <Container className="mb-5">
            <Row className="nc-modal-custom-row">
                <Col>
                    INGREDIENT NAME
                    <Form.Control
                        type="text"
                        name="ingredient_name"
                        // value = {data.response.companyname} **SAMPLE**
                        className="nc-modal-custom-input"
                        // onChange={(e) => handleAddChange(e)}
                        required
                    />
                </Col>
                <Col>
                    INGREDIENT DETAILS
                    <Form.Control
                        type="text"
                        name="address"
                        className="nc-modal-custom-input"
                        // onChange={(e) => handleAddChange(e)}
                        required
                    />
                </Col>
            </Row>
            <Row className="nc-modal-custom-row">
                <Col>INGREDIENT'S LIST</Col>
            </Row>
            <Row className="nc-modal-custom-row-box">
                <div className="edit-purchased-items">
                    {ingredients.length === 0 ? (
                        <span>No Ingredients Found!</span>
                    ) : (
                        renderTable()
                    )}
                </div>
            </Row>
            <Row className="pt-3 PO-add-item">
                <Button type="button" onClick={() => AddIngredientBtn()}>
                    Add Ingredient
                </Button>
            </Row>
        </Container>
    );
}

function AddUser() {
    return (
        <Container>
            <Row className="nc-modal-custom-row">
                <Col xl={4}>
                    FIRST NAME
                    <Form.Control
                        type="text"
                        name="first-name"
                        // value = {data.response.companyname} **SAMPLE**
                        className="nc-modal-custom-input"
                        // onChange={(e) => handleAddChange(e)}
                        required
                    />
                </Col>
                <Col>
                    LAST NAME
                    <Form.Control
                        type="text"
                        name="last-name"
                        className="nc-modal-custom-input"
                        // onChange={(e) => handleAddChange(e)}
                        required
                    />
                </Col>
                <Col>
                    MIDDLE NAME
                    <Form.Control
                        type="text"
                        name="middle-name"
                        className="nc-modal-custom-input"
                        // onChange={(e) => handleAddChange(e)}
                        required
                    />
                </Col>
                <Col xl={2}>
                    SUFFIX
                    <Form.Control
                        type="text"
                        name="suffix"
                        className="nc-modal-custom-input"
                        // onChange={(e) => handleAddChange(e)}
                        required
                    />
                </Col>
                {/* <Col xs={1}>:</Col> */}
                {/* <Col xs={7}>
            {newEmployee.first_name === "" && (
              <div className="validity-error">Required input*</div>
            )}
          </Col> */}
            </Row>
            <Row className="nc-modal-custom-row">
                <Col>
                    USERNAME
                    <Form.Control
                        type="text"
                        name="username"
                        className="nc-modal-custom-input"
                        // onChange={(e) => handleAddChange(e)}
                        required
                    />
                </Col>
                <Col>
                    ROLE
                    <select
                        className="nc-modal-custom-select"
                        defaultValue="Select"
                    >
                        <option selected value={"select"}>
                            Select
                        </option>
                        <option value="manager">Manager</option>
                        <option value="staff">Staff</option>
                        <option value="finance">Finance</option>
                        <option value="admin">Admin</option>
                    </select>
                </Col>
            </Row>
            <Row className="nc-modal-custom-row">
                <Col>
                    EMAIL
                    <Form.Control
                        type="text"
                        name="email"
                        className="nc-modal-custom-input"
                        // onChange={(e) => handleAddChange(e)}
                        required
                    />
                </Col>
                <Col>
                    PASSWORD
                    <Form.Control
                        type="text"
                        name="password"
                        className="nc-modal-custom-input"
                        // onChange={(e) => handleAddChange(e)}
                        required
                    />
                </Col>
                <Col>
                    CONFIRM PASSWORD
                    <Form.Control
                        type="text"
                        name="confirm-password"
                        className="nc-modal-custom-input"
                        // onChange={(e) => handleAddChange(e)}
                        required
                    />
                </Col>
            </Row>
        </Container>
    );
}

function AddProduct() {
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

    return (
        <Container className="modal-cont">
            <Row className="nc-modal-custom-row">
                <Col>
                    PRODUCT NAME
                    <Form.Control
                        type="text"
                        name="ingredient_name"
                        // value = {data.response.companyname} **SAMPLE**
                        className="nc-modal-custom-input"
                        // onChange={(e) => handleAddChange(e)}
                        required
                    />
                </Col>
                <Col>
                    <Form.Group className="mt-3" controlId="formBasicCheckbox">
                        <Form.Check
                            type="checkbox"
                            label="Add on"
                            className="pt-2"
                            // className="nc-modal-custom-input"
                        />
                    </Form.Group>
                    {/* <input type="checkbox" id="addon" name="addon" className="addon"/>
            <label for="addon">ADD ON</label> */}
                </Col>
            </Row>
            <Row className="nc-modal-custom-row">
                <Col>INGREDIENT'S LIST</Col>
            </Row>
            <Row className="nc-modal-custom-row-box">
                <div className="edit-purchased-items">
                    {products.length === 0 ? (
                        <span>No Ingredients for Products Found!</span>
                    ) : (
                        renderTable()
                    )}
                </div>
            </Row>
            <Row className="pt-3 PO-add-item">
                <Button type="button" onClick={() => AddProductBtn()}>
                    Add Ingredient
                </Button>
            </Row>
        </Container>
    );
}

function AddEmployee() {
    return (
        <Container>
            <Row className="nc-modal-custom-row">
                <Col xl={4}>
                    FIRST NAME
                    <Form.Control
                        type="text"
                        name="first-name"
                        // value = {data.response.companyname} **SAMPLE**
                        className="nc-modal-custom-input"
                        required
                    />
                </Col>
                <Col>
                    LAST NAME
                    <Form.Control
                        type="text"
                        name="last-name"
                        className="nc-modal-custom-input"
                        required
                    />
                </Col>
                <Col>
                    MIDDLE NAME
                    <Form.Control
                        type="text"
                        name="middle-name"
                        className="nc-modal-custom-input"
                        required
                    />
                </Col>
                <Col xl={2}>
                    SUFFIX
                    <Form.Control
                        type="text"
                        name="suffix"
                        className="nc-modal-custom-input"
                        required
                    />
                </Col>
            </Row>
            <Row className="nc-modal-custom-row">
                <Col>
                    USERNAME
                    <Form.Control
                        type="text"
                        name="username"
                        className="nc-modal-custom-input"
                        required
                    />
                </Col>
                <Col>
                    TYPE
                    <select
                        className="nc-modal-custom-select"
                        defaultValue="Select"
                    >
                        <option selected value={"select"}>
                            Select
                        </option>
                        <option value="manager">Manager</option>
                        <option value="staff">Staff</option>
                        <option value="finance">Finance</option>
                        <option value="admin">Admin</option>
                    </select>
                </Col>
            </Row>
            <Row className="nc-modal-custom-row">
                <Col>
                    EMAIL
                    <Form.Control
                        type="text"
                        name="email"
                        className="nc-modal-custom-input"
                        required
                    />
                </Col>
                <Col>
                    PASSWORD
                    <Form.Control
                        type="text"
                        name="password"
                        className="nc-modal-custom-input"
                        required
                    />
                </Col>
                <Col>
                    CONFIRM PASSWORD
                    <Form.Control
                        type="text"
                        name="confirm-password"
                        className="nc-modal-custom-input"
                        required
                    />
                </Col>
            </Row>
        </Container>
    );
}
function AddModal(props) {
    console.log(props.isClicked, !props.isProceed )
    console.log(props.isClicked === false && !props.isProceed )
    return (
        <div>
            <Modal
                show={props.show}
                onHide={props.onHide}
                size={props.size}
                centered
            >
                <Modal.Header closeButton />
                <Modal.Body>
                    <div className="col-sm-12">
                        <p className="custom-modal-body-title">
                            {" "}
                            ADD {props.title}{" "}
                        </p>
                        <Container
                            fluid
                            className="modal-cont justify-content-center"
                        >
                            {/* {props.type === "supplier" && (AddSupplier())}
              {props.type === "bank" && (AddBank())}
              {props.type === "branch" && (AddBranch())}
              {props.type === "ingredient" && (AddIngredient())}
              {props.type === "product" && (AddProduct())}
              {props.type === "user" && (AddUser())}
              {props.type === "employee" && (AddEmployee())} */}
                            {props.children}
                        </Container>

                        <div className="col-sm-12 mt-3 d-flex justify-content-end">
                            <button
                                className="button-secondary me-3"
                                onClick={props.onHide}
                            >
                                Cancel
                            </button>
                            {props.isClicked === true && (
                                <div className="button-primary d-flex justify-content-center">
                                    <ReactLoading
                                        type="bubbles"
                                        color="#FFFFFF"
                                        height={50}
                                        width={50}
                                    />
                                </div>
                            )}
                            {props.isClicked === false && !props.isProceed && (
                                <button
                                    className="button-primary"
                                    onClick={props.onSave}
                                >
                                    Save
                                </button>
                            )}
                            {props.isProceed && (
                                <button
                                    className="button-primary"
                                    onClick={props.onSave}
                                >
                                    Proceed
                                </button>
                            )}
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
}

AddModal.defaultProps = {
    title: "",
    // type:"",
    size: "xl",
    show: () => {},
    onHide: () => {},
    onSave: () => {},
};

export default AddModal;
