import React, { useState } from "react";
import { Button, Col, Form, Row, Table } from "react-bootstrap";
import toast from "react-hot-toast";
import { Modal } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Delete from "../../Components/Modals/DeleteModal";
import Navbar from "../../Components/Navbar/Navbar";
import {
    formatDateNoTime,
    formatDateSlash,
    getTodayDate,
    isAdmin,
    refreshPage,
    toastStyle,
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

/*
    -- VIEW BUILT ITEM
*/
export default function BuildItemView() {
    const [isClicked, setIsClicked] = useState(false);
    const { id } = useParams();
    let navigate = useNavigate();

    // VARIABLES FOR FETCHING
    const [branches, setBranches] = useState([]);
    const [items, setItems] = useState([]);
    const [employees, setEmployees] = useState([]);

    // BUILT ITEM INFO VARIABLES
    const [selectedRow, setSelectedRow] = useState({});
    const [build, setBuild] = useState({
        branch: "1",
        item: "",
        branchTo: "",
        qty: "",
        unitId: "",
        production_date: "",
        expiration_date: "",
        batch: "",
        production_slip_no: "",
        yield: "",
    });
    const [buildInfo, setBuildInfo] = useState([]);
    const [branchInfo, setBranchInfo] = useState([]);
    const [itemInfo, setItemInfo] = useState([]);
    const [products, setProducts] = useState([
        { id: "", quantity: "1", unit: "", unitList: [] },
    ]);
    const [labor, setLabor] = useState([
        { employee_id: "", job_description: "", rate: "" },
    ]);
    const [totalLabor, setTotalLabor] = useState(0);
    const [qty, setQty] = useState("");
    const [branchFrom, setBranchFrom] = useState("1");
    const [isSet, setIsSet] = useState(false);

    const [paymentList, setPaymentList] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [showLoader, setShowLoader] = useState(false);
    const [shopType, setShopType] = useState("");
    const [selectedPayment, setSelectedPayment] = useState("");
    const [search, setSearch] = useState("");

    // Error Handling
    const [isError, setIsError] = useState({
        branch_from: false,
        qty: false,
        ingredients: false,
    });

    const [inactive, setInactive] = useState(true);

    async function fetchBuildItem() {
        const response = await getBuildItem(id);

        if (response.data.data) {
            setBuildInfo(response.data.data);
            setIsSet(true);

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
                        unitList: { item_units: itemList[0].item_units },
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
        }
    }

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
                    {isSet
                        ? buildInfo[0].build_item_details.map(
                              (product, index) => {
                                  return (
                                      <tr>
                                          <td>
                                              <Form.Control
                                                  type="text"
                                                  name="item_name"
                                                  value={product.item_name}
                                                  disabled
                                              />
                                          </td>
                                          <td>
                                              <Form.Control
                                                  type="number"
                                                  name="quantity"
                                                  min="0"
                                                  value={product.qty}
                                                  disabled
                                              />
                                          </td>
                                          <td>
                                              <Form.Control
                                                  type="text"
                                                  name="unit"
                                                  value={product.inventory_unit}
                                                  disabled
                                              />
                                          </td>
                                      </tr>
                                  );
                              }
                          )
                        : ""}
                </tbody>
            </Table>
        );
    }

    React.useEffect(() => {
        setSelectedRow(id);
        fetchBuildItem();
    }, []);

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
                className={`manager-container container ${
                    inactive ? "inactive" : "active"
                }`}
            >
                {/* headers */}
                <Row className="mb-4">
                    <Col xs={6}>
                        <h1 className="page-title"> BUILD ITEM </h1>
                    </Col>
                </Row>

                <div className="mt-3 edit-form">
                    <Row className="nc-modal-custom-row mt-0">
                        <Col sm={4}>Branch</Col>
                        <Col>
                            <div className="plain-text">
                                {buildInfo[0]?.to_branch_name}
                            </div>
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row mt-0">
                        <Col sm={4}>Item description</Col>
                        <Col>
                            <div className="plain-text">
                                {buildInfo[0]?.item_name}
                            </div>
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row mt-0">
                        <Col sm={4}>Current Level</Col>
                        <Col>
                            <div className="plain-text">
                                {buildInfo[0]?.total_qty}
                            </div>
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row mt-0">
                        <Col sm={4}>Qty</Col>
                        <Col sm={4}>
                            <Form.Control
                                type="number"
                                name="qty"
                                value={buildInfo[0]?.qty}
                                // value = {data.response.companyname} **SAMPLE**
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
                                value={
                                    buildInfo[0]?.production_date.split(" ")[0]
                                }
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
                                value={
                                    buildInfo[0]?.expiration_date.split(" ")[0]
                                }
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
                                value={buildInfo[0]?.batch}
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
                                    value={buildInfo[0]?.yield}
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
                                value={buildInfo[0]?.production_slip_no}
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
                            <Form.Control
                                type="branch_from"
                                name="batch"
                                value={buildInfo[0]?.from_branch_name}
                                className="nc-modal-custom-input"
                                disabled
                            />
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
                            {!isSet ? (
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
                </div>
            </div>
        </div>
    );
}
