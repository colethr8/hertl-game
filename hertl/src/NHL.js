import React, { useEffect, useState } from "react";
import Game from "./Game";


function NHL(props) {
    // "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/" + playerOne[0].id + ".jpg"

    const [loading, setLoading] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [goaliesSelected, setGoaliesSelected] = useState(false);
    const [playerList, setPlayerList] = useState([]);
    const [stat, setStat] = useState("");
    const [season, setSeason] = useState("");

    useEffect(() => {
        document.title = props.title;
    }, [props.title]);

    function positionSelectHandler() {
        const selected = document.getElementById("position-selector").value;

        if (goaliesSelected === true) {
            if (selected !== "goalies") {
                setGoaliesSelected(false);
            }
        } else {
            if (selected === "goalies") {
                setGoaliesSelected(true);
            }
        }
    }

    async function play() {
        const seasonNum1 = parseInt(document.getElementById("season").value);

        if (isNaN(seasonNum1) || seasonNum1 < 1918 || seasonNum1 > 2022) {
            window.alert("Please enter a valid year");
        } else {
            setLoading(true);

            const pos = document.getElementById("position-selector").value;

            const statType = document.getElementById("stat-type").value;
            setStat(statType);
            
            const seasonNum2 = seasonNum1 - 1;
            const seasonNum = "" + seasonNum2 + seasonNum1;
            setSeason(seasonNum);

            await getPlayerList(pos, seasonNum);

            setPlaying(true);
            setLoading(false);
        }

        
    }

    async function getPlayerList(position, season) {
        const rosterJSON = await getJSON("https://statsapi.web.nhl.com/api/v1/teams?expand=team.roster&season=" + season);
        const teams = rosterJSON.teams;

        teams.forEach((team) => {
            const id = team.id;
            const teamRoster = team.roster.roster;

            switch(position) {
                case "skaters":
                    sortSkaters(teamRoster, id);
                    break;
                case "forwards":
                    sortForwards(teamRoster, id);
                    break;
                case "defensemen":
                    sortDefensemen(teamRoster, id);
                    break;
                case "goalies":
                    sortGoalies(teamRoster, id);
                    break;
                default:
                    refresh();
                    break;
            }
        });
    }

    function sortSkaters(roster, id) {
        roster.forEach((player) => {
            if (player.position.type === "Forward" || player.position.type === "Defenseman") {
                setPlayerList((oldList) => [...oldList, [id, player]]);
            }
        });
    }

    function sortForwards(roster, id) {
        roster.forEach((player) => {
            if (player.position.type === "Forward") {
                setPlayerList((oldList) => [...oldList, [id, player]]);
            }
        });
    }

    function sortDefensemen(roster, id) {
        roster.forEach((player) => {
            if (player.position.type === "Defenseman") {
                setPlayerList((oldList) => [...oldList, [id, player]]);
            }
        });
    }

    function sortGoalies(roster, id) {
        roster.forEach((player) => {
            if (player.position.type === "Goalie") {
                setPlayerList((oldList) => [...oldList, [id, player]]);
            }
        });
    }

    async function getJSON(url) {
        return fetch(url)
            .then((response) => response.json())
            .then((responseJSON) => {
                return responseJSON;
            });
    }

    function refresh() {
        window.location.reload(false);
    }

    return (
        <>
            <main>
                {!playing && !loading && 
                    <div className="play-menu">
                        <div className="play-menu-container">
                            <h1>NHL Higher/Lower</h1>
                            <form>
                                <label htmlFor="">Position:</label>
                                <select id="position-selector" name="position-selector" onChange={positionSelectHandler}>
                                    <option value="skaters">All Skaters</option>
                                    <option value="forwards">Forwards</option>
                                    <option value="defensemen">Defensemen</option>
                                    <option value="goalies">Goalies</option>
                                </select>
                                <label htmlFor="stat-type" className="label-padding">Stat:</label>
                                {!goaliesSelected &&
                                    <select id="stat-type" name="stat-type">
                                        <option value="points">Points</option>
                                        <option value="goals">Goals</option>
                                        <option value="assists">Assists</option>
                                    </select>
                                }
                                {goaliesSelected && 
                                    <select id="stat-type" name="stat-type">
                                        <option value="wins">Wins</option>
                                        <option value="savePercentage">Save Percentage</option>
                                        <option value="goalsAgainstAverage">Goals Against Average</option>
                                        <option value="saves">Saves</option>
                                    </select>
                                }
                                <label htmlFor="season" className="label-padding">Season (1918-2022):</label>
                                <input type="number" id="season"></input>
                                <button onClick={play} className="play-btn">Load Players</button>
                            </form>
                        </div>
                    </div>
                }

                {!playing && loading && 
                    <div className="loading">
                        <div className="loading-content">
                            <p>Loading...</p>
                        </div>
                    </div>
                }

                {playing && !loading && stat !== "" && 
                    <Game type="NHL" playerList={playerList} stat={stat} season={season} goalie={goaliesSelected} />
                }
            </main>
        </>
    );
}

export default NHL;