import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function TableLoader({ tableHeaders, data }) {
    const [showLoading, setShowLoading] = useState(true);

    React.useEffect(() => {
        let loadingTime = setTimeout(() => {
            setShowLoading(false);
        }, 15000);

        return () => {
            clearTimeout(loadingTime);
        };
    }, []);

    const noDataDisplay = () => {
        return (
            <td colSpan={tableHeaders.length}>
                <FontAwesomeIcon
                    icon={"search"}
                    alt={"user"}
                    aria-hidden="true"
                    className="search-table-icon"
                />
                No Data found.
            </td>
        );
    };

    const loadingDisplay = () => {
        return (
            <>
                <tr>
                    {tableHeaders.map((data, index) => {
                        return (
                            <td className="td-3">
                                <span></span>
                            </td>
                        );
                    })}
                </tr>
                <tr>
                    {tableHeaders.map((data, index) => {
                        return (
                            <td className="td-3">
                                <span></span>
                            </td>
                        );
                    })}
                </tr>
                <tr>
                    {tableHeaders.map((data, index) => {
                        return (
                            <td className="td-3">
                                <span></span>
                            </td>
                        );
                    })}
                </tr>
                <tr>
                    {tableHeaders.map((data, index) => {
                        return (
                            <td className="td-3">
                                <span></span>
                            </td>
                        );
                    })}
                </tr>
                <tr>
                    {tableHeaders.map((data, index) => {
                        return (
                            <td className="td-3">
                                <span></span>
                            </td>
                        );
                    })}
                </tr>
                <tr>
                    {tableHeaders.map((data, index) => {
                        return (
                            <td className="td-3">
                                <span></span>
                            </td>
                        );
                    })}
                </tr>
            </>
        );
    };

    if (data && data.length != 0) {
        return loadingDisplay();
    } else {
        return (
            <>
                {showLoading && loadingDisplay()}

                {!showLoading && noDataDisplay()}
            </>
        );
    }
}

export default TableLoader;
