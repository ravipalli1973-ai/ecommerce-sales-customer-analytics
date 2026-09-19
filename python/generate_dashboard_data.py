import pandas as pd
import json
import os


# ============================================================
# LOAD CLEANED DATA
# ============================================================

df = pd.read_csv(
    "data/processed/sales_cleaned.csv",
    parse_dates=["Order Date", "Ship Date"]
)

# Create Year-Month
df["Year-Month"] = df["Order Date"].dt.to_period("M").astype(str)

# Make sure processed folder exists
os.makedirs("data/processed", exist_ok=True)


# ============================================================
# 1. CLEANED SALES DATA
# ============================================================

sales_columns = [
    "Row ID",
    "Order ID",
    "Order Date",
    "Ship Date",
    "Ship Mode",
    "Customer ID",
    "Customer Name",
    "Segment",
    "Country/Region",
    "City",
    "State/Province",
    "Postal Code",
    "Region",
    "Product ID",
    "Category",
    "Sub-Category",
    "Product Name",
    "Sales",
    "Quantity",
    "Discount",
    "Profit"
]

sales_cleaned = df[sales_columns].copy()

sales_cleaned.to_csv(
    "data/processed/sales_cleaned.csv",
    index=False
)


# ============================================================
# 2. MONTHLY SALES
# ============================================================

monthly_sales = (
    df.groupby("Year-Month")["Sales"]
    .sum()
    .reset_index()
)

monthly_sales.columns = ["month", "sales"]

monthly_sales.to_json(
    "data/processed/monthly_sales.json",
    orient="records",
    indent=2
)


# ============================================================
# 3. CATEGORY SALES
# ============================================================

category_sales = (
    df.groupby("Category")[["Sales", "Profit", "Quantity"]]
    .sum()
    .reset_index()
)

category_sales.columns = [
    "category",
    "sales",
    "profit",
    "quantity"
]

category_sales.to_json(
    "data/processed/category_sales.json",
    orient="records",
    indent=2
)


# ============================================================
# 4. CUSTOMER SUMMARY
# ============================================================

customer_summary = (
    df.groupby(["Customer ID", "Customer Name"])
    .agg(
        Sales=("Sales", "sum"),
        Profit=("Profit", "sum"),
        Quantity=("Quantity", "sum"),
        Orders=("Order ID", "nunique")
    )
    .reset_index()
    .sort_values("Sales", ascending=False)
)

customer_summary.columns = [
    "customer_id",
    "customer_name",
    "sales",
    "profit",
    "quantity",
    "orders"
]

customer_summary.to_json(
    "data/processed/customer_summary.json",
    orient="records",
    indent=2
)


# ============================================================
# 5. REGIONAL SALES
# ============================================================

regional_sales = (
    df.groupby("Region")[["Sales", "Profit", "Quantity"]]
    .sum()
    .reset_index()
)

regional_sales.columns = [
    "region",
    "sales",
    "profit",
    "quantity"
]

regional_sales.to_json(
    "data/processed/regional_sales.json",
    orient="records",
    indent=2
)


# ============================================================
# 6. SUB-CATEGORY SALES
# ============================================================

subcategory_sales = (
    df.groupby("Sub-Category")[["Sales", "Profit", "Quantity"]]
    .sum()
    .sort_values("Sales", ascending=False)
    .reset_index()
)

subcategory_sales.columns = [
    "subcategory",
    "sales",
    "profit",
    "quantity"
]

subcategory_sales.to_json(
    "data/processed/subcategory_sales.json",
    orient="records",
    indent=2
)


# ============================================================
# 7. SEGMENT SALES
# ============================================================

segment_sales = (
    df.groupby("Segment")[["Sales", "Profit", "Quantity"]]
    .sum()
    .reset_index()
)

segment_sales.columns = [
    "segment",
    "sales",
    "profit",
    "quantity"
]

segment_sales.to_json(
    "data/processed/segment_sales.json",
    orient="records",
    indent=2
)


# ============================================================
# 8. TOP PRODUCTS
# ============================================================

top_products = (
    df.groupby(["Product ID", "Product Name"])
    .agg(
        Sales=("Sales", "sum"),
        Profit=("Profit", "sum"),
        Quantity=("Quantity", "sum")
    )
    .reset_index()
    .sort_values("Sales", ascending=False)
    .head(20)
)

