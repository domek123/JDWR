from flask import Flask, request, session , redirect, jsonify
from flask_cors import CORS, cross_origin
import sqlite3
import os
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = '../public/news_img'
app = Flask(__name__)
app.config['SECRET_KEY'] = 'Qwerty123!'
cors = CORS(app)
app.config['CORS_HEADERS'] = "Content-Type"
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

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

@app.route('/getUsers' , methods=['GET'])
@cross_origin()
def getUsers():
    myConnection = sqlite3.connect('./modules/db.sqlite')
    myCursor = myConnection.cursor()
    myCursor.execute("SELECT *,oid FROM UsersData")
    records = myCursor.fetchall()
    myConnection.close()
    responseObj = {"Users": records}
    return jsonify(responseObj)

@app.route('/removeUser' , methods=['POST'])
@cross_origin()
def removeUser():
    content = request.json
    myConnection = sqlite3.connect('./modules/db.sqlite')
    myCursor = myConnection.cursor()
    myCursor.execute('DELETE FROM UsersData WHERE oid=' + str(content['id']) +"")
    myConnection.commit()
    myCursor.execute("SELECT *,oid FROM UsersData")
    print(myCursor.fetchall())
    myConnection.close()

    return jsonify({"id" : content['id']})
@app.route('/editUser' , methods=["POST"])
@cross_origin()
def editUser():
    content = request.json
    print(content)
    myConnection = sqlite3.connect('./modules/db.sqlite')
    myCursor = myConnection.cursor()
    myCursor.execute( "UPDATE UsersData SET FullName='" + content['fullName'] + "' , login='" + content['login'] + "' , password='" + content['password'] + "', isAdmin="+ str(content['isAdmin']) +"  WHERE oid='" +
            str(content['id']) + "'")
    myConnection.commit()
    myConnection.close()

    return jsonify(content)


@app.route('/file' , methods=['POST'])
@cross_origin()
def file():
    print(request.files.getlist('files'))

    for f in request.files.getlist('files'):

        filename = secure_filename(f.filename)
        f.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

    return  jsonify({"a" : "b"})


if __name__ == '__main__':
    app.run(debug=True, port=3421)