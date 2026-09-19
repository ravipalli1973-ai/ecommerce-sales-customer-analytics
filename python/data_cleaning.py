import pandas as pd

# Load raw dataset
file_path = "data/raw/ecommerce_sales.csv"

df = pd.read_csv(file_path, encoding="latin1")

# Convert date columns
df["Order Date"] = pd.to_datetime(df["Order Date"], dayfirst=True)
df["Ship Date"] = pd.to_datetime(df["Ship Date"], dayfirst=True)

# Create processed folder if it does not exist
import os
os.makedirs("data/processed", exist_ok=True)

# Save cleaned dataset
output_path = "data/processed/sales_cleaned.csv"
df.to_csv(output_path, index=False)

print("\n===== CLEANING COMPLETE =====")
print("Rows:", len(df))
print("Columns:", len(df.columns))
print("Saved to:", output_path)

print("\n===== FINAL DATA TYPES =====")
print(df.dtypes)