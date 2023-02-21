import React, { useRef } from "react";
import { Container } from "react-bootstrap";
import ReactToPrint from "react-to-print";

export const PrintPage = ({ props }) => {
    const componentRef = useRef();

    return (
        <div>
            <ReactToPrint
                trigger={() => <button>Print</button>}
                content={() => componentRef.current}
            />
            <Container ref={componentRef}>{props.children}</Container>
        </div>
    );
};