top_products.columns = [
    "product_id",
    "product_name",
    "sales",
    "profit",
    "quantity"
]

top_products.to_json(
    "data/processed/top_products.json",
    orient="records",
    indent=2
)


# ============================================================
# 9. STATE SALES
# ============================================================

state_sales = (
    df.groupby("State/Province")[["Sales", "Profit"]]
    .sum()
    .sort_values("Sales", ascending=False)
    .reset_index()
)

state_sales.columns = [
    "state",
    "sales",
    "profit"
]

state_sales.to_json(
    "data/processed/state_sales.json",
    orient="records",
    indent=2
)


# ============================================================
# 10. KPI SUMMARY
# ============================================================

total_sales = df["Sales"].sum()
total_profit = df["Profit"].sum()
total_quantity = df["Quantity"].sum()
total_orders = df["Order ID"].nunique()
total_customers = df["Customer ID"].nunique()

profit_margin = (total_profit / total_sales) * 100

kpis = {
    "total_sales": round(float(total_sales), 2),
    "total_profit": round(float(total_profit), 2),
    "total_quantity": int(total_quantity),
    "total_orders": int(total_orders),
    "total_customers": int(total_customers),
    "profit_margin": round(float(profit_margin), 2)
}

with open(
    "data/processed/kpis.json",
    "w",
    encoding="utf-8"
) as file:
    json.dump(kpis, file, indent=2)


# ============================================================
# COMPLETE
# ============================================================

print("\n===== DASHBOARD DATA GENERATION COMPLETE =====")

print("\nGenerated files:")

files = [
    "sales_cleaned.csv",
    "monthly_sales.json",
    "category_sales.json",
    "customer_summary.json",
    "regional_sales.json",
    "subcategory_sales.json",
    "segment_sales.json",
    "top_products.json",
    "state_sales.json",
    "kpis.json"
]

for file in files:
    print(f"✓ data/processed/{file}")

print("\nTotal files generated:", len(files))

# ============================================================
# FILTER DATA FOR INTERACTIVE DASHBOARD
# ============================================================

filter_columns = [
    "Order Date",
    "Category",
    "Region",
    "Segment",
    "Sales",
    "Profit",
    "Quantity",
    "Order ID",
    "Customer ID",
    "Customer Name",
    "Product ID",
    "Product Name",
]

filter_data = df[filter_columns].copy()

filter_data["Order Date"] = filter_data["Order Date"].dt.strftime("%Y-%m-%d")

filter_data.to_json(
    "data/processed/filter_data.json",
    orient="records",
    indent=2
)

print("filter_data.json generated successfully")
print("Rows:", len(filter_data))

# ============================================================
# PROFITABILITY ANALYTICS DATA
# ============================================================

# Profit and sales by sub-category
profit_by_subcategory = (
    df.groupby("Sub-Category")[["Sales", "Profit"]]
    .sum()
    .reset_index()
    .sort_values("Profit", ascending=False)
)

profit_by_subcategory.columns = [
    "subcategory",
    "sales",
    "profit",
]

profit_by_subcategory.to_json(
    "data/processed/profit_by_subcategory.json",
    orient="records",
    indent=2
)


# Profit by discount level
discount_profit = (
    df.groupby("Discount")
    .agg(
        Sales=("Sales", "sum"),
        Profit=("Profit", "sum"),
        Transactions=("Order ID", "count"),
    )
    .reset_index()
    .sort_values("Discount")
)

discount_profit.columns = [
    "discount",
    "sales",
    "profit",
    "transactions",
]

discount_profit.to_json(
    "data/processed/discount_profit.json",
    orient="records",
    indent=2
)


# Overall profitability summary
total_sales = df["Sales"].sum()
total_profit = df["Profit"].sum()

profit_summary = {
    "total_sales": round(float(total_sales), 2),
    "total_profit": round(float(total_profit), 2),
    "profit_margin": round(
        float((total_profit / total_sales) * 100),
        2
    ),
    "profitable_transactions": int(
        (df["Profit"] > 0).sum()
    ),
    "loss_transactions": int(
        (df["Profit"] < 0).sum()
    ),
    "zero_profit_transactions": int(
        (df["Profit"] == 0).sum()
    ),
}

with open(
    "data/processed/profit_summary.json",
    "w",
    encoding="utf-8"
) as file:
    json.dump(profit_summary, file, indent=2)

print("Profitability analytics data generated successfully")