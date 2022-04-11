import sqlite3

# tworzenie połączenia z bazą danych lub tworzenie nowej bazy
myConnection = sqlite3.connect('db.sqlite')

##tworzenie kursora
myCursor = myConnection.cursor()


#tworzenie tabeli
myCursor.execute("""CREATE TABLE UsersData (
                FullName text,
                login text,
                password text,
                isAdmin boolean
                )""")

#zapisywanie zmian
myConnection.commit()

myCursor.execute("INSERT INTO UsersData VALUES(:FullName, :login, :password, :isAdmin )",{
    "FullName": "admin",
    "login": "admin",
    "password": "admin",
    "isAdmin" : True
})
myConnection.commit()

#konczenie połączenia
myConnection.close()