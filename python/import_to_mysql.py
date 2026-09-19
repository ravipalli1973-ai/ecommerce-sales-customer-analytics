import pandas as pd
import mysql.connector

# ============================================================
# IMPORT CLEANED CSV INTO MYSQL
# ============================================================

# Load cleaned CSV
csv_path = "data/processed/sales_cleaned.csv"

df = pd.read_csv(csv_path)

print(f"Loaded {len(df)} rows from CSV.")

# Connect to MySQL
connection = mysql.connector.connect(
    host="127.0.0.1",
    port=3306,
    user="root",
    password=input("Enter your MySQL root password: "),
    database="ecommerce_analytics"
)

cursor = connection.cursor()

print("Connected to MySQL successfully.")

# Clear existing data
cursor.execute("TRUNCATE TABLE sales")

# Prepare INSERT query
insert_query = """
INSERT INTO sales (
    `Row ID`,
    `Order ID`,
    `Order Date`,
    `Ship Date`,
    `Ship Mode`,
    `Customer ID`,
    `Customer Name`,
    `Segment`,
    `Country/Region`,
    `City`,
    `State/Province`,
    `Postal Code`,
    `Region`,
    `Product ID`,
    `Category`,
    `Sub-Category`,
    `Product Name`,
    `Sales`,
    `Quantity`,
    `Discount`,
    `Profit`
)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
"""

# Convert DataFrame rows to tuples
data = []

for _, row in df.iterrows():
    data.append((
        int(row["Row ID"]),
        row["Order ID"],
        row["Order Date"],
        row["Ship Date"],
        row["Ship Mode"],
        row["Customer ID"],
        row["Customer Name"],
        row["Segment"],
        row["Country/Region"],
        row["City"],
        row["State/Province"],
        str(row["Postal Code"]),
        row["Region"],
        row["Product ID"],
        row["Category"],
        row["Sub-Category"],
        row["Product Name"],
        float(row["Sales"]),
        int(row["Quantity"]),
        float(row["Discount"]),
        float(row["Profit"])
    ))

# Insert rows in batches
batch_size = 500

for start in range(0, len(data), batch_size):
    batch = data[start:start + batch_size]
    cursor.executemany(insert_query, batch)
    connection.commit()
    print(f"Imported {min(start + batch_size, len(data))}/{len(data)} rows")

cursor.execute("SELECT COUNT(*) FROM sales")
row_count = cursor.fetchone()[0]

print("\n===== IMPORT COMPLETE =====")
print(f"Rows in MySQL sales table: {row_count}")

cursor.close()
connection.close()

print("MySQL connection closed.")