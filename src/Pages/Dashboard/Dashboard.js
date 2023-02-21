import React, { useState, useEffect } from "react";
import { Carousel, Card } from "react-bootstrap";
import NoDataImg from "../../Assets/Images/no-data-img.png"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { getAllServices } from "../../Helpers/apiCalls/servicesApi";

//components
import Navbar from "../../Components/Navbar/Navbar";

//css
import "../../Components/Navbar/Navbar.css";
import "./Dashboard.css"
import { dateFormat, formatDate, formatDateNoTime, getName, getTime, numberFormat } from "../../Helpers/Utils/Common";

// img
import profile from "../../Assets/Images/Dashboard/user_profile.png"
import NoDataPrompt from "../../Components/NoDataPrompt/NoDataPrompt";
import { getAllPurchaseOrder } from "../../Helpers/apiCalls/Purchases/purchaseOrderApi";
import { getAllSuppliesExpenses } from "../../Helpers/apiCalls/Purchases/suppliesExpensesApi";

export default function Dashboard() {
    const [inactive, setInactive] = useState(false);
    const [username, setUsername] = useState(getName())
    const [purchasesPO, setPurchasesPO] = useState([])
    const [expensesPO, setExpensesPO] = useState([])

    useEffect(() => {
      fetchPurchasesData();
      fetchExpensesData()
  }, []);

    const [days, setDays] = useState({
      0:"Sunday",
      1:"Monday",
      2:"Tuesday",
      3:"Wednesday",
      4:"Thursday",
      5:"Friday",
      6:"Saturday"
    })

    async function fetchPurchasesData() {
      const response = await getAllPurchaseOrder();

      if (response.error) {
          // TokenExpiry(response);
      } else {
          var purchaseOrders = response.data.data;
          purchaseOrders.map(async (PO) => {
              var info = {};

              info.id = PO.id;
              info.trade_name = PO.supplier_trade_name;

              if (PO.status === "for_approval") {
                  info.po_status = "for approval";
                  setPurchasesPO((prev) => [...prev, info]);
              } 
          });

      }
    }

    
    async function fetchExpensesData() {
      const response = await getAllSuppliesExpenses();
      if (response.data) {
          var allData = response.data.data.map((data) => {
              var clean = data;
              clean.id = data.id
              clean.trade_name = clean.supplier_trade_name || "N/A";
              return clean;
          });

          var for_approval = allData.filter((supplies_expense) => {
              return supplies_expense.status === "for_approval";
          });
          setExpensesPO(for_approval);

      } else if (response.error) {
          // TODO: error toaster here
      }
  }

    return (
        <div>
            <div className="page">
                <Navbar
                    onCollapse={(inactive) => {
                        setInactive(inactive);
                    }}
                    active={"DASHBOARD"} //Dashboard navbar index
                />
            </div>
            <div className={`container ${inactive ? "inactive" : "active"}`}>
                <div className="row font-medium d-flex justify-content-center">
                  <div className="col-sm-6">
                    <div className="row">
                    <div className="col-sm db-container c-height-30 green-bg m-2">
                      <div className="m-auto">
                        <div className="row">
                          <div className="col-sm-3 pl-5">
                            <img src={profile} alt="profile" width={100} height={100}/>
                          </div>
                          <div className="col-sm-9 m-auto pt-5 pb-5 lh-normal">
                            <label className="date">WELCOME</label><br/>
                            <label className="font-bold name">{username.toUpperCase()}</label><br/>
                            <label className="time">{getTime(new Date())}</label><br/>
                            <label className="date">{`${days[new Date().getDay()]}, ${formatDateNoTime(new Date())}`}</label>
                          </div>
                        </div>
                      </div>
                    </div>
                    </div>
                    <div className="row">
                      <div className="col-sm db-container c-height-30 green-bg m-2">
                        <div className="no-data-cont-dashboard mt-5">
                            <img src={NoDataImg} alt="no data found" width={100} height={100}/>
                            <span>Uh Oh! No data found.</span>
                        </div>
                      </div>
                      <div className="col-sm db-container c-height-30 white-bg m-2">
                      <div className="no-data-cont-dashboard mt-5">
                            <img src={NoDataImg} alt="no data found" width={100} height={100}/>
                            <span>Uh Oh! No data found.</span>
                        </div>
                      </div>
                    </div>
                    <div className="row justify-content-center">
                      <div className="col-sm db-container c-height-30 grey-border white-bg m-2">
                        <label className="font-bold date mt-2 mb-0">REQUEST STOCKS</label>
                        <hr/>
                        <div className="no-data-cont-dashboard">
                            <img src={NoDataImg} alt="no data found" width={100} height={100}/>
                            <span>Uh Oh! No data found.</span>
                        </div>
                      </div>
                    </div>
                    <div className="row justify-content-center mb-3">
                      <div className="col-sm db-container c-height-30 grey-border white-bg m-2">
                        <label className="font-bold date mt-2 mb-0">INVENTORY ADJUSTMENTS</label>
                        <hr/>
                        <div className="no-data-cont-dashboard">
                            <img src={NoDataImg} alt="no data found" width={100} height={100}/>
                            <span>Uh Oh! No data found.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6">
                  <div className="row">
                      <div className="col-sm db-container c-height-30 green-bg m-2">
                      <div className="no-data-cont-dashboard mt-5">
                            <img src={NoDataImg} alt="no data found" width={100} height={100}/>
                            <span>Uh Oh! No data found.</span>
                        </div>
                      </div>
                      <div className="col-sm db-container c-height-30 white-bg m-2">
                       <div className="no-data-cont-dashboard mt-5">
                            <img src={NoDataImg} alt="no data found" width={100} height={100}/>
                            <span>Uh Oh! No data found.</span>
                        </div>
                      </div>
                    </div>
                  <div className="row">
                    <div className="col-sm db-container c-height-30 grey-border white-bg m-2 purchases-div">
                      <div>
                      <label className="font-bold date mt-2 mb-0">FOR APPROVAL - PURCHASES PO</label>
                      <hr/>
                      </div>
                      {/* <Carousel variant="dark">
                    
                      {purchasesPO.map(data=>               
                          <Carousel.Item>
         
            <div className="row p-2">
                   <Card style={{ width: '12rem', backgroundColor:"#eaeaea", border:"none" }}>
      <Card.Body>
        <Card.Title><button className="btn btn-sm btn-warning" style={{color:"white"}}>PO NO {data.id}</button></Card.Title>
        <Card.Subtitle className="mb-2 text-muted black-text">{data.trade_name}</Card.Subtitle>
      </Card.Body>
    </Card></div>
                          </Carousel.Item>)}
                          
                          
                          </Carousel> */}

                          
                            {purchasesPO.length > 0 ?
                            <div className="d-flex row p-2 no-wrap purchases-div" style={{flexWrap:"nowrap"}}>
                            {purchasesPO.map((data,key)=>     
                              <Card style={{ width: '12rem', backgroundColor:"#eaeaea", border:"none" }} className="m-1">
                                <Card.Body>
                                  <Card.Title><button className="btn btn-sm btn-warning br-20" style={{color:"white"}}>PO NO. {data.id}</button></Card.Title>
                                  <Card.Subtitle className="mb-2 text-muted black-text">{data.trade_name}</Card.Subtitle>
                                </Card.Body>
                              </Card>
                            )}
                            </div>
                            :
                            <div className="no-data-cont-dashboard m-2">
                            <img src={NoDataImg} alt="no data found" width={100} height={100}/>
                            <span>Uh Oh! No data found.</span>
                            </div>}
                          
                    </div>
                    </div>
                    <div className="row">
                      <div className="col-sm db-container c-height-30 grey-border white-bg m-2">
                        <div>
                        <label className="font-bold date mt-2 mb-0">FOR APPROVAL - SUPPLIES PO</label>
                        <hr/>
                        </div>
                        
                          {expensesPO.length > 0 ?
                          <div className="d-flex row p-2 no-wrap purchases-div" style={{flexWrap:"nowrap"}}>
                            {expensesPO.map((data,key)=>      
                              <Card style={{ width: '12rem', backgroundColor:"#eaeaea", border:"none" }} className="m-1">
                                <Card.Body>
                                  <Card.Title><button className="btn btn-sm btn-warning br-20" style={{color:"white"}}>SE NO. {data.id}</button></Card.Title>
                                  <Card.Subtitle className="mb-2 text-muted black-text">{data.trade_name}</Card.Subtitle>
                                </Card.Body>
                              </Card>
                            )}
                            </div>
                            :
                            <div className="no-data-cont-dashboard mt-2">
                            <img src={NoDataImg} alt="no data found" width={100} height={100}/>
                            <span>Uh Oh! No data found.</span>
                        </div>}
                          
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-sm db-container c-height-30 grey-border white-bg m-2">
                        <label className="font-bold date mt-2 mb-0">FOR APPROVAL - TRANSFERS</label>
                        <hr/>
                 
                        <div className="no-data-cont-dashboard mt-4">
                            <img src={NoDataImg} alt="no data found" width={100} height={100}/>
                            <span>Uh Oh! No data found.</span>
                        </div>
                      
                      </div>
                    </div>
                  </div>
                </div>
    
                {/* for tables */}
                {/* <div className="col">
          <Table
            // type={"approved-appointments"}
            tableData={checkPaymentsData}
            headingColumns={[
              "Doc No",
              "Purchase Date",
              "Supplier",
              "Total",
              "Check No",
              "Prepared By",
              "Approved By",
              "Printed By",
              "Actions",
            ]}
            rowsPerPage={10}
            // date={approvedDate}
            // setDate={setApprovedDate}
          />
        </div> */}
            </div>
        </div>
    );
}
