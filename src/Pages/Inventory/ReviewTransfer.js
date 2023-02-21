import React, { useState } from "react";
import { Button, Col, Container, Row, Table } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import {
    capitalizeFirstLetter,
    formatDate,
    numberFormat,
} from "../../Helpers/Utils/Common";

export default function ReiewTransfer() {
    const { id, type } = useParams();
    let navigate = useNavigate();

    const [inactive, setInactive] = useState(true);
    const [transaction, setTransaction] = useState([]);
    const [items, setItems] = useState([]);

    function renderTable() {
        return (
            <Table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Unit</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => {
                        return (
                            <tr key={item.id}>
                                <td className="sentence">
                                    {item.invoice_label
                                        ? item.invoice_label
                                        : `Invoice ID: ${item.receive_id} was deleted or does not exist.`}
                                </td>
                                <td>{formatDate(item.added_on)}</td>
                                <td>
                                    <button
                                        type="button"
                                        className="button-primary view-btn me-3"
                                        onClick={() =>
                                            handleViewPayment(
                                                item.se_id,
                                                id,
                                                type
                                            )
                                        }
                                    >
                                        View
                                    </button>
                                </td>
                                <td>PHP {numberFormat(item.amount)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        );
    }

    function handleViewPayment(id, bank, type) {
        {
            window.open(
                "/se/paysuppliers/view-invoice/" + id + "/" + bank + "/" + type,
                "_blank"
            );
        }
    }

    React.useEffect(() => {
    }, []);

    return (
        <div>
            <div className="page">
                <Navbar
                    onCollapse={(inactive) => {
                        setInactive(inactive);
                    }}
                    active={"EXPENSES"}
                />
            </div>
            <div className={`container ${inactive ? "inactive" : "active"}`}>
                <div className="d-flex justify-content-between">
                    <h1 className="page-title mb-4">VIEW TRANSACTION</h1>
                    <div className="review-po">
                        <span className="pe-5">DOCUMENT NO.</span>
                        <span>{id}</span>
                    </div>
                </div>

                {/* content */}
                <div className="review-form mb-3">
                    {/* TRANSACTION/PAYMENT DETAILS */}

                    <Container fluid>
                        <Row className="review-container py-3">
                            <Row>
                                <Col>
                                    <span className="review-label nc-modal-custom-row">
                                        Transfer Number
                                    </span>
                                </Col>
                                <Col>
                                    <span className="review-label nc-modal-custom-row">
                                        Doc No.
                                    </span>
                                </Col>
                                <Col>
                                    <span className="review-label nc-modal-custom-row">
                                        Encoded By
                                    </span>
                                </Col>
                                <Col>
                                    <span className="review-label nc-modal-custom-row">
                                        Transfer Date
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <span className="review-data">
                                        {transaction.supplier_name}
                                    </span>
                                </Col>
                                <Col>
                                    <span className="review-data">
                                        {transaction.payee}
                                    </span>
                                </Col>
                                <Col>
                                    <span className="review-data">
                                        {transaction.payment_date}
                                    </span>
                                </Col>
                                <Col>
                                    <span className="review-data">CASH</span>
                                </Col>
                            </Row>
                        </Row>
                        <Row>
                            <Col>
                                <span className="review-label nc-modal-custom-row">
                                    Dispatcher
                                </span>
                            </Col>
                            <Col>
                                <span className="review-label nc-modal-custom-row">
                                    From Branch
                                </span>
                            </Col>
                            <Col>
                                <span className="review-label nc-modal-custom-row">
                                    To Branch
                                </span>
                            </Col>
                            <Col>
                                <span className="review-label nc-modal-custom-row">
                                    Remarks
                                </span>
                            </Col>
                        </Row>
                    </Container>

                    {/* INVOICES */}
                    <div className="mt-4 d-flex flex-column">
                        <span className="review-data mb-2 nc-modal-custom-row">
                            LIST OF ITEMS TRANSFERRED
                        </span>
                        <div className="review-purchased-items">
                            {renderTable()}
                        </div>
                    </div>

                    <div className="d-flex justify-content-end pt-5">
                        <button type="button" className="button-primary me-3">
                            Print
                        </button>
                        <button
                            type="button"
                            className="button-secondary me-3"
                            onClick={() => navigate(-1)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
