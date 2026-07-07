import os
import sqlite3
import mysql.connector
from mysql.connector import errorcode
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "bharat_saarthi")
DB_PORT = int(os.getenv("DB_PORT", 3306))

use_sqlite = True
sqlite_path = os.path.join(os.path.dirname(__file__), "bharat_saarthi.db")

# Try to connect to TiDB / MySQL if credentials are provided
if DB_USER:
    try:
        connection = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT
        )
        cursor = connection.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")
        connection.commit()
        cursor.close()
        connection.close()
        
        # Test connection to the actual database
        conn = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            port=DB_PORT
        )
        conn.close()
        use_sqlite = False
        print(f"Connected to TiDB/MySQL database '{DB_NAME}' successfully.")
    except Exception as e:
        print(f"Failed to connect to TiDB/MySQL: {e}. Falling back to local SQLite database.")
else:
    print("No DB_USER provided in environment. Falling back to local SQLite database.")

def get_db_connection():
    if use_sqlite:
        conn = sqlite3.connect(sqlite_path)
        conn.row_factory = sqlite3.Row
        # Enable foreign keys for SQLite
        conn.execute("PRAGMA foreign_keys = ON")
        return conn
    else:
        conn = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            port=DB_PORT
        )
        return conn

def execute_query(query, params=(), fetch=False, fetch_one=False, commit=True):
    if use_sqlite:
        query = query.replace("%s", "?")
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True) if not use_sqlite else conn.cursor()
    
    try:
        cursor.execute(query, params)
        if fetch:
            if fetch_one:
                row = cursor.fetchone()
                if row and use_sqlite:
                    # convert sqlite row to dict
                    return dict(row)
                return row
            else:
                rows = cursor.fetchall()
                if use_sqlite:
                    return [dict(r) for r in rows]
                return rows
        if commit:
            conn.commit()
            if not fetch:
                return cursor.lastrowid
    except Exception as e:
        if commit:
            conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()

def init_db():
    sql_file_path = os.path.join(os.path.dirname(__file__), "sqlscript.sql")
    if not os.path.exists(sql_file_path):
        print(f"SQL script not found at {sql_file_path}")
        return

    with open(sql_file_path, "r", encoding="utf-8") as f:
        sql_content = f.read()

    # Split statements by semicolon
    statements = sql_content.split(";")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        for statement in statements:
            statement = statement.strip()
            if not statement:
                continue
            
            # Adapt statements for SQLite if we are running in SQLite mode
            if use_sqlite:
                statement = statement.replace("INT AUTO_INCREMENT PRIMARY KEY", "INTEGER PRIMARY KEY AUTOINCREMENT")
                statement = statement.replace("AUTO_INCREMENT", "")
                statement = statement.replace("DECIMAL(12, 2)", "REAL")
                statement = statement.replace("DECIMAL(12,2)", "REAL")
                statement = statement.replace("TIMESTAMP DEFAULT CURRENT_TIMESTAMP", "DATETIME DEFAULT CURRENT_TIMESTAMP")
                # Handle INSERT OR IGNORE / INSERT seeds
                if "INSERT INTO government_schemes" in statement:
                    # To prevent seeding multiple times in SQLite
                    cursor.execute("SELECT COUNT(*) FROM government_schemes")
                    if cursor.fetchone()[0] > 0:
                        continue
            else:
                # To prevent seeding multiple times in MySQL
                if "INSERT INTO government_schemes" in statement:
                    cursor.execute("SELECT COUNT(*) FROM government_schemes")
                    if cursor.fetchone()[0] > 0:
                        continue
            
            try:
                cursor.execute(statement)
            except Exception as inner_e:
                # If seed already exists, we can ignore errors
                if "duplicate" in str(inner_e).lower() or "unique" in str(inner_e).lower():
                    continue
                raise inner_e
                
        conn.commit()
        
        # Run schema migrations to add new OAuth columns if they don't exist
        migration_cursor = conn.cursor()
        try:
            if not use_sqlite:
                # 1. users table migrations
                migration_cursor.execute("SHOW COLUMNS FROM users LIKE 'google_id'")
                if not migration_cursor.fetchone():
                    print("Running migration: adding google_id, email, name, picture to users table...")
                    migration_cursor.execute("ALTER TABLE users ADD COLUMN google_id VARCHAR(255) AFTER id")
                    migration_cursor.execute("ALTER TABLE users ADD COLUMN email VARCHAR(255) AFTER google_id")
                    migration_cursor.execute("ALTER TABLE users ADD COLUMN name VARCHAR(255) AFTER email")
                    migration_cursor.execute("ALTER TABLE users ADD COLUMN picture VARCHAR(500) AFTER name")
                    # Apply indexes separately (TiDB compatible)
                    migration_cursor.execute("CREATE UNIQUE INDEX idx_users_google_id ON users(google_id)")
                    migration_cursor.execute("CREATE UNIQUE INDEX idx_users_email ON users(email)")
                    # Modify existing demographics to be nullable
                    migration_cursor.execute("ALTER TABLE users MODIFY COLUMN age INT NULL")
                    migration_cursor.execute("ALTER TABLE users MODIFY COLUMN occupation VARCHAR(255) NULL")
                    migration_cursor.execute("ALTER TABLE users MODIFY COLUMN income DECIMAL(12, 2) NULL")
                    migration_cursor.execute("ALTER TABLE users MODIFY COLUMN gender VARCHAR(50) NULL")
                    migration_cursor.execute("ALTER TABLE users MODIFY COLUMN education VARCHAR(255) NULL")
                
                # 2. complaints table migrations
                migration_cursor.execute("SHOW COLUMNS FROM complaints LIKE 'user_id'")
                if not migration_cursor.fetchone():
                    print("Running migration: adding user_id to complaints table...")
                    migration_cursor.execute("ALTER TABLE complaints ADD COLUMN user_id INT NULL AFTER id")
                    migration_cursor.execute("ALTER TABLE complaints ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL")
                
                # 3. chat_history table migrations
                migration_cursor.execute("SHOW COLUMNS FROM chat_history LIKE 'user_id'")
                if not migration_cursor.fetchone():
                    print("Running migration: adding user_id to chat_history table...")
                    migration_cursor.execute("ALTER TABLE chat_history ADD COLUMN user_id INT NULL AFTER id")
                    migration_cursor.execute("ALTER TABLE chat_history ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL")
            else:
                # SQLite - check if columns exist by attempting to inspect or alter
                # SQLite alter statements are simple
                try:
                    migration_cursor.execute("ALTER TABLE users ADD COLUMN google_id VARCHAR(255)")
                    migration_cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)")
                    migration_cursor.execute("ALTER TABLE users ADD COLUMN email VARCHAR(255)")
                    migration_cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email)")
                    migration_cursor.execute("ALTER TABLE users ADD COLUMN name VARCHAR(255)")
                    migration_cursor.execute("ALTER TABLE users ADD COLUMN picture VARCHAR(500)")
                except Exception:
                    pass # Columns already exist

                try:
                    migration_cursor.execute("ALTER TABLE complaints ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE SET NULL")
                except Exception:
                    pass

                try:
                    migration_cursor.execute("ALTER TABLE chat_history ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE SET NULL")
                except Exception:
                    pass
            conn.commit()
            print("Database migrations applied successfully.")
        except Exception as migrate_e:
            print(f"Migration error: {migrate_e}")
            conn.rollback()
        finally:
            migration_cursor.close()

        print("Database schema and seed data initialized successfully.")
    except Exception as e:
        conn.rollback()
        print(f"Error initializing database: {e}")
    finally:
        cursor.close()
        conn.close()
