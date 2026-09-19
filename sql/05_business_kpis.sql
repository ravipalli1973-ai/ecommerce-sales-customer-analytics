-- ============================================================
-- E-COMMERCE SALES & CUSTOMER ANALYTICS
-- SQL BUSINESS KPI ANALYSIS
-- ============================================================

USE ecommerce_analytics;


-- 1. Overall business KPIs
SELECT
    ROUND(SUM(Sales), 2) AS total_sales,
    ROUND(SUM(Profit), 2) AS total_profit,
    SUM(Quantity) AS total_quantity,
    COUNT(DISTINCT `Order ID`) AS total_orders,
    COUNT(DISTINCT `Customer ID`) AS total_customers,
    COUNT(DISTINCT `Product ID`) AS total_products,
    ROUND(
        (SUM(Profit) / NULLIF(SUM(Sales), 0)) * 100,
        2
    ) AS profit_margin_percentage
FROM sales;


-- 2. Average Order Value
SELECT
    ROUND(
        SUM(Sales) / COUNT(DISTINCT `Order ID`),
        2
    ) AS average_order_value
FROM sales;


-- 3. Average profit per order
SELECT
    ROUND(
        SUM(Profit) / COUNT(DISTINCT `Order ID`),
        2
    ) AS average_profit_per_order
FROM sales;


-- 4. Average quantity per order
SELECT
    ROUND(
        SUM(Quantity) / COUNT(DISTINCT `Order ID`),
        2
    ) AS average_quantity_per_order
FROM sales;


-- 5. Average sales per customer
SELECT
    ROUND(
        SUM(Sales) / COUNT(DISTINCT `Customer ID`),
        2
    ) AS average_sales_per_customer
FROM sales;


-- 6. Average profit per customer
SELECT
    ROUND(
        SUM(Profit) / COUNT(DISTINCT `Customer ID`),
        2
    ) AS average_profit_per_customer
FROM sales;


-- 7. Orders per customer
SELECT
    ROUND(
        COUNT(DISTINCT `Order ID`) /
        COUNT(DISTINCT `Customer ID`),
        2
    ) AS average_orders_per_customer
FROM sales;


-- 8. Yearly business performance
SELECT
    YEAR(`Order Date`) AS order_year,
    ROUND(SUM(Sales), 2) AS total_sales,
    ROUND(SUM(Profit), 2) AS total_profit,
    SUM(Quantity) AS total_quantity,
    COUNT(DISTINCT `Order ID`) AS total_orders,
    COUNT(DISTINCT `Customer ID`) AS total_customers,
    ROUND(
        (SUM(Profit) / NULLIF(SUM(Sales), 0)) * 100,
        2
    ) AS profit_margin_percentage
FROM sales
GROUP BY YEAR(`Order Date`)
ORDER BY order_year;


-- 9. Year-over-year sales growth
SELECT
    order_year,
    total_sales,
    LAG(total_sales) OVER (
        ORDER BY order_year
    ) AS previous_year_sales,
    ROUND(
        (
            (total_sales -
            LAG(total_sales) OVER (ORDER BY order_year))
            /
            NULLIF(
                LAG(total_sales) OVER (ORDER BY order_year),
                0
            )
        ) * 100,
        2
    ) AS sales_growth_percentage
FROM (
    SELECT
        YEAR(`Order Date`) AS order_year,
        SUM(Sales) AS total_sales
    FROM sales
    GROUP BY YEAR(`Order Date`)
) AS yearly_sales
ORDER BY order_year;


-- 10. Year-over-year profit growth
SELECT
    order_year,
    total_profit,
    LAG(total_profit) OVER (
        ORDER BY order_year
    ) AS previous_year_profit,
    ROUND(
        (
            (total_profit -
            LAG(total_profit) OVER (ORDER BY order_year))
            /
            NULLIF(
                LAG(total_profit) OVER (ORDER BY order_year),
                0
            )
        ) * 100,
        2
    ) AS profit_growth_percentage
FROM (
    SELECT
        YEAR(`Order Date`) AS order_year,
        SUM(Profit) AS total_profit
    FROM sales
    GROUP BY YEAR(`Order Date`)
) AS yearly_profit
ORDER BY order_year;


-- 11. Monthly business performance
SELECT
    YEAR(`Order Date`) AS order_year,
    MONTH(`Order Date`) AS order_month,
    ROUND(SUM(Sales), 2) AS total_sales,
    ROUND(SUM(Profit), 2) AS total_profit,
    SUM(Quantity) AS total_quantity,
    COUNT(DISTINCT `Order ID`) AS total_orders
FROM sales
GROUP BY
    YEAR(`Order Date`),
    MONTH(`Order Date`)
ORDER BY
    order_year,
    order_month;


-- 12. Top 10 months by sales
SELECT
    YEAR(`Order Date`) AS order_year,
    MONTH(`Order Date`) AS order_month,
    ROUND(SUM(Sales), 2) AS total_sales,
    ROUND(SUM(Profit), 2) AS total_profit
