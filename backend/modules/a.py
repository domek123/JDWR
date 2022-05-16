import sqlite3

# tworzenie połączenia z bazą danych lub tworzenie nowej bazy
myConnection = sqlite3.connect('db.sqlite')

##tworzenie kursora
myCursor = myConnection.cursor()

#myCursor.execute("""INSERT INTO config  VALUES(
#                'sectionName',
#               'Section'
#                )""")

myCursor.execute("""INSERT INTO CategoryArt  VALUES(
                    '165173912264979892',
                    'kosmos'
                    )""")



myConnection.commit()

myConnection.close()