import { getIn } from "formik";
import React, { useState } from "react";
import { Table, Form } from "react-bootstrap";
import { getItem } from "../../../../Helpers/apiCalls/itemsApi";
import { numberFormat } from "../../../../Helpers/Utils/Common";
import trash from './../../../../Assets/Images/trash.png';

export default function RenderTable({ tableHeaders, tableData, tableType, tableHandler, deleteHandler }) {
    const [isChanged, setIsChanged] = useState(false);

    function handleChange(e, index) {
        setIsChanged(true);
        tableHandler(e, index);
        setTimeout(() => setIsChanged(false), 1);
    }

    return (
        <Table>
            <thead>
                <tr>
                    {tableHeaders.map((header) => {
                        if (header === 'ordered' || header === 'previously received' || header === 'balance') {
                            return (
                                <th className="color-green">{header}</th>
                            )
                        } else if (header === 'actions') {
                            return (
                                <th className="text-center">{header}</th>
                            )
                        } else {
                            return (
                                <th>{header}</th>
                            )
                        }
                    })}
                </tr>
            </thead>
            <tbody>
                {tableType === "items_received" ? (
                    tableData.map((item, index) => {
                        return (
                            <tr>
                                <td>{item.item}</td>
                                <td>
                                    <Form.Control type="number" min="0" name="qty" defaultValue={parseInt(item.qty)} onChange={(e) => handleChange(e, index)} />
                                </td>
                                <td>{item.unit}</td>
                                <td>
                                    <Form.Control type="number" min="0" name="price" defaultValue={item.price} onChange={(e) => handleChange(e, index)} />
                                </td>
                                <td className="color-green">PHP {(item.qty && item.price) ? numberFormat(parseInt(item.qty) * parseInt(item.price)) : "0.00"}</td>
                                <td>
                                    <Form.Control type="number" min="0" name="received" defaultValue={item.received} onChange={(e) => handleChange(e, index)} />
                                </td>
                                <td>{item.received ? parseInt(item.qty) - parseInt(item.received) : parseInt(item.qty)} {item.unit}</td>
                            </tr>
                        )
                    })
                ) : (
                    tableData.map((item, index) => {
                        return (
                            <tr>
                                <td>
                                    <Form.Control type="text" name="item" defaultValue={item.item} onChange={(e) => tableHandler(e, index)} />
                                </td>
                                <td>
                                    <Form.Control type="number" name="qty" defaultValue={item.qty} onChange={(e) => handleChange(e, index)} />
                                </td>
                                <td>
                                    <Form.Control type="text" name="unit" defaultValue={item.unit} onChange={(e) => tableHandler(e, index)} />
                                </td>
                                <td>
                                    <Form.Control type="number" name="price" defaultValue={item.price} onChange={(e) => handleChange(e, index)} />
                                </td>
                                <td className="color-green">{(item.qty && item.price) ? 'PHP ' + numberFormat(item.price * item.qty) : 'PHP 0.00'}</td>
                                <td className="text-center">
                                    <img src={trash} onClick={() => deleteHandler(index)} className="cursor-pointer" />
                                </td>
                            </tr>
                        )
                    })
                )}
            </tbody>
        </Table>
    )
}