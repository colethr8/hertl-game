import React from "react"

function Card(props) {
    return (
        <div className="card">
            <div className="card-container">
                <div style={{textAlign: "center"}} className="headshot-container">
                    <img className="headshot" src={props.headshot} alt={props.name} />
                </div>
                <p>{props.name}</p>
                <p>{props.team}, {props.position}</p>
            </div>
        </div>
    );
}

export default Card;