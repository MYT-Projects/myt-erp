import DataTable from "react-data-table-component";
import { SyncLoader } from "react-spinners";
import NoDataPrompt from "../../Components/NoDataPrompt/NoDataPrompt";
import "../../Components/TableTemplate/OneTable.css";

export default function PaymentTable({
    tableHeaders,
    headerSelector,
    tableData,
    ActionBtn,
    ViewBtn,
    PendingBtn,
    showLoader,
    withActionData,
}) {
    const columns = tableHeaders.map((header, index) => {
        if (header === "PAYMENT DATE") {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                button: true,
                width: "20%",
            };
        } else if (header.includes("TYPE")) {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                // sortable: true,
                width: "8%",
                wrap: true,
                reorder: true,
            };
        } else if (header.includes("PAID AMOUNT")) {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                sortable: true,
                width: "20%",
                wrap: true,
                reorder: true,
            };
        } else {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                // sortable: true,
                width: "auto",
                wrap: true,
                reorder: true,
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
                flexWrap: "wrap",
                fontSize: "12px",
                whiteSpace: "pre",
            },
        },
        headCells: {
            style: {
                flexWrap: "wrap",
                fontSize: "12px",
                width: "100%",
                wordWrap: "breakWord",
            },
        },
    };

    return showLoader ? (
        <div className="d-flex justify-content-center my-5">
            <SyncLoader color="#169422" size={15} />
        </div>
    ) : (
        <DataTable
            grow
            pagination
            responsive
            striped
            fixedHeader
            columns={columns}
            data={tableData}
            customStyles={customStyles}
            paginationComponentOptions={paginationComponentOptions}
            noDataComponent={<NoDataPrompt />}
        />
    );
}
