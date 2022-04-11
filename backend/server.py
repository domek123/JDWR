from flask import Flask, request, session , redirect, jsonify
from flask_cors import CORS, cross_origin
import sqlite3



app = Flask(__name__)
app.config['SECRET_KEY'] = 'Qwerty123!'
cors = CORS(app)
app.config['CORS_HEADERS'] = "Content-Type"

@app.route('/Register', methods=['POST'])
@cross_origin()
def Register():
    print(request)
    content = request.json 
    myConnection = sqlite3.connect('./modules/db.sqlite')
    myCursor = myConnection.cursor()
    records = "Taki użytkownik już istnieje"

    myCursor.execute("SELECT *,oid FROM UsersData WHERE login='" + content['login'] + "'")
    if myCursor.fetchone() == None:

        myCursor.execute("INSERT INTO UsersData VALUES(:FullName, :login, :password, :isAdmin)", {
            'FullName': content['fullName'],
            'login': content['login'],
            'password': content['password'],
            'isAdmin': False
        })
        myConnection.commit()
        myCursor.execute("SELECT *,oid FROM UsersData WHERE login='" + content['login'] + "'")
        records = myCursor.fetchone()


    responseObj = {'Objects': records}
    myConnection.close()

    return jsonify(responseObj)

@app.route('/Login' , methods=['POST'])
@cross_origin()
def Login():
    content = request.json
    myConnection = sqlite3.connect('./modules/db.sqlite')
    myCursor = myConnection.cursor()
    records = ""

    myCursor.execute("SELECT *,oid FROM UsersData WHERE login='" + content['login'] + "' AND password='" + content['password'] + "'")
    if myCursor.fetchone() == None:
        records = "Niepoprawne dane"
    else:
        myCursor.execute("SELECT *,oid FROM UsersData WHERE login='" + content['login'] + "'")
        records = myCursor.fetchone()
        print(records)
    
    myConnection.close()
    responseObj = {'Objects' : records}
    return jsonify(responseObj)


if __name__ == '__main__':
    app.run(debug=True, port=3421)