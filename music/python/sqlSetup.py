#!/usr/bin/env python3
import mysql.connector
from mysql.connector.constants import ClientFlag
from encryption import encrypt, decrypt
import random
import sys


def createTable(cursor, conn, name, columns, drop=False):
    if drop:
        cursor.execute(f"DROP TABLE IF EXISTS {name}")
    query = f'CREATE TABLE IF NOT EXISTS {name} (\n'
    for i in range(len(columns)):
        query += columns[i]
        if i != len(columns)-1:
            query += ",\n"
        else:
            query += "\n"
    query += ');'
    cursor.execute(query)
    conn.commit()

def createUsersTable(config):
    conn = mysql.connector.connect(**config)
    cursor = conn.cursor()
    columns = [
        "id INT NOT NULL AUTO_INCREMENT PRIMARY KEY",
        "username VARCHAR(344) NOT NULL",
        "password VARCHAR(344) NOT NULL"
    ]
    createTable(cursor, conn, "users", columns, drop=True)
    conn.close() 

def createArtistTable(config):
    conn = mysql.connector.connect(**config)
    cursor = conn.cursor()
    columns = [
        "artistID VARCHAR(22) NOT NULL PRIMARY KEY",
        "artistName VARCHAR(64) NOT NULL",
        "popularity INT NOT NULL",
        "genres VARCHAR(256) NOT NULL",
        "imageUrl VARCHAR(128) NOT NULL"
    ]
    cursor.execute("SET FOREIGN_KEY_CHECKS=0;")
    conn.commit()
    createTable(cursor, conn, "artists", columns, drop=True)
    cursor.execute("SET FOREIGN_KEY_CHECKS=1;")
    conn.commit()
    conn.close() 

def createPricesTable(config):
    conn = mysql.connector.connect(**config)
    cursor = conn.cursor()
    columns = [
        "id INT NOT NULL AUTO_INCREMENT PRIMARY KEY",
        "artistID VARCHAR(22) NOT NULL",
        "price DOUBLE(5,2) NOT NULL",
        "date DATE NOT NULL",
        "time TIME NOT NULL",
        "FOREIGN KEY(artistID) REFERENCES artists(artistID)"
    ]
    createTable(cursor, conn, "prices", columns, drop=True)
    conn.close() 

def fetchAllFromTable(config, table, decry=True):
    conn = mysql.connector.connect(**config)
    cursor = conn.cursor()
    output = []
    cursor.execute(f"SELECT * FROM {table}")
    for r in cursor.fetchall():
        print(r)
        output.append(tuple(r[i] if i in [0,1] else decrypt(r[i]) if decry else r[i] for i in range(len(r))))
    return output

def registerUser(config, username, password):
    conn = mysql.connector.connect(**config)
    cursor = conn.cursor()

    cursor.execute(f"SELECT * FROM users WHERE username='{username}'")
    if len(cursor.fetchall()) > 0:
        print("USERNAME EXISTS")
        exit()
    try:
        sql = f'''INSERT INTO users (username, password) 
                VALUES ('{username}', '{encrypt(password)}');'''
        cursor.execute(sql)
        conn.commit()
        conn.close()
        print(1)
    except:
        print("SQL ERROR")

def addNewArtist(config, id, name): #TODO: add image
    conn = mysql.connector.connect(**config)
    cursor = conn.cursor()

    cursor.execute(f"SELECT * FROM artists WHERE artistID='{id}'")
    if len(cursor.fetchall()) > 0:
        print("ARTIST EXISTS")
        exit()
    try:
        sql = f'''INSERT INTO artists (artistID, artistName) 
                VALUES ('{id}', '{name}');'''
        cursor.execute(sql)
        conn.commit()
        conn.close()
        print(1)
    except:
        print("SQL ERROR")

def addNewPrice(config, id, price, date, time, cursor=None): # USE curdate and curtime - https://linuxhint.com/insert-current-date-and-time-in-mysql/
    if cursor is None:
        conn = mysql.connector.connect(**config)
        cursor = conn.cursor()

    try:
        sql = f'''INSERT INTO prices (artistID, price, date, time) 
                VALUES ('{id}', {price}, STR_TO_DATE('{date}', '%d/%m/%Y'), '{time}');'''
        cursor.execute(sql)
        if cursor is None:
            conn.commit()
            conn.close()
        print(1)
    except:
        print(sql)
        print("SQL ERROR")

def login(config, username, password):
    conn = mysql.connector.connect(**config)
    cursor = conn.cursor()
    cursor.execute(f'SELECT * FROM users WHERE username="{username}";')
    out = cursor.fetchall()[0]
    if password == decrypt(out[-1]):
        print(1)
    else:
        print(0)
    

def simPricesTable(config, artistId):
    conn = mysql.connector.connect(**config)
    cursor = conn.cursor()
    price = 1.0
    for year, month in [(2021, 11), (2021, 12), (2022, 1), (2022, 2)]:
        for day in range(1,32):
            if year == 2022 and day == 2 and month == 2:
                conn.commit()
                conn.close()
                return
            date = f'{day}/{month}/{year}'
            addNewPrice(config, artistId, round(price, 2), date, '12:00:00', cursor)
            price += float(round((random.random() * .4 - .2)*100)) / 100.0
            price = 0 if price < 0 else price


def populateArtistsTable(config):
    createArtistTable(config)
    conn = mysql.connector.connect(**config)
    cursor = conn.cursor()
    with open("python/artists.csv", "r") as file:
        added = 0
        for line in file.readlines():
            l = line.strip().split(",")
            if len(l) == 4:
                if int(l[2]) > 90:
                    print(l)
                    sql = f'''INSERT INTO artists (artistID, artistName, popularity, genres)
                    VALUES ("{l[0]}", "{l[1]}", {int(l[2])}, "{l[3]}");'''
                    print(sql)
                    cursor.execute(sql)

    conn.commit()
    conn.close()


config = {
    'user': 'root',
    'password': 'musicfun',
    'host': '34.95.35.104',
    'client_flags': [ClientFlag.SSL],
    'ssl_ca': 'ssl/server-ca.pem',
    'ssl_cert': 'ssl/client-cert.pem',
    'ssl_key': 'ssl/client-key.pem',
    'database':"music"
}

if __name__ == "__main__":
    pass
    # populateArtistsTable(config)

    # createPricesTable(config)
    
    # simPricesTable(config)
    # print(fetchAllFromTable(config, "prices", False))

    argv = sys.argv
    func = argv[1]
    if func == "registerUser":
        #TODO: VALIDATE
        registerUser(config, argv[2], argv[3])

    if func == "fetchAllFromTable":
        f = fetchAllFromTable(config, argv[2])
        for a in f:
            print(a)
    if func == "login":
        login(config, argv[2], argv[3])









