import csv
import mysql.connector
from mysql.connector import errorcode

# --- DATABASE CONNECTION CONFIGURATION ---
# Replace these values with your actual database credentials.
# For your local database, host is usually '127.0.0.1'.
# For GCP, use the Public IP address of your MySQL instance.
DB_CONFIG = {
    'user': 'root',
    'password': '1234', # <-- IMPORTANT: Change this!
    'host': '127.0.0.1',
    'database': 'srsl-fit'
}

# --- CSV TO TABLE MAPPING ---
# This dictionary maps your CSV file paths to the corresponding table names.
# IMPORTANT:
# 1. Replace the file paths with the actual paths to your CSV files.
# 2. The order matters! List tables with no dependencies first.
#    For example, 'Users' and 'Muscles' should come before tables that reference them.
CSV_FILES_TO_TABLES = {
    '/Users/seankraemer/My Drive (seanmk2@illinois.edu)/iCAN/CS 411/data/Users.csv': 'Users',
    '/Users/seankraemer/My Drive (seanmk2@illinois.edu)/iCAN/CS 411/data/Muscles.csv': 'Muscles',
    '/Users/seankraemer/My Drive (seanmk2@illinois.edu)/iCAN/CS 411/data/WorkoutTemplates.csv': 'WorkoutTemplates',
    '/Users/seankraemer/My Drive (seanmk2@illinois.edu)/iCAN/CS 411/data/Exercises.csv': 'Exercises',
    '/Users/seankraemer/My Drive (seanmk2@illinois.edu)/iCAN/CS 411/data/ExercisesMuscles.csv': 'ExercisesMuscles',
    '/Users/seankraemer/My Drive (seanmk2@illinois.edu)/iCAN/CS 411/data/WorkoutContents.csv': 'WorkoutContents',
    '/Users/seankraemer/My Drive (seanmk2@illinois.edu)/iCAN/CS 411/data/ExerciseLog.csv': 'ExerciseLog',
    '/Users/seankraemer/My Drive (seanmk2@illinois.edu)/iCAN/CS 411/data/Sets.csv': 'Sets'
}

def import_csv_to_table(cnx, cursor, filepath, table_name):
    """
    Reads a CSV file and inserts its data into a specified database table.

    Args:
        cnx: The active database connection object.
        cursor: The database cursor for executing queries.
        filepath: The path to the CSV file.
        table_name: The name of the table to insert data into.
    """
    print(f"--- Starting import for table: {table_name} from {filepath} ---")
    
    try:
        with open(filepath, mode='r', encoding='utf-8') as csv_file:
            csv_reader = csv.reader(csv_file)
            
            # The first row of the CSV is assumed to be the header
            headers = next(csv_reader)
            
            # Filter out the auto-incrementing primary key if it's in the CSV
            # This makes the script more robust.
            db_columns = [h for h in headers if 'Id' not in h and 'id' not in h]
            
            query_columns = ', '.join([f"'{col}'" for col in db_columns])
            value_placeholders = ', '.join(['%s'] * len(db_columns))

            insert_query = f"INSERT INTO '{table_name}' ({query_columns}) VALUES ({value_placeholders})"
            
            rows_imported = 0
            for i, row in enumerate(csv_reader):
                try:
                    # Ensure the row has the correct number of columns
                    if len(row) != len(headers):
                        print(f"  [Warning] Skipping row {i+2}: Expected {len(headers)} columns, but found {len(row)}. Data: {row}")
                        continue

                    # Create a dictionary of the row data to easily map to db_columns
                    row_data_dict = {header: value for header, value in zip(headers, row)}
                    
                    # Prepare the data tuple in the correct order for the query
                    data_to_insert = tuple(row_data_dict[col] for col in db_columns)

                    cursor.execute(insert_query, data_to_insert)
                    rows_imported += 1
                except mysql.connector.Error as err:
                    # This will catch errors for individual rows (e.g., wrong data type)
                    print(f"  [Error] Could not import row {i+2}. MySQL Error: {err}")
                    print(f"  Problematic Data: {row}")
                except Exception as e:
                    print(f"  [Error] An unexpected error occurred on row {i+2}: {e}")


            cnx.commit()
            print(f"--- Successfully imported {rows_imported} rows into {table_name}. ---\n")

    except FileNotFoundError:
        print(f"[Critical Error] File not found: {filepath}\n")
    except Exception as e:
        print(f"[Critical Error] An unexpected error occurred while processing {filepath}: {e}\n")


def main():
    """Main function to connect to the DB and orchestrate the imports."""
    try:
        cnx = mysql.connector.connect(**DB_CONFIG)
        cursor = cnx.cursor()
        print("Successfully connected to the database.")

        for file_path, table_name in CSV_FILES_TO_TABLES.items():
            import_csv_to_table(cnx, cursor, file_path, table_name)

    except mysql.connector.Error as err:
        if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            print("Something is wrong with your user name or password")
        elif err.errno == errorcode.ER_BAD_DB_ERROR:
            print("Database does not exist")
        else:
            print(err)
    else:
        cursor.close()
        cnx.close()
        print("All tasks complete. Database connection closed.")


if __name__ == "__main__":
    main()
