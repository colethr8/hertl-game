from urllib.request import urlopen
import json

teams = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 28, 29, 30, 52, 53, 54, 55]

new_json = []

for team in teams:
    # load roster for each team
    url = 'https://statsapi.web.nhl.com/api/v1/teams/{0}?expand=team.roster'.format(team)
    response = urlopen(url)
    data_json = json.loads(response.read())
    roster = data_json['teams'][0]['roster']['roster']
    for player in roster:
        link = player['person']['link']
        id = player['person']['id']
        name = player['person']['fullName']

        # load player info
        player_url = 'https://statsapi.web.nhl.com' + link
        player_response = urlopen(player_url)
        player_json = json.loads(player_response.read())
        player = player_json['people'][0]
        
        # get player attributes
        number = player['primaryNumber']
        position = player['primaryPosition']['abbreviation']
        team_id = player['currentTeam']['id']
        team = data_json['teams'][0]['name']
        conference = data_json['teams'][0]['conference']['name']
        division = data_json['teams'][0]['division']['name']
        age = player['currentAge']
        number = player['primaryNumber']
        nationality = player['nationality']
        height = player['height']
        weight = player['weight']

        # get list of former teams
        formerTeams = []
        stats_url = player_url + "/stats?stats=yearByYear"
        stats_response = urlopen(stats_url)
        stats_json = json.loads(stats_response.read())
        seasons = stats_json['stats'][0]['splits']

        for season in seasons:
            old_team = season['team']['name']
            if old_team not in formerTeams and old_team != team:
                formerTeams.append(old_team)

        data = {
            'id': id,
            'name': name,
            'number': number,
            'position': position,
            'team_id': team_id,
            'team': team,
            'conference': conference,
            'division': division,
            'currentAge': age,
            'primaryNumber': number,
            'nationality': nationality,
            'height': height,
            'weight': weight,
            'formerTeams': formerTeams
        }

        new_json.append(data)

with open('nhl_players.json', 'w', encoding='utf-8') as f:
    json.dump(new_json, f, ensure_ascii=False, indent=4)