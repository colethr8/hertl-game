import React, { useEffect, useState } from "react";
import './Hertl.css';
import playerList from './scraping/nhl_players.json'

function Hertl(props) {
    // state variables
    const [correctPlayer, setCorrectPlayer] = useState();
    const [playing, setPlaying] = useState(true);
    const [searching, setSearching] = useState(false);
    const [filtered, setFiltered] = useState([]);
    const [guesses, setGuesses] = useState([]);
    const [oneGuess, setOneGuess] = useState(false);
    const [won, setWon] = useState(false);
    const [lost, setLost] = useState(false);

    // generate correct player
    console.log(correctPlayer);
    const maxGuesses = 8;

    // update doc title
    useEffect(() => {
        setCorrectPlayer(getRandomPlayer());
        document.title = props.title;
    }, [props.title]);

    // generates random player from player list
    function getRandomPlayer() {
        return playerList[Math.floor(Math.random() * playerList.length)];
    }

    // filter player list based on search inputted by user
    function search(event) {
        setFiltered([]);
        const val = event.target.value;
        if (val.length >= 3) {
            setSearching(true);
            playerList.forEach((player) => {
                const name = player.name;
                if (name.toLowerCase().includes(val.toLowerCase())) {
                    setFiltered((old) => [...old, player]);
                }
            });
        }
    }

    // make a guess via selected search
    function guess(event) {
        setSearching(false);
        setFiltered([]);
        document.getElementById("search-field").value = "";

        let guessed = checkGuess(getFilteredPlayer(event.target.id));
        setGuesses((old) => [...old, guessed[0]]);
        if (!oneGuess) {
            setOneGuess(true);
        }

        if (!guessed[1] && guesses.length >= (maxGuesses-1)) {
            setPlaying(false);
            setLost(true);
        }
    }

    // gets player object for searched player
    function getFilteredPlayer(id) {
        let selected;
        filtered.forEach((player) => {
            if (player.id === parseInt(id)) {
                selected = player;
            }
        });
        return selected;
    }

    // checks guessed player object against the correct player
    function checkGuess(player) {
        let updated = player;

        if (player.name === correctPlayer.name) {
            updated.name_color = "green";
        }

        if (player.team === correctPlayer.team) {
            updated.team_color = "green";
        } else if (correctPlayer.formerTeams.includes(player.team)) {
            updated.team_color = "yellow"
        }

        if (player.division === correctPlayer.division) {
            updated.division_color = "green";
        } else if  (player.conference === correctPlayer.conference) {
            updated.division_color = "yellow";
        }

        if (player.nationality === correctPlayer.nationality) {
            updated.nationality_color = "green";
        }

        if (player.position === correctPlayer.position) {
            updated.position_color = "green";
        } else if ((["LW", "C", "RW"].includes(correctPlayer.position) && ["LW", "C", "RW"].includes(player.position))) {
            updated.position_color = "yellow";
        }

        if (player.number === correctPlayer.number) {
            updated.number_color = "green";
        } else if (player.number >= (correctPlayer.number - 3) && player.number <= (correctPlayer.number + 3)) {
            updated.number_color = "yellow";
        }

        if (player.currentAge === correctPlayer.currentAge) {
            updated.age_color = "green";
        } else if (player.currentAge >= (correctPlayer.currentAge - 3) && player.currentAge <= (correctPlayer.currentAge + 3)) {
            updated.age_color = "yellow";
        }

        const guess_height = convert_height(player.height);
        const correct_height = convert_height(correctPlayer.height);
        if (guess_height === correct_height) {
            updated.height_color = "green";
        } else if (guess_height >= (correct_height - 3) && guess_height <= (correct_height + 3)) {
            updated.height_color = "yellow";
        }

        if (player.weight === correctPlayer.weight) {
            updated.weight_color = "green";
        } else if (player.weight >= (correctPlayer.weight - 10) && player.weight <= (correctPlayer.weight + 10)) {
            updated.weight_color = "yellow";
        }

        // guessed player
        if (player.id === correctPlayer.id) {
            setWon(true);
            setPlaying(false);
            return [updated, true];
        }

        return [updated, false];
    }

    function convert_height(height) {
        const regex = /^(\d)'\s(\d{1,2})"$/;
        const found = height.match(regex);
        return (parseInt(found[1]) * 12) + parseInt(found[2]);
    }

    function refresh() {
        window.location.reload(false);
    }

    return (
        <main>
            <div className="container">
                <div className="game">
                    {playing &&
                        <input id="search-field" onChange={search} placeholder={"Guess " + (guesses.length + 1) + " of " + maxGuesses} />
                    }
                    {searching &&
                        (<div id="searchResults">
                            <ul>
                                {
                                    filtered.map((player) => {
                                        return (
                                            <li key={player.id} id={player.id} onClick={guess}>{player.name}</li>
                                        )
                                    })
                                }
                            </ul>
                        </div>)
                    }
                    {oneGuess &&
                    (<div id="guesses-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Team</th>
                                    <th>Division</th>
                                    <th>Nationality</th>
                                    <th>Position</th>
                                    <th>Number</th>
                                    <th>Age</th>
                                    <th>Height</th>
                                    <th>Weight</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    guesses.map((guess) => {
                                        return (
                                            <tr key={guess.id}>
                                                <td className={guess.name_color}>{guess.name}</td>
                                                <td className={guess.team_color}>{guess.team}</td>
                                                <td className={guess.division_color}>{guess.division}</td>
                                                <td className={guess.nationality_color}><img src={require('./img/flags/' + guess.nationality + '.png')} alt={guess.nationality} id="flag"></img></td>
                                                <td className={guess.position_color}>{guess.position}</td>
                                                <td className={guess.number_color}>{guess.number}</td>
                                                <td className={guess.age_color}>{guess.currentAge}</td>
                                                <td className={guess.height_color}>{guess.height}</td>
                                                <td className={guess.weight_color}>{guess.weight}</td>
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </table>
                    </div>)
                    }
                    {won && 
                    (<div id="won">
                        <p>You guessed the player</p>
                    </div>)
                    }
                    {lost &&
                    (<div id="lost">
                        <p>You lost. The player was {correctPlayer.name}</p>
                    </div>)
                    }
                    {(lost || won) &&
                    <button onClick={refresh}>Play Again</button> 
                    }
                </div>
            </div>
        </main>
    );
}

export default Hertl;