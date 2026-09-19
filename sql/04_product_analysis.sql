-- ============================================================
-- E-COMMERCE SALES & CUSTOMER ANALYTICS
-- SQL PRODUCT ANALYSIS
-- ============================================================

USE ecommerce_analytics;


-- 1. Total unique products
SELECT
    COUNT(DISTINCT `Product ID`) AS total_products
FROM sales;


-- 2. Product performance summary
SELECT
    `Product ID`,
    `Product Name`,
    Category,
    `Sub-Category`,
    ROUND(SUM(Sales), 2) AS total_sales,
    ROUND(SUM(Profit), 2) AS total_profit,
    SUM(Quantity) AS total_quantity,
    ROUND(AVG(Discount) * 100, 2) AS average_discount_percentage
FROM sales
GROUP BY
    `Product ID`,
    `Product Name`,
    Category,
    `Sub-Category`
ORDER BY total_sales DESC;


-- 3. Top 10 products by sales
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


-- 4. Top 10 products by profit
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


-- 5. Top 10 products by quantity sold
SELECT
    `Product ID`,
    `Product Name`,
    SUM(Quantity) AS total_quantity,
    ROUND(SUM(Sales), 2) AS total_sales,
    ROUND(SUM(Profit), 2) AS total_profit
FROM sales
GROUP BY `Product ID`, `Product Name`
ORDER BY total_quantity DESC
LIMIT 10;


-- 6. Top 10 loss-making products
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


-- 7. Product profitability percentage
SELECT
    `Product ID`,
    `Product Name`,
    ROUND(SUM(Sales), 2) AS total_sales,
    ROUND(SUM(Profit), 2) AS total_profit,
    ROUND((SUM(Profit) / NULLIF(SUM(Sales), 0)) * 100, 2)
        AS profit_margin_percentage
FROM sales
GROUP BY `Product ID`, `Product Name`
ORDER BY profit_margin_percentage DESC
LIMIT 20;


-- 8. Category performance
SELECT
    Category,
    COUNT(DISTINCT `Product ID`) AS unique_products,
    ROUND(SUM(Sales), 2) AS total_sales,
    ROUND(SUM(Profit), 2) AS total_profit,
    SUM(Quantity) AS total_quantity,
    ROUND(
        (SUM(Profit) / NULLIF(SUM(Sales), 0)) * 100,
        2
    ) AS profit_margin_percentage
FROM sales
GROUP BY Category
ORDER BY total_sales DESC;


-- 9. Sub-category performance
SELECT
    `Sub-Category`,
    Category,
    COUNT(DISTINCT `Product ID`) AS unique_products,
    ROUND(SUM(Sales), 2) AS total_sales,
    ROUND(SUM(Profit), 2) AS total_profit,
    SUM(Quantity) AS total_quantity,
    ROUND(
        (SUM(Profit) / NULLIF(SUM(Sales), 0)) * 100,
        2
    ) AS profit_margin_percentage
FROM sales
GROUP BY `Sub-Category`, Category
ORDER BY total_sales DESC;


-- 10. Most profitable sub-categories
SELECT
    `Sub-Category`,
    ROUND(SUM(Sales), 2) AS total_sales,
    ROUND(SUM(Profit), 2) AS total_profit,
    ROUND(
        (SUM(Profit) / NULLIF(SUM(Sales), 0)) * 100,
        2
    ) AS profit_margin_percentage
FROM sales
GROUP BY `Sub-Category`
ORDER BY total_profit DESC
LIMIT 10;


-- 11. Loss-making sub-categories
SELECT
    `Sub-Category`,
    ROUND(SUM(Sales), 2) AS total_sales,
    ROUND(SUM(Profit), 2) AS total_profit,
    ROUND(
        (SUM(Profit) / NULLIF(SUM(Sales), 0)) * 100,
        2
    ) AS profit_margin_percentage
FROM sales
GROUP BY `Sub-Category`
HAVING SUM(Profit) < 0
ORDER BY total_profit ASC;


-- 12. Product performance by category
SELECT
    Category,
    `Sub-Category`,
    COUNT(DISTINCT `Product ID`) AS unique_products,
    SUM(Quantity) AS total_quantity,
    ROUND(SUM(Sales), 2) AS total_sales,
    ROUND(SUM(Profit), 2) AS total_profit
FROM sales
GROUP BY Category, `Sub-Category`
ORDER BY Category, total_sales DESC;


-- 13. Discount and product profitability
SELECT
    Discount,
    COUNT(DISTINCT `Product ID`) AS unique_products,
    SUM(Quantity) AS total_quantity,
    ROUND(SUM(Sales), 2) AS total_sales,
    ROUND(SUM(Profit), 2) AS total_profit,
    ROUND(
        (SUM(Profit) / NULLIF(SUM(Sales), 0)) * 100,
        2
    ) AS profit_margin_percentage
FROM sales
GROUP BY Discount
ORDER BY Discount;


-- 14. Products with negative profit
SELECT
    `Product ID`,
    `Product Name`,
    ROUND(SUM(Sales), 2) AS total_sales,
    ROUND(SUM(Profit), 2) AS total_profit
FROM sales
GROUP BY `Product ID`, `Product Name`
HAVING SUM(Profit) < 0
ORDER BY total_profit ASC;


-- 15. Products with high sales but negative profit
SELECT
    `Product ID`,
    `Product Name`,
    ROUND(SUM(Sales), 2) AS total_sales,
    ROUND(SUM(Profit), 2) AS total_profit,
    SUM(Quantity) AS total_quantity
FROM sales
GROUP BY `Product ID`, `Product Name`
HAVING SUM(Profit) < 0
   AND SUM(Sales) >= 5000
ORDER BY total_sales DESC;


-- 16. Product sales ranking
SELECT
    `Product ID`,
    `Product Name`,
    ROUND(SUM(Sales), 2) AS total_sales,
    RANK() OVER (
        ORDER BY SUM(Sales) DESC
    ) AS sales_rank
FROM sales
GROUP BY `Product ID`, `Product Name`
ORDER BY sales_rank
LIMIT 20;


-- 17. Product profit ranking
SELECT
    `Product ID`,
    `Product Name`,
    ROUND(SUM(Profit), 2) AS total_profit,
    RANK() OVER (
        ORDER BY SUM(Profit) DESC
    ) AS profit_rank
FROM sales
GROUP BY `Product ID`, `Product Name`
ORDER BY profit_rank
LIMIT 20;


-- 18. Average product-level performance
SELECT
    ROUND(AVG(total_sales), 2) AS average_product_sales,
    ROUND(AVG(total_profit), 2) AS average_product_profit,
    ROUND(AVG(total_quantity), 2) AS average_product_quantity
FROM (
    SELECT
        `Product ID`,
        SUM(Sales) AS total_sales,
        SUM(Profit) AS total_profit,
        SUM(Quantity) AS total_quantity
    FROM sales
    GROUP BY `Product ID`
) AS product_summary;