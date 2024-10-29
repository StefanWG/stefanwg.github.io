import os
import requests 
import string
import requests 
import string
import time

artistSet = set()
genres = set()
clients = [ #id:secret
    ("9df812092a354a3a9511c8f8c3f524b3","9d5b9e0a7fab4f0b8c116eecf7be6feb"),
    ("d66131f4746a4aaf9c0c09d5953d3d3b","7d611260c72e4c3f90dd22e98dce6dc5"),
    ("fc6eadf8b1d2497a886ce17949158f8b","1a656b8ed253448196bd57d6082e0082"),
    ("de3b45883d644a98818e1bf46dabd689","2febe53ad75347829d94c5b504cbaa9d"),
    ("c496a90d3e2240cb867d5319bb50a669","7346e4dbd4f44ac68b5a47b05fade985"),
    ("018f312ce9114f56b9f6e8c20b01d041","2281163b2f0c42ba9c58fdc90bfa0525"),
    ("6dabb761ab9c41f9ae2ee296075a40f7","a35e14dff42c47ff827b816362a0b413"),
    ("1754c780383f4417ba35da7022f09482","68259c24750f411e8c37e0e0ea2ea3c2")
]

curr_client = 0
AUTH_URL = 'https://accounts.spotify.com/api/token'
BASE_URL = 'https://api.spotify.com/v1/'

def parseResults(res, file):
    for artist in res:
        artistId = artist["id"]
        if artistId not in artistSet:
            artistSet.add(artistId)
            genres = "&".join(artist["genres"])
            file.write(f'{artistId},{artist["name"]},{artist["popularity"]},{genres}\n')

def handleRequest(url, params, file, ignore_num_responses=False):
    global headers
    req = requests.get(url, headers=headers, params=params)
    total = req.json()["artists"]["total"]
    print(total)

    if total <= 1000 or ignore_num_responses:
        reqJson = req.json()["artists"]
        parseResults(reqJson["items"], file)
        while reqJson["next"] is not None:
            req = requests.get(reqJson["next"], headers=headers)
            if req.status_code == 200:
                parseResults(req.json()["artists"]["items"], file)
                reqJson = req.json()["artists"]
            elif req.status_code in [504, 429]:
                global curr_client
                curr_client += 1
                headers = getHeaders()
                return handleRequest(url, params, file, ignore_num_responses=ignore_num_responses)

            else:
                break
            
        return True
    else: 
        return False


def getGenres():
    genres = []
    with open("genres.csv", "r") as file:

        for line in file.readlines():
            genres.append(line.strip())
    genres.sort()
    genres.remove("")
    return genres


# TODO: Cache searches that dont return anything so we can avoid in the future
def getHeaders():
    req = requests.post(AUTH_URL, {
        'grant_type': 'client_credentials',
        'client_id': clients[curr_client][0],
        'client_secret': clients[curr_client][1],
    })
    access_token = req.json()["access_token"]

    headers = {'Authorization': f'Bearer {access_token}'}
    return headers




headers = getHeaders()
url = f'{BASE_URL}search'

genres = getGenres()

print(genres)
genresCompleted = set()
with open("artists.csv", "w") as file:
    for genre in genres:
        print(genre, curr_client)
        genre = genre.split()[0]
        if genre in genresCompleted:
            continue
        genresCompleted.add(genre)
        url = f'{BASE_URL}search'
        params = {
            "q":f"genre:{genre}",
            "type":"artist",
            "limit":50,
            "offset":0
        }
        res = handleRequest(url, params, file, ignore_num_responses=True)
        if not res:
            for letter in list(string.ascii_lowercase):
                params = {
                    "q":f"q={letter} genre:{genre}",
                    "type":"artist",
                    "limit":50,
                    "offset":0
                }
                res = handleRequest(url, params, file)
                if not res:
                    for letter2 in list(string.ascii_lowercase):
                        params = {
                            "q":f"q={letter}{letter2} genre:{genre}",
                            "type":"artist",
                            "limit":50,
                            "offset":0
                        }
                        res = handleRequest(url, params, file, ignore_num_responses=True)

