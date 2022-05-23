import sqlite3

# tworzenie połączenia z bazą danych lub tworzenie nowej bazy
myConnection = sqlite3.connect('db.sqlite')

##tworzenie kursora
myCursor = myConnection.cursor()

#myCursor.execute("""INSERT INTO config  VALUES(
#                'sectionName',
#               'Section'
#                )""")


myCursor.execute("DELETE FROM Nav WHERE FullName='k'")

myConnection.commit()

myConnection.close()