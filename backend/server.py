from flask import Flask, request, session , redirect, jsonify, send_from_directory
from flask_cors import CORS, cross_origin
import sqlite3
import os
from werkzeug.utils import secure_filename




UPLOAD_FOLDER = '../public/news_img'
UPLOAD_FOLDER_GALLERY = '../public/gallery'
UPLOAD_FOLDER_SLIDER = '../public/slider'
app = Flask(__name__)
app.config['SECRET_KEY'] = 'Qwerty123!'
cors = CORS(app)
app.config['CORS_HEADERS'] = "Content-Type"
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['UPLOAD_FOLDER_GALLERY'] = UPLOAD_FOLDER_GALLERY
app.config['UPLOAD_FOLDER_SLIDER'] = UPLOAD_FOLDER_SLIDER

@app.route("/")
def index():
    return send_from_directory('../public' , 'index.html')

@app.route("/<path:path>")
def home(path):
    return send_from_directory('../public', path)


@app.route('/getConfig' , methods=['GET'])
@cross_origin()
def getConfig():
    myConnection = sqlite3.connect('./modules/db.sqlite')
    myCursor = myConnection.cursor()
    myCursor.execute("SELECT * FROM config")
    records = {'records': myCursor.fetchall()}
    return jsonify(records)


@app.route('/editConfig' , methods=['POST'])
@cross_origin()
def editConfig():
    content = request.json
    myConnection = sqlite3.connect('./modules/db.sqlite')
    myCursor = myConnection.cursor()
    for item in content['listOfSettings']:
        print(item['value'])
        myCursor.execute("UPDATE config SET configValue='" + str(item['value']) + "' WHERE configName='" + item['name'] +"'")
        myConnection.commit()
    myConnection.close()
    return jsonify({"a": "b"})

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

    try:
        for f in request.files.getlist('files'):
            filename = secure_filename(f.filename)
            f.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        return jsonify({"info": "success"})
    except:
        return jsonify({"info" : 'fail'})





@app.route('/addArticle' , methods=['POST'])
@cross_origin()
def addArticle():
   content = request.json
   myConnection = sqlite3.connect('./modules/db.sqlite')
   myCursor = myConnection.cursor()
   myCursor.execute("INSERT INTO Articles VALUES(:ArticleID , :header, :content, :photoName)", {
       'ArticleID': content['ArticleID'],
       'header': content['header'],
       'content': content['content'],
       'photoName': content['photoName']
   })
   myConnection.commit()
   myCursor.execute("INSERT INTO Articles VALUES(:ArticleID , :Category)", {
       'ArticleID' : content['ArticleID'],
       'Category' : content['Category']
   })
   myCursor.execute("SELECT * FROM Articles")
   print(myCursor.fetchall())
   myConnection.close()



   return jsonify(request.json)

@app.route('/getArticles' , methods=['GET'])
@cross_origin()
def getArticle():
    records = []
    myConnection = sqlite3.connect('./modules/db.sqlite')
    myCursor = myConnection.cursor()
    myCursor.execute("SELECT * FROM Articles, CategoryArt WHERE CategoryArt.ArticleID=Articles.ArticleID")
    records = myCursor.fetchall()
    records.reverse()

    return  jsonify({"records" : records})

@app.route('/addToGalleryFile' , methods=['POST'])
@cross_origin()
def addToGalleryFile():
    try:
        for f in request.files.getlist('files'):
            filename = secure_filename(f.filename)
            f.save(os.path.join(app.config['UPLOAD_FOLDER_GALLERY'], filename))
        return jsonify({"info": "success"})
    except:
        return jsonify({"info" : 'fail'})


@app.route('/addToGallery' , methods=['POST'])
@cross_origin()
def addToGallery():
   content = request.json
   myConnection = sqlite3.connect('./modules/db.sqlite')
   myCursor = myConnection.cursor()
   myCursor.execute("INSERT INTO Gallery VALUES(:PhotoID , :title, :text, :photoName)", {
       'PhotoID': content['PhotoID'],
       'title': content['title'],
       'text': content['text'],
       'photoName': content['photoName']
   })
   myConnection.commit()
   myCursor.execute("SELECT * FROM Gallery")
   print(myCursor.fetchall())
   myConnection.close()



   return jsonify(request.json)


