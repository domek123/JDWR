import sqlite3

# tworzenie połączenia z bazą danych lub tworzenie nowej bazy
myConnection = sqlite3.connect('db.sqlite')

##tworzenie kursora
myCursor = myConnection.cursor()

myCursor.execute("""INSERT INTO config  VALUES(
                'navFooterColor',
                '#111827'
                )""")

myConnection.commit()

myConnection.close()