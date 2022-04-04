import React, { useCallback, useEffect, useState } from "react";
import Cookies from 'universal-cookie';
import './Hertl.css';
import playerList from './scraping/nhl_players.json';
import answerList from './scraping/answer_list.json';

const cookies = new Cookies();

function DailyHertl(props) {
    // state variables
    const [err, setErr] = useState(null);
    const [correctPlayer, setCorrectPlayer] = useState();
    const [playing, setPlaying] = useState(true);
    const [searching, setSearching] = useState(false);
    const [filtered, setFiltered] = useState([]);
    const [guesses, setGuesses] = useState([]);
    const [oneGuess, setOneGuess] = useState(false);
    const [won, setWon] = useState(false);
    const [lost, setLost] = useState(false);
    const [date, setDate] = useState();

    const maxGuesses = 8;

    // checks guessed player object against the correct player
    function checkGuess(player) {
        let updated = checks(player, correctPlayer);

        // guessed player
        if (player.id === correctPlayer.id) {
            setWon(true);
            setPlaying(false);
            saveStats(true, player);
            return [updated, true];
        }

        return [updated, false];
    }

    const checks = useCallback((player, correct) => {
        let updated = player;

        if (player.name === correct.name) {
            updated.name_color = "green";
        }

        if (player.team === correct.team) {
            updated.team_color = "green";
        } else if (correct.formerTeams.includes(player.team)) {
            updated.team_color = "yellow"
        }

        if (player.division === correct.division) {
            updated.division_color = "green";
        } else if  (player.conference === correct.conference) {
            updated.division_color = "yellow";
        }

        if (player.nationality === correct.nationality) {
            updated.nationality_color = "green";
        }

        if (player.position === correct.position) {
            updated.position_color = "green";
        } else if ((["LW", "C", "RW"].includes(correct.position) && ["LW", "C", "RW"].includes(player.position))) {
            updated.position_color = "yellow";
        }

        if (player.number === correct.number) {
            updated.number_color = "green";
        } else if (player.number >= (correct.number - 3) && player.number <= (correct.number + 3)) {
            updated.number_color = "yellow";
        }

        if (player.currentAge === correct.currentAge) {
            updated.age_color = "green";
        } else if (player.currentAge >= (correct.currentAge - 3) && player.currentAge <= (correct.currentAge + 3)) {
            updated.age_color = "yellow";
        }

        const guess_height = convert_height(player.height);
        const correct_height = convert_height(correct.height);
        if (guess_height === correct_height) {
            updated.height_color = "green";
        } else if (guess_height >= (correct_height - 3) && guess_height <= (correct_height + 3)) {
            updated.height_color = "yellow";
        }

        if (player.weight === correct.weight) {
            updated.weight_color = "green";
        } else if (player.weight >= (correct.weight - 10) && player.weight <= (correct.weight + 10)) {
            updated.weight_color = "yellow";
        }

        return updated;
    }, []);

    // update doc title
    useEffect(() => {
        if (cookies.get("hertl-game") !== undefined) {
            //console.log('exists');
        }

        document.title = props.title;

        const today = new Date();
        const date = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();

        if (localStorage.getItem("daily-hertl-stats") === null) {
            try {
                setCorrectPlayer(getPlayer(date));
                setDate(date);
            } catch (e) {
                setErr(e.message);
            }
        } else {
            try {
                const correct = getPlayer(date);
                const stats = JSON.parse(localStorage.getItem("daily-hertl-stats"));
                if (date in stats) {
                    setPlaying(false);
                    setOneGuess(true);

                    let ids = stats[date];
                    let guessList = [];
                    ids.forEach((id) => {
                        playerList.forEach((player) => {
                            if (player.id === id) {
                                guessList.push(player);
                                return;
                            }
                        });
                    });
                    let final = [];

                    console.log(correct);
                    guessList.forEach((guess) => {
                        final.push(checks(guess, correct));
                    });

                    setGuesses(final);
                } else {
                    setCorrectPlayer(correct);
                    setDate(date);
                }
            } catch (e) {
                setErr(e.message);
            }
        }
    }, [props.title, checks]);

    // generates random player from player list
    function getPlayer(date) {
        let selected;
        answerList.forEach((answer) => {
            if (answer.date === date) {
                selected = answer;
            }
        });
        
        if (selected === undefined) {
            throw new Error("Invalid date");
        }

        return selected;
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

        const json_str = JSON.stringify([...guesses, guessed[0]]);
        console.log(json_str);
        cookies.set("hertl-game", json_str, { path: '/' });

        if (!oneGuess) {
            setOneGuess(true);
        }

        if (!guessed[1] && guesses.length >= (maxGuesses-1)) {
            setPlaying(false);
            setLost(true);
            saveStats(false, guessed[0]);
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
    
    function convert_height(height) {
        const regex = /^(\d)'\s(\d{1,2})"$/;
        const found = height.match(regex);
        return (parseInt(found[1]) * 12) + parseInt(found[2]);
    }

    function refresh() {
        window.location.reload(false);
    }

    function saveStats(didWin, lastGuess) {
        console.log(lastGuess);
        if (localStorage.getItem("daily-hertl-stats") === null) {
            let object = {
                currentStreak: 0,
                maxStreak: 0,
                won: 0,
                played: 1,
                one: 0,
                two: 0,
                three: 0,
                four: 0,
                five: 0,
                six: 0,
                seven: 0,
                eight: 0
            };

            let ids = getGuessIds();
            let final = [...ids, lastGuess.id];
            object[date] = final;
            
            if (didWin) {
                object.currentStreak += 1;
                object.maxStreak += 1;
                object.won += 1;
                switch(guesses.length + 1) {
                    case 1:
                        object.one += 1;
                        break;
                    case 2:
                        object.two += 1;
                        break;
                    case 3:
                        object.three += 1;
                        break;
                    case 4:
                        object.four += 1;
                        break;
                    case 5:
                        object.five += 1;
                        break;
                    case 6:
                        object.six += 1;
                        break;
                    case 7:
                        object.seven += 1;
                        break;
                    case 8:
                        object.eight += 1;
                        break;
                    default:
                        refresh()
                        break;
                }
            }

            localStorage.setItem("daily-hertl-stats", JSON.stringify(object));
        } else {
            let object = JSON.parse(localStorage.getItem("daily-hertl-stats"));
            const guessList = getGuessIds();
            console.log(guessList);
            object[date] = guessList;
            object.played += 1;

            if (didWin) {
                object.currentStreak += 1;
                object.maxStreak += 1;
                object.won += 1;
                switch(guesses.length + 1) {
                    case 1:
                        object.one += 1;
                        break;
                    case 2:
                        object.two += 1;
                        break;
                    case 3:
                        object.three += 1;
                        break;
                    case 4:
                        object.four += 1;
                        break;
                    case 5:
                        object.five += 1;
                        break;
                    case 6:
                        object.six += 1;
                        break;
                    case 7:
                        object.seven += 1;
                        break;
                    case 8:
                        object.eight += 1;
                        break;
                    default:
                        refresh()
                        break;
                }
            }

            localStorage.setItem("daily-hertl-stats", JSON.stringify(object));
        }
    }

    function getGuessIds() {
        let list = [];
        guesses.forEach((guess) => {
            list.push(guess.id);
        });
        return list;
    }

    return (
        <main>
            <div className="container">
                {err !== null &&
                    <p>{err}</p>
                }
                {err === null &&
                (<div className="game">
                    {playing &&
                        <input id="search-field" onChange={search} placeholder={"Guess " + (guesses.length + 1) + " of " + maxGuesses} />
                    }
                    {searching &&
                        (<div className="search-results">
                            <ul>
                                {
                                    filtered.map((player) => {
                                        return (
                                            <li key={player.id} id={player.id} onClick={guess}><img src={"https://cms.nhl.bamgrid.com/images/headshots/current/168x168/" + player.id + ".jpg"} alt="" className="small-headshot" id={player.id}></img><p id={player.id}>{player.name}, {player.team}</p></li>
                                        )
                                    })
                                }
                            </ul>
                        </div>)
                    }
                    {/*oneGuess &&*/
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
                </div>)
                }
            </div>
        </main>
    );
}

export default DailyHertl;