@app.route('/getGallery' , methods=['GET'])
@cross_origin()
def getGallery():
    records = []
    myConnection = sqlite3.connect('./modules/db.sqlite')
    myCursor = myConnection.cursor()
    myCursor.execute("SELECT * FROM Gallery")
    records = myCursor.fetchall()
    

    return  jsonify({"records" : records})

@app.route('/getSingleArticle' , methods=['POST'])
@cross_origin()
def getSingleArticle():
    content = request.json['ArticleID']
    myConnection = sqlite3.connect('./modules/db.sqlite')
    myCursor = myConnection.cursor()
    myCursor.execute("SELECT * FROM Articles WHERE ArticleID='" + content +"'")
    record = myCursor.fetchone()
    return jsonify(record)

@app.route('/addComment', methods=['POST'])
@cross_origin()
def addComment():
    content = request.json
    myConnection = sqlite3.connect('./modules/db.sqlite')
    myCursor = myConnection.cursor()
    myCursor.execute("INSERT INTO Comments VALUES(:ArticleID , :AuthorLogin, :AuthorName, :Content)", {
        'ArticleID': content['ArticleID'],
        'AuthorLogin': content['AuthorLogin'],
        'AuthorName': content['AuthorName'],
        'Content': content['Content']
    })

    myConnection.commit()
    myCursor.execute("SELECT * FROM Comments")
    records = myCursor.fetchall()
    myConnection.close()

    return jsonify({'records': records})

@app.route('/getComments' , methods=['GET'])
@cross_origin()
def getComments():
    myConnection = sqlite3.connect('./modules/db.sqlite')
    myCursor = myConnection.cursor()
    myCursor.execute("SELECT * FROM Comments")
    records = {'records': myCursor.fetchall()}
    return jsonify(records)
@app.route('/addSlidePhoto' , methods=['POST'])
@cross_origin()
def addSlidePhoto():
    try:
        for f in request.files.getlist('files'):
            filename = secure_filename(f.filename)
            f.save(os.path.join(app.config['UPLOAD_FOLDER_SLIDER'], filename))
        return jsonify({"info": "success"})
    except:
        return jsonify({"info" : 'fail'})


@app.route('/addSlide' , methods=['POST'])
@cross_origin()
def addSlide():
   content = request.json
   myConnection = sqlite3.connect('./modules/db.sqlite')
   myCursor = myConnection.cursor()
   myCursor.execute("INSERT INTO Slider VALUES(:photoName , :mainHeder, :content)", {
       'photoName': content['photoName'],
       'mainHeder': content['mainHeader'],
       'content': content['content'],

   })
   myConnection.commit()
   myCursor.execute("SELECT * FROM Slider")
   print(myCursor.fetchall())
   myConnection.close()



   return jsonify(request.json)

@app.route('/getSlider' , methods=['GET'])
@cross_origin()
def getSlider():
    myConnection = sqlite3.connect('./modules/db.sqlite')
    myCursor = myConnection.cursor()
    myCursor.execute("SELECT * FROM config WHERE configName='SliderDuration'")
    duration = myCursor.fetchone()
    myCursor.execute('SELECT *,oid FROM Slider')
    records = {'records': myCursor.fetchall(), 'duration' : duration}
    return jsonify(records)


@app.route('/getNews' , methods=['POST'])
@cross_origin()
def getNews():
    content = request.json
    size = int(content['number'])
    myConnection = sqlite3.connect('./modules/db.sqlite')
    myCursor = myConnection.cursor()
    myCursor.execute('SELECT * FROM Articles ORDER BY oid DESC LIMIT ' + str(size))

    records = myCursor.fetchall()
    myConnection.close()

    return jsonify({'records' :records})



if __name__ == '__main__':
    app.run(debug=True, port=3421)