import pandas as pd

# ============================================================
# LOAD CLEANED DATA
# ============================================================

df = pd.read_csv(
    "data/processed/sales_cleaned.csv",
    parse_dates=["Order Date", "Ship Date"]
)

# Create Year-Month for time analysis
df["Year-Month"] = df["Order Date"].dt.to_period("M").astype(str)


# ============================================================
# 1. BUSINESS KPIs
# ============================================================

print("\n===== E-COMMERCE BUSINESS KPIs =====")

total_sales = df["Sales"].sum()
total_profit = df["Profit"].sum()
total_quantity = df["Quantity"].sum()
total_orders = df["Order ID"].nunique()
total_customers = df["Customer ID"].nunique()

print(f"Total Sales: ${total_sales:,.2f}")
print(f"Total Profit: ${total_profit:,.2f}")
print(f"Total Quantity Sold: {total_quantity:,}")
print(f"Total Orders: {total_orders:,}")
print(f"Total Customers: {total_customers:,}")


# ============================================================
# 2. PROFIT MARGIN
# ============================================================

print("\n===== PROFIT MARGIN =====")

profit_margin = (total_profit / total_sales) * 100

print(f"Profit Margin: {profit_margin:.2f}%")


# ============================================================
# 3. MONTHLY SALES
# ============================================================

print("\n===== MONTHLY SALES =====")

monthly_sales = (
    df.groupby("Year-Month")["Sales"]
    .sum()
    .reset_index()
)

print(monthly_sales.to_string(index=False))


# ============================================================
# 4. MONTHLY SALES AND PROFIT
# ============================================================

print("\n===== MONTHLY SALES AND PROFIT =====")

monthly_performance = (
    df.groupby("Year-Month")[["Sales", "Profit"]]
    .sum()
    .reset_index()
)

print(monthly_performance.to_string(index=False))


# ============================================================
# 5. CATEGORY PERFORMANCE
# ============================================================

print("\n===== CATEGORY PERFORMANCE =====")

category_performance = (
    df.groupby("Category")[["Sales", "Profit", "Quantity"]]
    .sum()
    .sort_values("Sales", ascending=False)
    .reset_index()
)

print(category_performance.to_string(index=False))


# ============================================================
# 6. SUB-CATEGORY PERFORMANCE
# ============================================================

print("\n===== TOP SUB-CATEGORIES BY SALES =====")

subcategory_performance = (
    df.groupby("Sub-Category")[["Sales", "Profit", "Quantity"]]
    .sum()
    .sort_values("Sales", ascending=False)
    .reset_index()
)

print(subcategory_performance.to_string(index=False))


# ============================================================
# 7. REGIONAL PERFORMANCE
# ============================================================

print("\n===== REGIONAL PERFORMANCE =====")

regional_performance = (
    df.groupby("Region")[["Sales", "Profit", "Quantity"]]
    .sum()
    .sort_values("Sales", ascending=False)
    .reset_index()
)

print(regional_performance.to_string(index=False))


# ============================================================
# 8. SEGMENT PERFORMANCE
# ============================================================

print("\n===== CUSTOMER SEGMENT PERFORMANCE =====")

segment_performance = (
    df.groupby("Segment")[["Sales", "Profit", "Quantity"]]
    .sum()
    .sort_values("Sales", ascending=False)
    .reset_index()
)

print(segment_performance.to_string(index=False))


# ============================================================
# 9. SHIP MODE ANALYSIS
# ============================================================

print("\n===== SHIP MODE ANALYSIS =====")

ship_mode_performance = (
    df.groupby("Ship Mode")[["Sales", "Profit", "Quantity"]]
    .sum()
    .sort_values("Sales", ascending=False)
    .reset_index()
)

print(ship_mode_performance.to_string(index=False))


# ============================================================
# 10. TOP 10 PRODUCTS BY SALES
# ============================================================

print("\n===== TOP 10 PRODUCTS BY SALES =====")

top_products = (
    df.groupby(["Product ID", "Product Name"])[["Sales", "Profit", "Quantity"]]
    .sum()
    .sort_values("Sales", ascending=False)
    .head(10)
    .reset_index()
)

print(top_products.to_string(index=False))


# ============================================================
# 11. TOP 10 PRODUCTS BY PROFIT
# ============================================================

print("\n===== TOP 10 PRODUCTS BY PROFIT =====")

top_profit_products = (
    df.groupby(["Product ID", "Product Name"])[["Sales", "Profit", "Quantity"]]
    .sum()
    .sort_values("Profit", ascending=False)
    .head(10)
    .reset_index()
)

print(top_profit_products.to_string(index=False))


# ============================================================
# 12. LOSS-MAKING PRODUCTS
# ============================================================

print("\n===== TOP 10 LOSS-MAKING PRODUCTS =====")

loss_products = (
    df.groupby(["Product ID", "Product Name"])[["Sales", "Profit", "Quantity"]]
    .sum()
    .sort_values("Profit", ascending=True)
    .head(10)
    .reset_index()
)

print(loss_products.to_string(index=False))


# ============================================================
# 13. CUSTOMER ANALYSIS
# ============================================================

print("\n===== TOP 10 CUSTOMERS BY SALES =====")

customer_performance = (
    df.groupby(["Customer ID", "Customer Name"])[["Sales", "Profit", "Quantity"]]
    .sum()
    .sort_values("Sales", ascending=False)
    .head(10)
    .reset_index()
)

print(customer_performance.to_string(index=False))


# ============================================================
# 14. CUSTOMER ORDER FREQUENCY
# ============================================================

print("\n===== CUSTOMER ORDER FREQUENCY =====")

customer_orders = (
    df.groupby(["Customer ID", "Customer Name"])["Order ID"]
    .nunique()
    .sort_values(ascending=False)
    .head(10)
    .reset_index(name="Orders")
)

print(customer_orders.to_string(index=False))


# ============================================================
# 15. DISCOUNT VS PROFIT
# ============================================================

print("\n===== DISCOUNT VS PROFIT =====")

discount_profit = (
    df.groupby("Discount")["Profit"]
    .agg(["sum", "mean", "count"])
    .reset_index()
)

discount_profit.columns = [
    "Discount",
    "Total Profit",
    "Average Profit",
    "Transactions"
]

print(discount_profit.to_string(index=False))


# ============================================================
# 16. STATE PERFORMANCE
# ============================================================

print("\n===== TOP 10 STATES BY SALES =====")

state_performance = (
    df.groupby("State/Province")[["Sales", "Profit"]]
    .sum()
    .sort_values("Sales", ascending=False)
    .head(10)
    .reset_index()
)

print(state_performance.to_string(index=False))


# ============================================================
# 17. FINAL DATASET INFORMATION
# ============================================================

print("\n===== FINAL DATASET INFORMATION =====")

print(f"Rows: {len(df):,}")
print(f"Columns: {len(df.columns):,}")
print(f"Unique Orders: {df['Order ID'].nunique():,}")
print(f"Unique Customers: {df['Customer ID'].nunique():,}")
print(f"Unique Products: {df['Product ID'].nunique():,}")
print(f"Categories: {df['Category'].nunique():,}")
print(f"Regions: {df['Region'].nunique():,}")

print("\n===== EDA COMPLETE =====")