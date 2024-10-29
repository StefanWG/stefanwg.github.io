'''
This file is used to generate encryption codes for database
'''
import rsa
import base64

def genRSAKeys():
    public_key_1, private_key_1 = rsa.newkeys(2048)
    with open("python/pubKey.pem", "w") as file:
        file.write(public_key_1.save_pkcs1().decode())
    with open("python/privKey.pem", "w") as file:
        file.write(private_key_1.save_pkcs1().decode())

def encrypt(message):
    with open("python/pubKey.pem", "rb") as file:
        key = rsa.PublicKey.load_pkcs1(file.read())  
    crypto = rsa.encrypt(message.encode("utf-8"), key)
    crypto64 = base64.b64encode(crypto).decode()
    return crypto64

def decrypt(crypto64):
    crypto = base64.b64decode(crypto64.encode())
    with open("python/privKey.pem", "rb") as file:
        key = rsa.PrivateKey.load_pkcs1(file.read())
    message = rsa.decrypt(crypto, key)
    return message.decode()