FROM sales
GROUP BY
    YEAR(`Order Date`),
    MONTH(`Order Date`)
ORDER BY total_sales DESC
LIMIT 10;


-- 13. Top 10 months by profit
SELECT
    YEAR(`Order Date`) AS order_year,
    MONTH(`Order Date`) AS order_month,
    ROUND(SUM(Sales), 2) AS total_sales,
    ROUND(SUM(Profit), 2) AS total_profit
FROM sales
GROUP BY
    YEAR(`Order Date`),
    MONTH(`Order Date`)
ORDER BY total_profit DESC
LIMIT 10;


-- 14. Business performance by region
SELECT
    Region,
    ROUND(SUM(Sales), 2) AS total_sales,
    ROUND(SUM(Profit), 2) AS total_profit,
    COUNT(DISTINCT `Order ID`) AS total_orders,
    COUNT(DISTINCT `Customer ID`) AS total_customers,
    ROUND(
        (SUM(Profit) / NULLIF(SUM(Sales), 0)) * 100,
        2
    ) AS profit_margin_percentage
FROM sales
GROUP BY Region
ORDER BY total_sales DESC;


-- 15. Business performance by customer segment
SELECT
    Segment,
    ROUND(SUM(Sales), 2) AS total_sales,
    ROUND(SUM(Profit), 2) AS total_profit,
    COUNT(DISTINCT `Order ID`) AS total_orders,
    COUNT(DISTINCT `Customer ID`) AS total_customers,
    ROUND(
        (SUM(Profit) / NULLIF(SUM(Sales), 0)) * 100,
        2
    ) AS profit_margin_percentage
FROM sales
GROUP BY Segment
ORDER BY total_sales DESC;


-- 16. Business performance by category
SELECT
    Category,
    ROUND(SUM(Sales), 2) AS total_sales,
    ROUND(SUM(Profit), 2) AS total_profit,
    SUM(Quantity) AS total_quantity,
    COUNT(DISTINCT `Order ID`) AS total_orders,
    ROUND(
        (SUM(Profit) / NULLIF(SUM(Sales), 0)) * 100,
        2
    ) AS profit_margin_percentage
FROM sales
GROUP BY Category
ORDER BY total_sales DESC;


-- 17. Discount impact on business performance
SELECT
    Discount,
    ROUND(SUM(Sales), 2) AS total_sales,
    ROUND(SUM(Profit), 2) AS total_profit,
    COUNT(DISTINCT `Order ID`) AS total_orders,
    SUM(Quantity) AS total_quantity,
    ROUND(
        (SUM(Profit) / NULLIF(SUM(Sales), 0)) * 100,
        2
    ) AS profit_margin_percentage
FROM sales
GROUP BY Discount
ORDER BY Discount;


-- 18. Business profitability status
SELECT
    CASE
        WHEN SUM(Profit) > 0 THEN 'Profitable'
        WHEN SUM(Profit) < 0 THEN 'Loss Making'
        ELSE 'Break Even'
    END AS business_status,
    ROUND(SUM(Sales), 2) AS total_sales,
    ROUND(SUM(Profit), 2) AS total_profit
FROM sales;


-- 19. Orders by year
SELECT
    YEAR(`Order Date`) AS order_year,
    COUNT(DISTINCT `Order ID`) AS total_orders
FROM sales
GROUP BY YEAR(`Order Date`)
ORDER BY order_year;


-- 20. Customers by year
SELECT
    YEAR(`Order Date`) AS order_year,
    COUNT(DISTINCT `Customer ID`) AS total_customers
FROM sales
GROUP BY YEAR(`Order Date`)
ORDER BY order_year;


-- 21. Products by category
SELECT
    Category,
    COUNT(DISTINCT `Product ID`) AS unique_products,
    ROUND(SUM(Sales), 2) AS total_sales,
    ROUND(SUM(Profit), 2) AS total_profit
FROM sales
GROUP BY Category
ORDER BY total_sales DESC;


-- 22. Overall business performance summary
SELECT
    COUNT(DISTINCT `Order ID`) AS total_orders,
    COUNT(DISTINCT `Customer ID`) AS total_customers,
    COUNT(DISTINCT `Product ID`) AS total_products,
    ROUND(SUM(Sales), 2) AS total_sales,
    ROUND(SUM(Profit), 2) AS total_profit,
    ROUND(
        (SUM(Profit) / NULLIF(SUM(Sales), 0)) * 100,
        2
    ) AS profit_margin_percentage,
    ROUND(
        SUM(Sales) / COUNT(DISTINCT `Order ID`),
        2
    ) AS average_order_value,
    ROUND(
        SUM(Sales) / COUNT(DISTINCT `Customer ID`),
        2
    ) AS average_sales_per_customer
FROM sales;