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

//css
import "./Modal.css";

function EditSupplier() {
    return (
        <Container>
            <Row className="nc-modal-custom-row">
                <Col>
                    COMPANY NAME
                    <Form.Control
                        type="text"
                        name="company name"
                        value="Amazing, Inc."
                        // value = {data.response.companyname} **SAMPLE**
                        className="nc-modal-custom-input-edit"
                        // onChange={(e) => handleAddChange(e)}
                        required
                    />
                </Col>
                <Col xl={3}>
                    COUNTRY
                    <Form.Control
                        type="text"
                        name="country"
                        value="Philippines"
                        className="nc-modal-custom-input-edit"
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
                        value="Cebu"
                        className="nc-modal-custom-input-edit"
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
                <Col xl={6}>
                    ADDRESS
                    <Form.Control
                        type="text"
                        name="address"
                        value="Cebu City, Cebu, Philippines"
                        className="nc-modal-custom-input-edit"
                        // onChange={(e) => handleAddChange(e)}
                        required
                    />
                </Col>
                <Col>
                    CITY
                    <Form.Control
                        type="text"
                        name="city"
                        value="Cebu"
                        className="nc-modal-custom-input-edit"
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
                        value="6001"
                        className="nc-modal-custom-input-edit"
                        // onChange={(e) => handleAddChange(e)}
                        required
                    />
                </Col>
            </Row>
            <Row className="nc-modal-custom-row">
                <Col>
                    TIN NUMBER
                    <Form.Control
                        type="text"
                        name="company name"
                        value="123456789"
                        className="nc-modal-custom-input-edit"
                        // onChange={(e) => handleAddChange(e)}
                        required
                    />
                </Col>
                <Col>
                    BIR NUMBER
                    <Form.Control
                        type="text"
                        value="123465798"
                        className="nc-modal-custom-input-edit"
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
                        value="simply-amazing@amaze.com"
                        className="nc-modal-custom-input-edit"
                        // onChange={(e) => handleAddChange(e)}
                        required
                    />
                </Col>
            </Row>
            <Row className="nc-modal-custom-row">
                <Col>
                    CONTACT PERSON
                    <Form.Control
                        type="text"
                        name="contact person"
                        value="Juana Marie"
                        className="nc-modal-custom-input-edit"
                        // onChange={(e) => handleAddChange(e)}
                        required
                    />
                </Col>
                <Col>
                    PHONE NUMBER
                    <Form.Control
                        type="text"
                        name="phone number"
                        value="09123456789"
                        className="nc-modal-custom-input-edit"
                        // onChange={(e) => handleAddChange(e)}
                        required
                    />
                </Col>
            </Row>
        </Container>
    );
}

function EditEmployee() {
    return (
        <Container className="modal-cont">
            <Row className="nc-modal-custom-row">
                <Col xl={4}>
                    FIRST NAME
                    <Form.Control
                        type="text"
                        name="first-name"
                        value="Juana"
                        // value = {data.response.companyname} **SAMPLE**
                        className="nc-modal-custom-input-edit"
                        required
                    />
                </Col>
                <Col>
                    LAST NAME
                    <Form.Control
                        type="text"
                        name="last-name"
                        value="Marie"
                        className="nc-modal-custom-input-edit"
                        required
                    />
                </Col>
                <Col>
                    MIDDLE NAME
                    <Form.Control
                        type="text"
                        name="middle-name"
                        value="Del Rosario"
                        className="nc-modal-custom-input-edit"
                        required
                    />
                </Col>
                <Col xl={2}>
                    SUFFIX
                    <Form.Control
                        type="text"
                        name="suffix"
                        value=" "
                        className="nc-modal-custom-input-edit"
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
                        value="Juana1234"
                        className="nc-modal-custom-input-edit"
                        required
                    />
                </Col>
                <Col>
                    TYPE
                    <select
                        className="nc-modal-custom-select"
                        defaultValue="Select"
                    >
                        <option value={""}>Select</option>
                        <option selected value="manager">
                            Manager
                        </option>
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
                        value="juanamarie@email.com"
                        className="nc-modal-custom-input-edit"
                        required
                    />
                </Col>
                <Col>
                    PASSWORD
                    <Form.Control
                        type="text"
                        name="password"
                        value="123456789"
                        className="nc-modal-custom-input-edit"
                        required
                    />
                </Col>
                <Col>
                    CONFIRM PASSWORD
                    <Form.Control
                        type="text"
                        name="confirm-password"
                        value="123456789"
                        className="nc-modal-custom-input-edit"
                        required
                    />
                </Col>
            </Row>
        </Container>
    );
}

