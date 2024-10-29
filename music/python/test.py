import os
import requests 
import string
import requests 
import string
import sqlSetup as sql
import mysql

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

curr_client = 1
AUTH_URL = 'https://accounts.spotify.com/api/token'
BASE_URL = 'https://api.spotify.com/v1/'

def parseResults(res, file):
    for artist in res:
        artistId = artist["id"]
        if artistId not in artistSet:
            artistSet.add(artistId)
            genres = "&".join(artist["genres"])
            file.write(f'{artistId},{artist["name"]},{artist["popularity"]},{genres}\n')

def getHeaders():
    req = requests.post(AUTH_URL, {
        'grant_type': 'client_credentials',
        'client_id': clients[curr_client][0],
        'client_secret': clients[curr_client][1],
    })
    access_token = req.json()["access_token"]
    print(access_token)
    headers = {'Authorization': f'Bearer {access_token}'}
    return headers

def handleRequest(url, params):
    global headers
    req = requests.get(url, headers=headers, params=params)
    r = req.json()
    return {
        "name":r["name"],
        "id": r["id"],
        "pop": r["popularity"],
        "image":r["images"][0]["url"],
        "genres":"**".join(r["genres"])
    }

headers = getHeaders()

conn = mysql.connector.connect(**sql.config)
cursor = conn.cursor()

x = sql.fetchAllFromTable(sql.config, "users")
print(x)
exit()


query = '''
                SELECT a.* FROM 
                    artists AS a
                    INNER JOIN 
                        SELECT a.artistID, a.price FROM prices b
                            INNER JOIN (select artistID, max(date) as maxdate FROM prices GROUP BY artistID) AS b ON
                            b.artistID = c.artistID AND b.date = c.maxdate as c
                        on a.artistID = b.artistID'''
"""
                        (SELECT b.artistID, b.price FROM 
                        prices b
                        INNER JOIN (select artistID, max(date) as maxdate FROM prices GROUP BY artistID) as c ON
                        b.artistID = c.artistID AND b.date = c.maxdate)"""

cursor.execute("""SELECT * from
                artists a
                INNER JOIN(
                        (SELECT b.artistID, b.price FROM 
                        prices b
                        INNER JOIN (select artistID, max(date) as maxdate FROM prices GROUP BY artistID) as c ON
                        b.artistID = c.artistID AND b.date = c.maxdate)) as d on
                        a.artistID = d.artistID""")
for a in cursor.fetchall():
    print(a)

# sql.createPricesTable(sql.config)
# with open("python/artists.csv", "r") as file:
#     conn = mysql.connector.connect(**sql.config)
#     cursor = conn.cursor()
#     for line in file.readlines():
#         l = line.strip().split(",")
#         if len(l) == 4:
#             if int(l[2]) > 90:
#                 print(l[1])
#                 sql.simPricesTable(sql.config, l[0])
#     conn.commit()
#     conn.close()

# sql.createArtistTable(sql.config)

# with open("python/artists.csv", "r") as file:
#     conn = mysql.connector.connect(**sql.config)
#     cursor = conn.cursor()
#     for line in file.readlines():
#         l = line.strip().split(",")
#         if len(l) == 4:
#             if int(l[2]) > 90:
#                 res = handleRequest(f"{BASE_URL}artists/{l[0]}", None)
#                 query = f"""INSERT INTO artists (artistID, artistName, popularity, genres, imageUrl)
#                 VALUES ('{res['id']}', '{res['name']}', {int(res['pop'])}, '{res['genres']}', '{res['image']}') """
#                 cursor.execute(query)
#     conn.commit()
#     conn.close()
    

# print(sql.fetchAllFromTable(sql.config, "artists", False))
