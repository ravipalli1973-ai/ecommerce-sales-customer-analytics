-- ============================================================
-- E-COMMERCE SALES & CUSTOMER ANALYTICS
-- SQL SALES ANALYSIS
-- ============================================================

USE ecommerce_analytics;

-- 1. Sales and profit by year
SELECT
    YEAR(`Order Date`) AS order_year,
    ROUND(SUM(Sales), 2) AS total_sales,
    ROUND(SUM(Profit), 2) AS total_profit
FROM sales
GROUP BY YEAR(`Order Date`)
ORDER BY order_year;


-- 2. Sales and profit by month
SELECT
    YEAR(`Order Date`) AS order_year,
    MONTH(`Order Date`) AS order_month,
    ROUND(SUM(Sales), 2) AS total_sales,
    ROUND(SUM(Profit), 2) AS total_profit
FROM sales
GROUP BY YEAR(`Order Date`), MONTH(`Order Date`)
ORDER BY order_year, order_month;


-- 3. Sales and profit by category
SELECT
    Category,
    ROUND(SUM(Sales), 2) AS total_sales,
    ROUND(SUM(Profit), 2) AS total_profit,
    SUM(Quantity) AS total_quantity
FROM sales
GROUP BY Category
ORDER BY total_sales DESC;


-- 4. Sales and profit by sub-category
SELECT
    `Sub-Category`,
    ROUND(SUM(Sales), 2) AS total_sales,
    ROUND(SUM(Profit), 2) AS total_profit,
    SUM(Quantity) AS total_quantity
FROM sales
GROUP BY `Sub-Category`
ORDER BY total_sales DESC;


-- 5. Top 10 products by sales
SELECT
    `Product ID`,
    `Product Name`,
    ROUND(SUM(Sales), 2) AS total_sales,
    ROUND(SUM(Profit), 2) AS total_profit,
    SUM(Quantity) AS total_quantity
FROM sales
GROUP BY `Product ID`, `Product Name`
ORDER BY total_sales DESC
LIMIT 10;


-- 6. Top 10 products by profit
SELECT
    `Product ID`,
    `Product Name`,
    ROUND(SUM(Sales), 2) AS total_sales,
    ROUND(SUM(Profit), 2) AS total_profit,
    SUM(Quantity) AS total_quantity
FROM sales
GROUP BY `Product ID`, `Product Name`
ORDER BY total_profit DESC
LIMIT 10;


-- 7. Top 10 loss-making products
SELECT
    `Product ID`,
    `Product Name`,
    ROUND(SUM(Sales), 2) AS total_sales,
    ROUND(SUM(Profit), 2) AS total_profit,
    SUM(Quantity) AS total_quantity
FROM sales
GROUP BY `Product ID`, `Product Name`
HAVING SUM(Profit) < 0
ORDER BY total_profit ASC
LIMIT 10;


-- 8. Sales and profit by region
SELECT
    Region,
    ROUND(SUM(Sales), 2) AS total_sales,
    ROUND(SUM(Profit), 2) AS total_profit,
    SUM(Quantity) AS total_quantity
FROM sales
GROUP BY Region
ORDER BY total_sales DESC;


-- 9. Sales and profit by state
SELECT
    `State/Province`,
    ROUND(SUM(Sales), 2) AS total_sales,
    ROUND(SUM(Profit), 2) AS total_profit,
    SUM(Quantity) AS total_quantity
FROM sales
GROUP BY `State/Province`
ORDER BY total_sales DESC;


-- 10. Top 10 states by sales
SELECT
    `State/Province`,
    ROUND(SUM(Sales), 2) AS total_sales,
    ROUND(SUM(Profit), 2) AS total_profit
FROM sales
GROUP BY `State/Province`
ORDER BY total_sales DESC
LIMIT 10;


-- 11. Sales and profit by customer segment
SELECT
    Segment,
    ROUND(SUM(Sales), 2) AS total_sales,
    ROUND(SUM(Profit), 2) AS total_profit,
    SUM(Quantity) AS total_quantity
FROM sales
GROUP BY Segment
ORDER BY total_sales DESC;


-- 12. Sales and profit by ship mode
SELECT
    `Ship Mode`,
    ROUND(SUM(Sales), 2) AS total_sales,
    ROUND(SUM(Profit), 2) AS total_profit,
    SUM(Quantity) AS total_quantity
FROM sales
GROUP BY `Ship Mode`
ORDER BY total_sales DESC;


-- 13. Sales and profit by discount level
SELECT
    Discount,
    ROUND(SUM(Sales), 2) AS total_sales,
    ROUND(SUM(Profit), 2) AS total_profit,
    COUNT(*) AS transaction_count
FROM sales
GROUP BY Discount
ORDER BY Discount;


-- 14. Average sales, profit and quantity per order
SELECT
    ROUND(SUM(Sales) / COUNT(DISTINCT `Order ID`), 2) AS average_order_value,
    ROUND(SUM(Profit) / COUNT(DISTINCT `Order ID`), 2) AS average_profit_per_order,
    ROUND(SUM(Quantity) / COUNT(DISTINCT `Order ID`), 2) AS average_quantity_per_order
FROM sales;


-- 15. Monthly sales ranking
SELECT
    YEAR(`Order Date`) AS order_year,
    MONTH(`Order Date`) AS order_month,
    ROUND(SUM(Sales), 2) AS total_sales,
    RANK() OVER (
        PARTITION BY YEAR(`Order Date`)
        ORDER BY SUM(Sales) DESC
    ) AS monthly_sales_rank
FROM sales
GROUP BY YEAR(`Order Date`), MONTH(`Order Date`)
ORDER BY order_year, monthly_sales_rank;