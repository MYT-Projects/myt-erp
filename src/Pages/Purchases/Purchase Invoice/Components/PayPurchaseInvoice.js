import { useState } from "react";
import { Row, Col, Form, Table } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { addPurchasInvoice } from "../../../../Helpers/mockData/mockData";

import Navbar from "../../../../Components/Navbar/Navbar";
import trash from "./../../../../Assets/Images/trash.png";

import "./../PurchaseInvoices.css";

export default function PayPurchaseInvoice() {
    let navigate = useNavigate();
    const [inactive, setInactive] = useState(true);

    const [addPI, setAddPI] = useState({});

    function handleAddChange(e) {
        const newList = { ...addPI };
        newList[e.target.id] = e.target.value;

        setAddPI(newList);
    }

    const [invoices, setInvoices] = useState([{ entry: "1", amount: "14000" }]);

    function handleInvoiceChange(e, index) {
        const { id, value } = e.target;

        invoices[index][id] = value;
    }

    function handleDeleteInvoice(index) {
        const newList = [...invoices];
        newList.splice(index, 1);
        setInvoices(newList);
    }

    function handleAddInvoice() {
        const newRow = { entry: "", amount: "" };
        setInvoices((oldInvoices) => [...oldInvoices, newRow]);
    }

    function renderTable() {
        return (
            <Table>
                <thead>
                    <tr>
                        <th>Entry</th>
                        <th>Invoice Details</th>
                        <th>Amount</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {invoices.map((invoice, index) => {
                        return (
                            <tr>
                                <td>
                                    <select
                                        id="entry"
                                        className="form-control"
                                        defaultValue={invoice.entry}
                                        onChange={(e) =>
                                            handleInvoiceChange(e, index)
                                        }
                                    />
                                </td>
                                <td>
                                    <Link
                                        to="/purchaseinvoices"
                                        className="color-green"
                                    >
                                        VIEW
                                    </Link>
                                </td>
                                <td className="d-flex">
                                    <span className="pe-2 color-green">
                                        PHP
                                    </span>
                                    <input
                                        type="number"
                                        className="form-control"
                                        defaultValue={invoice.amount}
                                        onChange={(e) => handleInvoiceChange(e)}
                                    />
                                </td>
                                <td>
                                    <img
                                        src={trash}
                                        alt="delete"
                                        onClick={() =>
                                            handleDeleteInvoice(index)
                                        }
                                    />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        );
    }

    return (
        <div>
            <div className="page">
                <Navbar
                    onCollapse={(inactive) => {
                        setInactive(inactive);
                    }}
                    active={"PURCHASES"}
                />
            </div>

            <div className={`container ${inactive ? "inactive" : "active"}`}>
                {/* header */}
                <div className="d-flex justify-content-between align-items-center my-3 pb-5">
                    <h1 className="PI-header mb-0">Pay Supplier (Check)</h1>
                </div>

                {/* content */}
                <form className="row g-3 PI-add-form align-items-start">
                    <div className="col-md-6">
                        <label for="supplier" className="form-label">
                            Supplier Name
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            id="supplier"
                            defaultValue={addPI.supplier}
                            onChange={(e) => handleAddChange(e)}
                            required
                        />
                        {!addPI.supplier ? (
                            <div className="validity-error">
                                Supplier Name is Required*
                            </div>
                        ) : null}
                    </div>

                    <div className="col-md-7">
                        <label for="payee" className="form-label">
                            Payee
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            id="payee"
                            defaultValue={addPI.payee}
                            onChange={(e) => handleAddChange(e)}
                        />
                    </div>
                    <div className="col-md-5">
                        <label for="particulars" className="form-label">
                            Particulars
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            id="particulars"
                            defaultValue={addPI.particulars}
                            onChange={(e) => handleAddChange(e)}
                        />
                    </div>

                    <div className="col-md-6">
                        <label for="bank" className="form-label">
                            Bank
                        </label>
                        <select
                            id="bank"
                            className="form-control"
                            defaultValue={addPI.bank}
                            onChange={(e) => handleAddChange(e)}
                        >
                            <option value="" hidden>
                                Select a Bank
                            </option>
                            <option value="sample1">Bank 1</option>
                            <option value="sample2">Bank 2</option>
                        </select>
                    </div>
                    <div className="col-md-2"></div>

                    <div className="col-md-6">
                        <label for="check_date" className="form-label">
                            Check Date
                        </label>
                        <input
                            type="date"
                            className="form-control"
                            id="check_date"
                            defaultValue={addPI.check_date}
                            onChange={(e) => handleAddChange(e)}
                        />
                    </div>
                    <div className="col-md-6">
                        <label for="check_no" className="form-label">
                            Check No.
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            id="check_no"
                            defaultValue={addPI.check_no}
                            onChange={(e) => handleAddChange(e)}
                        />
                    </div>

                    <div className="col-md-6">
                        <label for="signatory_1" className="form-label">
                            Signatory 1
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            id="signatory_1"
                            defaultValue={addPI.signatory_1}
                            onChange={(e) => handleAddChange(e)}
                        />
                    </div>
                    <div className="col-md-6">
                        <label for="signatory_2" className="form-label">
                            Signatory 2
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            id="signatory_2"
                            defaultValue={addPI.signatory_2}
                            onChange={(e) => handleAddChange(e)}
                        />
                    </div>

                    <div>
                        <label className="form-label">
                            Applied to following invoices
                        </label>
                        <div className="form-table">{renderTable()}</div>
                    </div>
                    <div className="d-flex justify-content-between">
                        <button
                            type="button"
                            className="add-item color-white"
                            onClick={() => handleAddInvoice()}
                        >
                            Add Invoice
                        </button>
                        <div className="d-flex pay-footer me-5">
                            <Col xs={7}>TOTAL AMOUNT</Col>
                            <Col xs={7}>PHP 14,000.00</Col>
                        </div>
                    </div>

                    <div className="d-flex justify-content-end pt-4">
                        <button
                            className="button-secondary me-3"
                            type="button"
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </button>
                        <button className="button-primary" type="submit">
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
