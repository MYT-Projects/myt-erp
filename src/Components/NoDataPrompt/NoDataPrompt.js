import NoDataImg from "../../Assets/Images/no-data-img.png"

import "./NoDataPrompt.css"

export default function NoDataPrompt() {
    return(
        <div className="no-data-cont">
            <img src={NoDataImg} alt="no data found" />
            <span>Uh Oh! No data found.</span>
        </div>
    )
}