function EditBank() {
    return (
        <Container>
            <Row className="nc-modal-custom-row">
                <Col>
                    BANK NAME
                    <Form.Control
                        type="text"
                        name="bank-name"
                        value="BDO"
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
                        {/* selected value should be the current subject for edit */}
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

function EditBranch() {
    return (
        <Container className="modal-cont">
            <Row className="nc-modal-custom-row">
                <Col>
                    BRANCH NAME
                    <Form.Control
                        type="text"
                        name="branch_name"
                        value="SM CITY CEBU"
                        // value={branchesMockData.branch_name}
                        // value = {data.response.companyname} **SAMPLE**
                        className="nc-modal-custom-input-edit"
                        // onChange={(e) => handleEditChange(e)}
                        required
                    />
                </Col>
                <Col>
                    ADDRESS
                    <Form.Control
                        type="text"
                        name="address"
                        value="Lorem ipsum dolor sit amet"
                        className="nc-modal-custom-input-edit"
                        // onChange={(e) => handleEditChange(e)}
                        required
                    />
                </Col>
                <Col xl={3}>
                    PHONE NUMBER
                    <Form.Control
                        type="text"
                        name="phone_number"
                        value="09123456789"
                        className="nc-modal-custom-input-edit"
                        // onChange={(e) => handleEditChange(e)}
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
                        value="Juana Marie"
                        className="nc-modal-custom-input-edit"
                        // onChange={(e) => handleEditChange(e)}
                        required
                    />
                </Col>
                <Col>
                    FRANCHISEE CONTACT NO.
                    <Form.Control
                        type="text"
                        name="franchisee_contact_no"
                        value="09123456789"
                        className="nc-modal-custom-input-edit"
                        // onChange={(e) => handleEditChange(e)}
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
                        value="123-456-789-000"
                        className="nc-modal-custom-input-edit"
                        // onChange={(e) => handleEditChange(e)}
                        required
                    />
                </Col>
                <Col xl={3}>
                    BIR NUMBER
                    <Form.Control
                        type="text"
                        name="bir_number"
                        value="123-456-789-000"
                        className="nc-modal-custom-input-edit"
                        // onChange={(e) => handleEditChange(e)}
                        required
                    />
                </Col>
                <Col xl={3}>
                    CONTRACT START
                    <Form.Control
                        type="date"
                        name="contract_start"
                        value="12/11/2022"
                        className="nc-modal-custom-input-edit"
                        // onChange={(e) => handleEditChange(e)}
                        required
                    />
                </Col>
                <Col xl={3}>
                    CONTRACT END
                    <Form.Control
                        type="date"
                        name="contract_end"
                        value="12/11/2022"
                        className="nc-modal-custom-input-edit"
                        // onChange={(e) => handleEditChange(e)}
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
                        value="12/11/2022"
                        className="nc-modal-custom-input-edit"
                        // onChange={(e) => handleEditChange(e)}
                        required
                    />
                </Col>
                <Col>
                    CONTACT PERSON
                    <Form.Control
                        type="text"
                        name="contact_person"
                        value="Juana Marie"
                        className="nc-modal-custom-input-edit"
                        // onChange={(e) => handleEditChange(e)}
                        required
                    />
                </Col>
                <Col>
                    CONTACT PERSON PHONE NUMBER
                    <Form.Control
                        type="text"
                        name="phone_number"
                        value="09123456789"
                        className="nc-modal-custom-input-edit"
                        // onChange={(e) => handleEditChange(e)}
                        required
                    />
                </Col>
            </Row>
        </Container>
    );
}

function EditIngredient() {
    const [ingredients, setIngredients] = useState([{ unit: "", cost: 0 }]);

    function handleRemoveIngredient(id) {
        const rowId = id;
        const newIngredientList = [...ingredients];
        newIngredientList.splice(rowId, 1);
        setIngredients(newIngredientList);
    }

    function EditIngredientBtn() {
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
        <Container className="modal-cont">
            <Row className="nc-modal-custom-row">
                <Col>
                    INGREDIENT NAME
                    <Form.Control
                        type="text"
                        name="ingredient_name"
                        value="Milk"
                        // value = {data.response.companyname} **SAMPLE**
                        className="nc-modal-custom-input-edit"
                        // onChange={(e) => handleEditChange(e)}
                        required
                    />
                </Col>
                <Col>
                    INGREDIENT DETAILS
                    <Form.Control
                        type="text"
                        name="ingredient_details"
                        value="Lorem ipsum dolor sit amet, consectetur adipiscing elit"
                        className="nc-modal-custom-input-edit"
                        // onChange={(e) => handleEditChange(e)}
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
                <Button
                    type="button"
                    className="col-xl-6 button-primary"
                    onClick={() => EditIngredientBtn()}
                >
                    Add Ingredient
                </Button>
            </Row>
        </Container>
    );
}

function EditUser() {
    return (
        <Container>
            <Row className="nc-modal-custom-row">
                <Col xl={4}>
                    FIRST NAME
                    <Form.Control
                        type="text"
                        name="first-name"
                        value="Amazing, Inc."
                        // value = {data.response.companyname} **SAMPLE**
                        className="nc-modal-custom-input-edit"
                        // onChange={(e) => handleAddChange(e)}
                        required
                    />
                </Col>
                <Col>
                    LAST NAME
                    <Form.Control
                        type="text"
                        name="last-name"
                        value="Philippines"
                        className="nc-modal-custom-input-edit"
                        // onChange={(e) => handleAddChange(e)}
                        required
                    />
                </Col>
                <Col>
                    MIDDLE NAME
                    <Form.Control
                        type="text"
                        name="middle-name"
                        value="Cebu"
                        className="nc-modal-custom-input-edit"
                        // onChange={(e) => handleAddChange(e)}
                        required
                    />
                </Col>
                <Col xl={2}>
                    SUFFIX
                    <Form.Control
                        type="text"
                        name="suffix"
                        value="Jr."
                        className="nc-modal-custom-input"
                        // onChange={(e) => handleAddChange(e)}
                        required
                    />
                </Col>
            </Row>
            <Row className="nc-modal-custom-row">
                <Col>
                    USERNAME
                    <Form.Control
                        type="text"
                        name="address"
                        value="Juana1234"
                        className="nc-modal-custom-input-edit"
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
                        value="simply-amazing@amaze.com"
                        className="nc-modal-custom-input-edit"
                        // onChange={(e) => handleAddChange(e)}
                        required
                    />
                </Col>
                <Col>
                    PASSWORD
                    <Form.Control
                        type="text"
                        name="password"
                        value="123465798"
                        className="nc-modal-custom-input-edit"
                        // onChange={(e) => handleAddChange(e)}
                        required
                    />
                </Col>
                <Col>
                    CONFIRM PASSWORD
                    <Form.Control
                        type="text"
                        name="confirm-password"
                        value="12345678"
                        className="nc-modal-custom-input-edit"
                        // onChange={(e) => handleAddChange(e)}
                        required
                    />
                </Col>
            </Row>
        </Container>
    );
}

function EditProduct() {
    const [products, setProducts] = useState([
        { name: "", quantity: "", unit: "" },
    ]);

    function handleRemoveProduct(id) {
        const rowId = id;
        const newProductList = [...products];
        newProductList.splice(rowId, 1);
        setProducts(newProductList);
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

    return (
        <Container className="modal-cont">
            <Row className="nc-modal-custom-row">
                <Col>
                    PRODUCT NAME
                    <Form.Control
                        type="text"
                        name="product_name"
                        value="Fresh Mango Shake"
                        // value = {data.response.companyname} **SAMPLE**
                        className="nc-modal-custom-input"
                        // onChange={(e) => handleEditChange(e)}
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
                    {/* <input type="checkbox" id="Editon" name="Editon" className="Editon"/>
            <label for="Editon">Edit ON</label> */}
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
                <Button type="button" onClick={() => EditProductBtn()}>
                    Add Ingredient
                </Button>
            </Row>
        </Container>
    );
}
function EditModal(props) {
    // const [editData, setEditData] = useState({});
    // const handleEditChange = (e) => {
    //   const {name,value} = e.target;
    //   // setEditData((prev)=>{...prev, name: [value]})
    // }
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
                            EDIT {props.title}{" "}
                        </p>
                        <Container
                            fluid
                            className="modal-cont justify-content-center"
                        >
                            {/* {props.type === "supplier" && (EditSupplier())}
              {props.type === "bank" && (EditBank())}
              {props.type === "branch" && (EditBranch())}
              {props.type === "ingredient" && (EditIngredient())}
              {props.type === "product" && (EditProduct())}
              {props.type === "user" && (EditUser())}
              {props.type === "employee" && (EditEmployee())} */}
                            {props.children}
                        </Container>

                        <div className="col-sm-12 mt-3 d-flex justify-content-end">
                            <button
                                className="button-secondary me-3"
                                onClick={props.onHide}
                            >
                                Cancel
                            </button>
                            <button
                                className="button-primary"
                                onClick={props.onSave}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
}

EditModal.defaultProps = {
    title: "",
    // type:"",
    size: "xl",
    show: () => {},
    onHide: () => {},
    onSave: () => {},
};

export default EditModal;
