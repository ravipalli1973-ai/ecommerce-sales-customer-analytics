-- ============================================================
-- E-COMMERCE SALES & CUSTOMER ANALYTICS
-- SQL CUSTOMER ANALYSIS
-- ============================================================

USE ecommerce_analytics;


-- 1. Total customers
SELECT
    COUNT(DISTINCT `Customer ID`) AS total_customers
FROM sales;


-- 2. Sales, profit and orders by customer
SELECT
    `Customer ID`,
    `Customer Name`,
    ROUND(SUM(Sales), 2) AS total_sales,
    ROUND(SUM(Profit), 2) AS total_profit,
    SUM(Quantity) AS total_quantity,
    COUNT(DISTINCT `Order ID`) AS total_orders
FROM sales
GROUP BY `Customer ID`, `Customer Name`
ORDER BY total_sales DESC;


-- 3. Top 10 customers by sales
SELECT
    `Customer ID`,
    `Customer Name`,
    ROUND(SUM(Sales), 2) AS total_sales,
    ROUND(SUM(Profit), 2) AS total_profit,
    COUNT(DISTINCT `Order ID`) AS total_orders
FROM sales
GROUP BY `Customer ID`, `Customer Name`
ORDER BY total_sales DESC
LIMIT 10;


-- 4. Top 10 customers by profit
SELECT
    `Customer ID`,
    `Customer Name`,
    ROUND(SUM(Sales), 2) AS total_sales,
    ROUND(SUM(Profit), 2) AS total_profit,
    COUNT(DISTINCT `Order ID`) AS total_orders
FROM sales
GROUP BY `Customer ID`, `Customer Name`
ORDER BY total_profit DESC
LIMIT 10;


-- 5. Top 10 loss-making customers
SELECT
    `Customer ID`,
    `Customer Name`,
    ROUND(SUM(Sales), 2) AS total_sales,
    ROUND(SUM(Profit), 2) AS total_profit,
    COUNT(DISTINCT `Order ID`) AS total_orders
FROM sales
GROUP BY `Customer ID`, `Customer Name`
HAVING SUM(Profit) < 0
ORDER BY total_profit ASC
LIMIT 10;


-- 6. Customers with the highest number of orders
SELECT
    `Customer ID`,
    `Customer Name`,
    COUNT(DISTINCT `Order ID`) AS total_orders,
    ROUND(SUM(Sales), 2) AS total_sales,
    ROUND(SUM(Profit), 2) AS total_profit
FROM sales
GROUP BY `Customer ID`, `Customer Name`
ORDER BY total_orders DESC, total_sales DESC
LIMIT 10;


-- 7. Average sales per customer
SELECT
    ROUND(SUM(Sales) / COUNT(DISTINCT `Customer ID`), 2)
        AS average_sales_per_customer
FROM sales;


-- 8. Average profit per customer
SELECT
    ROUND(SUM(Profit) / COUNT(DISTINCT `Customer ID`), 2)
        AS average_profit_per_customer
FROM sales;


-- 9. Average orders per customer
SELECT
    ROUND(
        COUNT(DISTINCT `Order ID`) /
        COUNT(DISTINCT `Customer ID`),
        2
    ) AS average_orders_per_customer
FROM sales;


-- 10. Customer segmentation based on total sales
SELECT
    customer_segment,
    COUNT(*) AS customer_count
FROM (
    SELECT
        `Customer ID`,
        CASE
            WHEN SUM(Sales) >= 10000 THEN 'High Value'
            WHEN SUM(Sales) >= 5000 THEN 'Medium Value'
            ELSE 'Low Value'
        END AS customer_segment
    FROM sales
    GROUP BY `Customer ID`
) AS customer_segments
GROUP BY customer_segment
ORDER BY customer_count DESC;


-- 11. Customer sales ranking
SELECT
    `Customer ID`,
    `Customer Name`,
    ROUND(SUM(Sales), 2) AS total_sales,
    RANK() OVER (
        ORDER BY SUM(Sales) DESC
    ) AS sales_rank
FROM sales
GROUP BY `Customer ID`, `Customer Name`
ORDER BY sales_rank;


-- 12. Customer profit ranking
SELECT
    `Customer ID`,
    `Customer Name`,
    ROUND(SUM(Profit), 2) AS total_profit,
    RANK() OVER (
        ORDER BY SUM(Profit) DESC
    ) AS profit_rank
FROM sales
GROUP BY `Customer ID`, `Customer Name`
ORDER BY profit_rank;


-- 13. Customers by region
SELECT
    Region,
    COUNT(DISTINCT `Customer ID`) AS unique_customers,
    ROUND(SUM(Sales), 2) AS total_sales,
    ROUND(SUM(Profit), 2) AS total_profit
FROM sales
GROUP BY Region
ORDER BY unique_customers DESC;


-- 14. Customers by segment
SELECT
    Segment,
    COUNT(DISTINCT `Customer ID`) AS unique_customers,
    ROUND(SUM(Sales), 2) AS total_sales,
    ROUND(SUM(Profit), 2) AS total_profit
FROM sales
GROUP BY Segment
ORDER BY unique_customers DESC;


-- 15. Repeat customers
SELECT
    COUNT(*) AS repeat_customers
FROM (
    SELECT
        `Customer ID`
    FROM sales
    GROUP BY `Customer ID`
    HAVING COUNT(DISTINCT `Order ID`) > 1
) AS repeat_customer_list;


-- 16. One-time customers
SELECT
    COUNT(*) AS one_time_customers
FROM (
    SELECT
        `Customer ID`
    FROM sales
    GROUP BY `Customer ID`
    HAVING COUNT(DISTINCT `Order ID`) = 1
) AS one_time_customer_list;


-- 17. Customer repeat purchase rate
SELECT
    ROUND(
        (
            COUNT(CASE WHEN total_orders > 1 THEN 1 END)
            / COUNT(*)
        ) * 100,
        2
    ) AS repeat_customer_rate_percentage
FROM (
    SELECT
        `Customer ID`,
        COUNT(DISTINCT `Order ID`) AS total_orders
    FROM sales
    GROUP BY `Customer ID`
) AS customer_orders;


-- 18. Customer lifetime sales ranking with order frequency
SELECT
    `Customer ID`,
    `Customer Name`,
    ROUND(SUM(Sales), 2) AS lifetime_sales,
    COUNT(DISTINCT `Order ID`) AS total_orders,
    ROUND(
        SUM(Sales) / COUNT(DISTINCT `Order ID`),
        2
    ) AS average_order_value
FROM sales
GROUP BY `Customer ID`, `Customer Name`
ORDER BY lifetime_sales DESC
LIMIT 20;