import { Form } from "react-bootstrap";
import DataTable from "react-data-table-component";
import { SyncLoader } from "react-spinners";
import NoDataPrompt from "../../../Components/NoDataPrompt/NoDataPrompt";
import "../../../Components/TableTemplate/Table.css";

export default function Table({
    tableHeaders,
    headerSelector,
    tableData,
    ActionBtn,
    ViewBtn,
    PendingBtn,
    showLoader,
    withActionData,
    onRowClicked,
    SaleBtn,
    ContractBtn,
    SaleBillingBtn,
    checkBtn,
    handleOnCheck,
    OngoingPOBadges,
}) {
    const columns = tableHeaders.map((header, index) => {
        if (header === "-") {
            return {
                name: "",
                selector: (row) => row[headerSelector[index]],
                button: true,
                cell: ViewBtn,
                width: "5vw",
                reorder: false,
                wordWrap: "break-word",
            };
        } else if (header === "PO") {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                button: true,
                cell: OngoingPOBadges,
                reorder: false,
                wordWrap: "break-word",
            };
        } else if (header === ".") {
            return {
                name: "",
                selector: (row) => row[headerSelector[index]],
                button: true,
                cell: checkBtn,
                width: "3vw",
                reorder: false,
                wordWrap: "break-word",
            };
        } else if ((header === "MIN" || 
                header === "MAX" || 
                header.includes("QTY") || 
                header.includes("COUNT") ||
                header.includes("DIFFERENCE")) && header !== "COUNTED BY") {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                right: true,
                sortable: true,
                width: "8vw",
                reorder: true,
                wrap: true,
        };
        } else if (header === "ACTIONS" && !withActionData) {
            return {
                name: header,
                button: true,
                cell: ActionBtn,
                width: "7vw",
                reorder: false,
                center: true,
            };
        } else if (header === "MODE" || 
                    header === "REF/CHK" ||
                    header === "CHK DATE" ||
                    header === "DATE PAID" || 
                    header === "PAID AMT" ||
                    header === "CUR QTY" ||
                    header === "ENCODED ON" ||
                    header === "DPST DATE"
                    ) {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                width: "8vw",
                reorder: true,
                sortable: true,
                wrap: true,
            };
        } else if (header === "remarks") {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                width: "12vw",
                reorder: false,
                wrap: true,
            };
        } else if (header === "ITEM") {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                sortable: true,
                width: "8vw",
                reorder: true,
                wrap: true,
            };    
        } else {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                sortable: true,
                width: "12vw",
                reorder: true,
                wrap: true,
            };
        }
    });

    const paginationComponentOptions = {
        rowsPerPageText: "",
        noRowsPerPage: true,
    };

    const customStyles = {
        rows: {
            style: {
                minHeight: "5.2vh",
            },
        },
    };

    return showLoader ? (
        <div className="d-flex justify-content-center my-5">
            <SyncLoader color="#5ac8e1" size={15} />
        </div>
    ) : (
        <DataTable
            pagination
            striped
            fixedHeader
            fixedHeaderScrollHeight="50vh"
            columns={columns}
            data={tableData}
            customStyles={customStyles}
            paginationComponentOptions={paginationComponentOptions}
            noDataComponent={<NoDataPrompt />}
            selectableRows
            onSelectedRowsChange={handleOnCheck}
        />
    );
}
