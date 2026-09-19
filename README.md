# E-Commerce Revenue & Customer Analytics

An end-to-end **Data Analyst portfolio project** analyzing e-commerce sales, profitability, customers, products, regions, and business performance using Python, SQL, and an interactive Next.js dashboard.

## Project Overview

This project transforms raw e-commerce transaction data into actionable business insights through:

* Data cleaning and preprocessing
* Exploratory Data Analysis (EDA)
* SQL-based business analysis
* Customer analytics
* Product performance analysis
* Regional and segment analysis
* Profitability analysis
* Business KPI analysis
* Interactive dashboard with dynamic filters

## Key Business KPIs

| KPI                 |         Value |
| ------------------- | ------------: |
| Total Sales         | $2,326,534.35 |
| Total Profit        |   $292,296.81 |
| Total Quantity Sold |        38,654 |
| Total Orders        |         5,111 |
| Total Customers     |           804 |
| Profit Margin       |        12.56% |

## Technologies Used

### Data Analysis

* Python
* Pandas
* NumPy
* Matplotlib

### Database & SQL

* MySQL
* MySQL Workbench
* SQL

### Dashboard

* Next.js
* React
* TypeScript
* Recharts
* Tailwind CSS

### Tools

* Git
* GitHub
* VS Code
* Jupyter Notebook

## Analysis Performed

### Sales Analysis

* Monthly sales trends
* Yearly sales performance
* Sales by category
* Sales by sub-category
* Sales by region
* Sales by segment
* Top-selling products

### Customer Analytics

* Customer revenue
* Customer profit
* Customer order frequency
* Repeat customer analysis
* Average customer value
* Top customers by sales

### Product Analytics

* Top products by sales
* Top products by profit
* Top products by quantity
* Loss-making products
* Product-level performance analysis

### Regional Analytics

* Regional sales
* Regional profit
* State-level sales
* Regional performance comparison

### Profitability Analytics

* Profit by sub-category
* Discount vs. profit analysis
* Profitable vs. loss-making transactions
* Overall profit margin

### Business KPIs

* Sales per order
* Profit per order
* Units per order
* Average selling price
* Positive profit rate
* Average orders per customer

## Dashboard Features

The interactive dashboard provides:

* Year filter
* Category filter
* Region filter
* Segment filter
* Dynamic KPI cards
* Monthly sales trend
* Category performance
* Customer analytics
* Product analytics
* Regional analytics
* Business KPI analysis
* Profitability insights
* Interactive charts and tables

## Project Structure

```text
ecommerce-sales-customer-analytics/
│
├── data/
│   ├── raw/
│   │   └── ecommerce_sales.csv
│   │
│   └── processed/
│       ├── sales_cleaned.csv
│       ├── monthly_sales.json
│       ├── category_sales.json
│       ├── customer_summary.json
│       ├── regional_sales.json
│       ├── subcategory_sales.json
│       ├── segment_sales.json
│       ├── top_products.json
│       ├── state_sales.json
│       ├── kpis.json
│       ├── filter_data.json
│       ├── profit_by_subcategory.json
│       ├── discount_profit.json
│       └── profit_summary.json
│
├── python/
│   ├── data_cleaning.py
│   ├── eda.py
│   ├── generate_dashboard_data.py
│   └── import_to_mysql.py
│
├── sql/
│   ├── 01_basic_analysis.sql
│   ├── 02_sales_analysis.sql
│   ├── 03_customer_analysis.sql
│   ├── 04_product_analysis.sql
│   └── 05_business_kpis.sql
│
├── notebooks/
│   └── ecommerce_analysis.ipynb
│
├── dashboard/
│   ├── app/
│   ├── public/
│   ├── package.json
│   └── ...
│
└── README.md
```

## How to Run the Python Analysis

Create and activate a Python virtual environment, then install the required packages.

Run the data cleaning script:

```bash
python python/data_cleaning.py
```

Run exploratory data analysis:

```bash
python python/eda.py
```

Generate dashboard data:

```bash
python python/generate_dashboard_data.py
```

## How to Run the Dashboard

Navigate to the dashboard:

```bash
cd dashboard
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

For a production build:

```bash
npm run build
```

## SQL Analysis

The SQL folder contains separate analysis scripts covering:

1. Basic dataset analysis
2. Sales analysis
3. Customer analysis
4. Product analysis
5. Business KPIs

The project uses MySQL for structured business analysis and KPI validation.

## Dataset

The project uses an e-commerce transaction dataset containing order, customer, product, sales, discount, and profit information.

The dataset contains **10,194 transaction rows** across **21 original columns**.

## Author

**Ravipalli Tirumala Kumar**

Data Analyst Portfolio Project

Email: [ravipalli1973@gmail.com](mailto:ravipalli1973@gmail.com)
