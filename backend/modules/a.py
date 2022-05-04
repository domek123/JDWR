import sqlite3

# tworzenie połączenia z bazą danych lub tworzenie nowej bazy
myConnection = sqlite3.connect('db.sqlite')

##tworzenie kursora
myCursor = myConnection.cursor()

myCursor.execute("""CREATE TABLE con (
                content json
                )""")
myConnection.commit()

myConnection.close()