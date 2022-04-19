import sqlite3

# tworzenie połączenia z bazą danych lub tworzenie nowej bazy
myConnection = sqlite3.connect('db.sqlite')

##tworzenie kursora
myCursor = myConnection.cursor()

myCursor.execute("""CREATE TABLE Gallery (
                PhotoID text,
                title text,
                text text,
                photoName text
                )""")
myConnection.commit()

myConnection.close()