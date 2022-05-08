import React, { useState } from "react";
import Card from "./Card";

function Game(props) {
    const [playing, setPlaying] = useState(false);
    const [loading, setLoading] = useState(false);
    const [correct, setCorrect] = useState(false);
    const [lost, setLost] = useState(false);

    const [score, setScore] = useState(0);

    const [playerOne, setPlayerOne] = useState(null);
    const [playerOneName, setPlayerOneName] = useState("");
    const [playerOneTeam, setPlayerOneTeam] = useState("");
    const [playerOnePosition, setPlayerOnePosition] = useState("");
    const [playerOneStat, setPlayerOneStat] = useState(0);
    const [playerOneHeadshot, setPlayerOneHeadshot] = useState("");

    const [playerTwo, setPlayerTwo] = useState(null);
    const [playerTwoName, setPlayerTwoName] = useState("");
    const [playerTwoTeam, setPlayerTwoTeam] = useState("");
    const [playerTwoPosition, setPlayerTwoPosition] = useState("");
    const [playerTwoStat, setPlayerTwoStat] = useState(0);
    const [playerTwoHeadshot, setPlayerTwoHeadshot] = useState("");

    const [prevName, setPrevName] = useState("");
    const [prevStat, setPrevStat] = useState(0);

    const type = props.type;
    const playerList = props.playerList;
    const chosenStat = props.stat;
    const season = props.season;

    async function play() {
        setLoading(true);

        const originalPlayers = getOriginalPlayers();

        const player1 = originalPlayers[0];
        const player1Name = player1[1].person.fullName;
        const player1Team = await getTeam(player1[0]);
        const player1Position = await getPosition(player1[1]);
        const player1Stat = await getStat(player1);

        const player2 = originalPlayers[1];
        const player2Name = player2[1].person.fullName;
        const player2Team = await getTeam(player2[0]);
        const player2Position = await getPosition(player2[1]);
        const player2Stat = await getStat(player2);

        setPlayerOne(player1);
        setPlayerOneName(player1Name);
        setPlayerOneTeam(player1Team);
        setPlayerOnePosition(player1Position);
        setPlayerOneStat(player1Stat);
        setPlayerOneHeadshot("https://cms.nhl.bamgrid.com/images/headshots/current/168x168/" + player1[1].person.id + ".jpg")

        setPlayerTwo(player2);
        setPlayerTwoName(player2Name);
        setPlayerTwoTeam(player2Team);
        setPlayerTwoPosition(player2Position);
        setPlayerTwoStat(player2Stat);
        setPlayerTwoHeadshot("https://cms.nhl.bamgrid.com/images/headshots/current/168x168/" + player2[1].person.id + ".jpg")

        setPlaying(true);
        setLoading(false);
    }

    async function getTeam(id) {
        let teamName = "";
        
        switch(type) {
            case "NHL":
                const json = await getJSON("https://statsapi.web.nhl.com/api/v1/teams/" + id);
                teamName = json.teams[0].name;
                break;
            case "NBA":
                break;
            default:
                break;
        }

        return teamName;
    }

    async function getPosition(player) {
        let position = "";
        
        switch(type) {
            case "NHL":
                position = player.position.abbreviation;
                break;
            case "NBA":
                break;
            default:
                break;
        }

        return position;
    }

    async function getStat(player) {
        let returnVal = 0;

        switch(type) {
            case "NHL":
                const id = player[1].person.id;
                const json = await getJSON("https://statsapi.web.nhl.com/api/v1/people/" + id + "/stats?stats=statsSingleSeason&season=" + season);
                
                switch(chosenStat) {
                    case "points":
                        try {
                            returnVal = json.stats[0].splits[0].stat.goals + json.stats[0].splits[0].stat.assists;
                        } catch (err) {
                            returnVal = 0;
                        }

                        break;
                    case "goals":
                        try {
                            returnVal = json.stats[0].splits[0].stat.goals;
                        } catch (err) {
                            returnVal = 0;
                        }

                        break;
                    case "assists":
                        try {
                            returnVal = json.stats[0].splits[0].stat.assists;
                        } catch (err) {
                            returnVal = 0;
                        }

                        break;
                    default:
                        break;
                }

                break;
            case "NBA":
                break;
            default:
                break;
        }

        return returnVal;
    }

    async function getJSON(url) {
        return fetch(url)
            .then((response) => response.json())
            .then((responseJSON) => {
                return responseJSON;
            });
    }

    function getOriginalPlayers() {
            const index1 = Math.floor(Math.random() * (playerList.length + 1));
            const player1 = playerList[index1];

            let index2 = Math.floor(Math.random() * (playerList.length + 1));
            while (index1 === index2) {
                index2 = Math.floor(Math.random() * (playerList.length + 1));
            }
            const player2 = playerList[index2];

            return [player1, player2];
    }

    function higher() {
        if (playerTwoStat >= playerOneStat) {
            setLoading(true);
            swap();
            setCorrect(true);
            setScore((prevScore) => prevScore + 1);
            setLoading(false);
        } else {
            setCorrect(false);
            setLost(true);
        }
    }

    function lower() {
        if (playerTwoStat <= playerOneStat) {
            setLoading(true);
            swap();
            setCorrect(true);
            setScore((prevScore) => prevScore + 1);
            setLoading(false);
        } else {
            setCorrect(false);
            setLost(true);
        }
    }

    async function swap() {
        const prevNameTemp = playerOneName;
        const prevStatTemp = playerOneStat;

        let newPlayer = getNewPlayer();
        while (newPlayer === playerTwo) {
            newPlayer = getNewPlayer();
        }
        const newPlayerName = newPlayer[1].person.fullName;
        const newPlayerTeam = await getTeam(newPlayer[0]);
        const newPlayerPosition = await getPosition(newPlayer[1]);
        const newPlayerStat = await getStat(newPlayer);
        const newPlayerHeadshot = "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/" + newPlayer[1].person.id + ".jpg";

        setPrevName(prevNameTemp);
        setPrevStat(prevStatTemp);

        setPlayerOne(playerTwo);
        setPlayerOneName(playerTwoName);
        setPlayerOneTeam(playerTwoTeam);
        setPlayerOnePosition(playerTwoPosition);
        setPlayerOneStat(playerTwoStat);
        setPlayerOneHeadshot(playerTwoHeadshot);

        setPlayerTwo(newPlayer);
        setPlayerTwoName(newPlayerName);
        setPlayerTwoTeam(newPlayerTeam);
        setPlayerTwoPosition(newPlayerPosition);
        setPlayerTwoStat(newPlayerStat);
        setPlayerTwoHeadshot(newPlayerHeadshot);
    }

    function getNewPlayer() {
        let player;

        switch(type) {
            case "NHL":
                const index = Math.floor(Math.random() * (playerList.length + 1));
                player = playerList[index];
                break;
            case "NBA":
                break;
            default:
                break;
        }

        return player;
    }

    function playAgain() {
        setScore(0);
        setPlaying(false);
        setLost(false);
    }

    function refresh() {
        window.location.reload(false);
    }

    return (
        <>
            {!loading && !playing && 
                <div className="loading">
                    <div className="loading-content">
                        <h1>Player List Loaded</h1>
                        <button onClick={play}>Play</button>
                    </div>
                </div>
            }

            {loading &&
                <div className="loading">
                    <div className="loading-content">
                        <p>Loading...</p>
                    </div>
                </div>
            }

            {!loading && playing && type === "NHL" &&
                <div className="nhl-game">
                    <div className="even-columns">
                        <div className="card-col">
                            <div className="card-col-container">
                                <Card name={playerOneName} team={playerOneTeam} position={playerOnePosition} headshot={playerOneHeadshot} />
                            </div>
                        </div>
                        <div className="col">
                            <div className="middle">
                                <p>Score: {score}</p>

                                {!lost && correct && 
                                    <p className="correct">Correct</p>
                                }

                                {!lost && correct && 
                                    <p>{prevName}: {prevStat}</p>
                                }

                                {!lost && correct &&
                                    <p>{playerOneName}: {playerOneStat}</p>
                                }

                                {!lost && 
                                    <p>{playerTwoName} higher or lower than {playerOneName}?</p>
                                }

                                {!lost && 
                                    <div className="button-group">
                                        <button onClick={higher}>Higher</button>
                                        <button onClick={lower}>Lower</button>
                                    </div>
                                }

                                {lost && 
                                    <div className = "button-group">
                                        <button onClick={playAgain}>Play Again</button>
                                        <button onClick={refresh}>Change Settings</button>
                                    </div>
                                }
                            </div>
                        </div>
                        <div className="card-col">
                            <div className="card-col-container">
                                <Card name={playerTwoName} team={playerTwoTeam} position={playerTwoPosition} headshot={playerTwoHeadshot} />
                            </div>
                        </div>
                    </div>
                </div>
            }
            {console.log(playerTwo)}
        </>
    );
}

export default Game;