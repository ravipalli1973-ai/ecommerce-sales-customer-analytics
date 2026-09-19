"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type FilterRow = {
  "Order Date": string;
  Category: string;
  Region: string;
  Segment: string;
  Sales: number;
  Profit: number;
  Quantity: number;
  "Order ID": string;
  "Customer ID": string;
  "Customer Name": string;
  "Product ID": string;
  "Product Name": string;
};

type ProfitSubcategoryData = {
  subcategory: string;
  sales: number;
  profit: number;
};

type DiscountProfitData = {
  discount: number;
  sales: number;
  profit: number;
  transactions: number;
};

type ProfitSummaryData = {
  total_sales: number;
  total_profit: number;
  profit_margin: number;
  profitable_transactions: number;
  loss_transactions: number;
  zero_profit_transactions: number;
};

type CustomerData = {
  customer_id: string;
  customer_name: string;
  sales: number;
  profit: number;
  quantity: number;
  orders: number;
  average_order_value: number;
};

type ProductData = {
  product_id: string;
  product_name: string;
  sales: number;
  profit: number;
  quantity: number;
};

export default function Home() {
  const [rows, setRows] = useState<FilterRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedSegment, setSelectedSegment] = useState("All");

  const [profitSubcategories, setProfitSubcategories] = useState<
    ProfitSubcategoryData[]
  >([]);

  const [discountProfit, setDiscountProfit] = useState<
    DiscountProfitData[]
  >([]);

  const [profitSummary, setProfitSummary] =
    useState<ProfitSummaryData | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [
          filterResponse,
          subcategoryResponse,
          discountResponse,
          summaryResponse,
        ] = await Promise.all([
          fetch("/data/filter_data.json"),
          fetch("/data/profit_by_subcategory.json"),
          fetch("/data/discount_profit.json"),
          fetch("/data/profit_summary.json"),
        ]);

        if (
          !filterResponse.ok ||
          !subcategoryResponse.ok ||
          !discountResponse.ok ||
          !summaryResponse.ok
        ) {
          throw new Error("Failed to load dashboard data.");
        }

        const [
          filterData,
          subcategoryData,
          discountData,
          summaryData,
        ] = await Promise.all([
          filterResponse.json(),
          subcategoryResponse.json(),
          discountResponse.json(),
          summaryResponse.json(),
        ]);

        setRows(filterData);
        setProfitSubcategories(subcategoryData);
        setDiscountProfit(discountData);
        setProfitSummary(summaryData);
      } catch (err) {
        console.error(err);
        setError(
          "Unable to load dashboard data. Please check the data files."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const years = useMemo(() => {
    return Array.from(
      new Set(
        rows.map((row) => new Date(row["Order Date"]).getFullYear())
      )
    ).sort();
  }, [rows]);

  const categories = useMemo(() => {
    return Array.from(new Set(rows.map((row) => row.Category))).sort();
  }, [rows]);

  const regions = useMemo(() => {
    return Array.from(new Set(rows.map((row) => row.Region))).sort();
  }, [rows]);

  const segments = useMemo(() => {
    return Array.from(new Set(rows.map((row) => row.Segment))).sort();
  }, [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const rowYear = new Date(row["Order Date"]).getFullYear();

      return (
        (selectedYear === "All" ||
          rowYear.toString() === selectedYear) &&
        (selectedCategory === "All" ||
          row.Category === selectedCategory) &&
        (selectedRegion === "All" ||
          row.Region === selectedRegion) &&
        (selectedSegment === "All" ||
          row.Segment === selectedSegment)
      );
    });
  }, [
    rows,
    selectedYear,
    selectedCategory,
    selectedRegion,
    selectedSegment,
  ]);

  const hasActiveFilters =
    selectedYear !== "All" ||
    selectedCategory !== "All" ||
    selectedRegion !== "All" ||
    selectedSegment !== "All";

  const resetFilters = () => {
    setSelectedYear("All");
    setSelectedCategory("All");
    setSelectedRegion("All");
    setSelectedSegment("All");
  };

  const kpis = useMemo(() => {
    const totalSales = filteredRows.reduce(
      (sum, row) => sum + row.Sales,
      0
    );

    const totalProfit = filteredRows.reduce(
      (sum, row) => sum + row.Profit,
      0
    );

    const totalQuantity = filteredRows.reduce(
      (sum, row) => sum + row.Quantity,
      0
    );

    const totalOrders = new Set(
      filteredRows.map((row) => row["Order ID"])
    ).size;

    const totalCustomers = new Set(
      filteredRows.map((row) => row["Customer ID"])
    ).size;

    const profitMargin =
      totalSales === 0 ? 0 : (totalProfit / totalSales) * 100;

    return {
      totalSales,
      totalProfit,
      totalQuantity,
      totalOrders,
      totalCustomers,
      profitMargin,
    };
  }, [filteredRows]);

  const monthlySales = useMemo(() => {
    const map = new Map<string, number>();

    filteredRows.forEach((row) => {
      const date = new Date(row["Order Date"]);

      const month = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      map.set(month, (map.get(month) || 0) + row.Sales);
    });

    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, sales]) => ({
        month,
        sales,
      }));
  }, [filteredRows]);

  const categorySales = useMemo(() => {
    const map = new Map<
      string,
      {
        sales: number;
        profit: number;
        quantity: number;
      }
    >();

    filteredRows.forEach((row) => {
      const existing = map.get(row.Category) || {
        sales: 0,
        profit: 0,
        quantity: 0,
      };

      existing.sales += row.Sales;
      existing.profit += row.Profit;
      existing.quantity += row.Quantity;

      map.set(row.Category, existing);
    });

    return Array.from(map.entries())
      .map(([category, values]) => ({
        category,
        ...values,
      }))
      .sort((a, b) => b.sales - a.sales);
  }, [filteredRows]);

  const regionalSales = useMemo(() => {
    const map = new Map<
      string,
      {
        sales: number;
        profit: number;
        quantity: number;
      }
    >();

    filteredRows.forEach((row) => {
      const existing = map.get(row.Region) || {
        sales: 0,
        profit: 0,
        quantity: 0,
      };

      existing.sales += row.Sales;
      existing.profit += row.Profit;
      existing.quantity += row.Quantity;

      map.set(row.Region, existing);
    });

    return Array.from(map.entries())
      .map(([region, values]) => ({
        region,
        ...values,
      }))
      .sort((a, b) => b.sales - a.sales);
  }, [filteredRows]);

  /* =========================
     CUSTOMER ANALYTICS
     ========================= */

  const customers: CustomerData[] = useMemo(() => {
    const map = new Map<
      string,
      {
        sales: number;
        profit: number;
        quantity: number;
        orders: Set<string>;
        customer_name: string;
      }
    >();

    filteredRows.forEach((row) => {
      const existing = map.get(row["Customer ID"]) || {
        sales: 0,
        profit: 0,
        quantity: 0,
        orders: new Set<string>(),
        customer_name: row["Customer Name"],
      };

      existing.sales += row.Sales;
      existing.profit += row.Profit;
      existing.quantity += row.Quantity;
      existing.orders.add(row["Order ID"]);

      map.set(row["Customer ID"], existing);
    });

    return Array.from(map.entries())
      .map(([customer_id, values]) => {
        const orders = values.orders.size;

        return {
          customer_id,
          customer_name: values.customer_name,
          sales: values.sales,
          profit: values.profit,
          quantity: values.quantity,
          orders,
          average_order_value:
            orders === 0 ? 0 : values.sales / orders,
        };
      })
      .sort((a, b) => b.sales - a.sales);
  }, [filteredRows]);

  const customerSales = useMemo(() => {
    return customers.slice(0, 10).map((customer) => ({
      customer:
        customer.customer_name.length > 20
          ? `${customer.customer_name.slice(0, 20)}...`
          : customer.customer_name,
      sales: customer.sales,
    }));
  }, [customers]);

  const customerOrderFrequency = useMemo(() => {
    return [...customers]
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 10)
      .map((customer) => ({
        customer:
          customer.customer_name.length > 20
            ? `${customer.customer_name.slice(0, 20)}...`
            : customer.customer_name,
        orders: customer.orders,
      }));
  }, [customers]);

  const customerSummary = useMemo(() => {
    const totalCustomerSales = customers.reduce(
      (sum, customer) => sum + customer.sales,
      0
    );

    const totalCustomerProfit = customers.reduce(
      (sum, customer) => sum + customer.profit,
      0
    );

    const repeatCustomers = customers.filter(
      (customer) => customer.orders > 1
    ).length;

    const averageCustomerValue =
      customers.length === 0
        ? 0
        : totalCustomerSales / customers.length;

    const averageOrdersPerCustomer =
      customers.length === 0
        ? 0
        : customers.reduce(
            (sum, customer) => sum + customer.orders,
            0
          ) / customers.length;

    return {
      totalCustomerSales,
      totalCustomerProfit,
      repeatCustomers,
      averageCustomerValue,
      averageOrdersPerCustomer,
    };
  }, [customers]);

  /* =========================
     PRODUCT ANALYTICS
     ========================= */

  const products: ProductData[] = useMemo(() => {
    const map = new Map<
      string,
      {
        product_name: string;
        sales: number;
        profit: number;
        quantity: number;
      }
    >();

    filteredRows.forEach((row) => {
      const productId = row["Product ID"];

      const existing = map.get(productId) || {
        product_name: row["Product Name"],
        sales: 0,
        profit: 0,
        quantity: 0,
      };

      existing.sales += row.Sales;
      existing.profit += row.Profit;
      existing.quantity += row.Quantity;

      map.set(productId, existing);
    });

    return Array.from(map.entries())
      .map(([product_id, values]) => ({
        product_id,
        ...values,
      }))
      .sort((a, b) => b.sales - a.sales);
  }, [filteredRows]);

  const topProductsBySales = useMemo(() => {
    return [...products]
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10)
      .map((product) => ({
        product:
          product.product_name.length > 24
            ? `${product.product_name.slice(0, 24)}...`
            : product.product_name,
        sales: product.sales,
      }));
  }, [products]);

  const topProductsByProfit = useMemo(() => {
    return [...products]
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 10)
      .map((product) => ({
        product:
          product.product_name.length > 24
            ? `${product.product_name.slice(0, 24)}...`
            : product.product_name,
        profit: product.profit,
      }));
  }, [products]);

  const topProductsByQuantity = useMemo(() => {
    return [...products]
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10)
      .map((product) => ({
        product:
          product.product_name.length > 24
            ? `${product.product_name.slice(0, 24)}...`
            : product.product_name,
        quantity: product.quantity,
      }));
  }, [products]);

  const lossMakingProducts = useMemo(() => {
    return products
      .filter((product) => product.profit < 0)
      .sort((a, b) => a.profit - b.profit)
      .slice(0, 10);
  }, [products]);

  const productSummary = useMemo(() => {
    const profitableProducts = products.filter(
      (product) => product.profit > 0
    ).length;

    const lossProducts = products.filter(
      (product) => product.profit < 0
    ).length;

    const averageProductSales =
      products.length === 0
        ? 0
        : products.reduce(
            (sum, product) => sum + product.sales,
            0
          ) / products.length;

    return {
      totalProducts: products.length,
      profitableProducts,
      lossProducts,
      averageProductSales,
    };
  }, [products]);

  /* =========================
     REGIONAL ANALYTICS
     ========================= */

  const regionalSummary = useMemo(() => {
    if (regionalSales.length === 0) {
      return {
        highestSalesRegion: "—",
        highestProfitRegion: "—",
        lowestProfitRegion: "—",
        highestQuantityRegion: "—",
      };
    }

    const highestSales = [...regionalSales].sort(
      (a, b) => b.sales - a.sales
    )[0];

    const highestProfit = [...regionalSales].sort(
      (a, b) => b.profit - a.profit
    )[0];

    const lowestProfit = [...regionalSales].sort(
      (a, b) => a.profit - b.profit
    )[0];

    const highestQuantity = [...regionalSales].sort(
      (a, b) => b.quantity - a.quantity
    )[0];

    return {
      highestSalesRegion: highestSales.region,
      highestProfitRegion: highestProfit.region,
      lowestProfitRegion: lowestProfit.region,
      highestQuantityRegion: highestQuantity.region,
    };
  }, [regionalSales]);

  /* =========================
     BUSINESS KPI & INSIGHTS
     ========================= */

  const businessInsights = useMemo(() => {
    const totalOrders = kpis.totalOrders;

    const salesPerOrder =
      totalOrders === 0
        ? 0
        : kpis.totalSales / totalOrders;

    const profitPerOrder =
      totalOrders === 0
        ? 0
        : kpis.totalProfit / totalOrders;

    const unitsPerOrder =
      totalOrders === 0
        ? 0
        : kpis.totalQuantity / totalOrders;

    const averageSellingPrice =
      kpis.totalQuantity === 0
        ? 0
        : kpis.totalSales / kpis.totalQuantity;

    const profitableLines = filteredRows.filter(
      (row) => row.Profit > 0
    ).length;

    const lossLines = filteredRows.filter(
      (row) => row.Profit < 0
    ).length;

    const positiveProfitRate =
      filteredRows.length === 0
        ? 0
        : (profitableLines / filteredRows.length) * 100;

    const categoryMap = new Map<string, number>();

    filteredRows.forEach((row) => {
      categoryMap.set(
        row.Category,
        (categoryMap.get(row.Category) || 0) + row.Sales
      );
    });

    const topCategory =
      Array.from(categoryMap.entries()).sort(
        (a, b) => b[1] - a[1]
      )[0]?.[0] || "—";

    const segmentMap = new Map<string, number>();

    filteredRows.forEach((row) => {
      segmentMap.set(
        row.Segment,
        (segmentMap.get(row.Segment) || 0) + row.Sales
      );
    });

    const topSegment =
      Array.from(segmentMap.entries()).sort(
        (a, b) => b[1] - a[1]
      )[0]?.[0] || "—";

    return {
      salesPerOrder,
      profitPerOrder,
      unitsPerOrder,
      averageSellingPrice,
      profitableLines,
      lossLines,
      positiveProfitRate,
      topCategory,
      topSegment,
      topProduct: products[0]?.product_name || "—",
    };
  }, [filteredRows, kpis, products]);

  const performanceBySegment = useMemo(() => {
    const map = new Map<
      string,
      {
        sales: number;
        profit: number;
        quantity: number;
      }
    >();

    filteredRows.forEach((row) => {
      const existing = map.get(row.Segment) || {
        sales: 0,
        profit: 0,
        quantity: 0,
      };

      existing.sales += row.Sales;
      existing.profit += row.Profit;
      existing.quantity += row.Quantity;

      map.set(row.Segment, existing);
    });

    return Array.from(map.entries())
      .map(([segment, values]) => ({
        segment,
        ...values,
      }))
      .sort((a, b) => b.sales - a.sales);
  }, [filteredRows]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);

  const formatNumber = (value: number) =>
    new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
    }).format(value);

  const formatDecimal = (value: number) =>
    new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 2,
    }).format(value);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-700 border-t-cyan-400 rounded-full animate-spin mx-auto mb-5" />

          <h1 className="text-2xl font-bold">
            Loading dashboard...
          </h1>

          <p className="text-slate-500 mt-2">
            Preparing e-commerce analytics
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="max-w-md text-center bg-slate-900 border border-red-900/50 rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-red-400">
            Dashboard Error
          </h1>

          <p className="text-slate-400 mt-3">
            {error}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold transition"
          >
            Reload Dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* =========================
            PROJECT HEADER
            ========================= */}

        <header className="mb-8">
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">

              <div className="max-w-4xl">

                <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-xs font-semibold uppercase tracking-widest">
                  Data Analyst Portfolio Project
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-5 tracking-tight">
                  E-Commerce Revenue & Customer Analytics
                </h1>

                <p className="text-slate-400 mt-4 text-sm sm:text-base leading-7 max-w-3xl">
                  Interactive business intelligence dashboard covering
                  revenue, profitability, customers, products, regions,
                  and operational performance.
                </p>

                <p className="mt-4 text-sm font-medium text-slate-300">
                  Developed by{" "}
                  <span className="text-cyan-400">
                    Ravipalli Tirumala Kumar
                  </span>
                </p>
              </div>

              <div className="shrink-0">
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl px-5 py-4">
                  <p className="text-xs uppercase tracking-widest text-slate-500">
                    Current View
                  </p>

                  <p className="text-lg font-semibold mt-1">
                    {formatNumber(filteredRows.length)} records
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    {hasActiveFilters
                      ? "Filtered analysis"
                      : "Full dataset"}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </header>

        {/* =========================
            FILTERS
            ========================= */}

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 mb-8">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">

            <div>
              <h2 className="text-lg font-bold">
                Dashboard Filters
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Analyze the dashboard by year, category, region, and
                customer segment.
              </p>
            </div>

            <button
              onClick={resetFilters}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm font-medium transition"
            >
              Reset Filters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FilterSelect
              label="Year"
              value={selectedYear}
              options={years.map(String)}
              onChange={setSelectedYear}
            />

            <FilterSelect
              label="Category"
              value={selectedCategory}
              options={categories}
              onChange={setSelectedCategory}
            />

            <FilterSelect
              label="Region"
              value={selectedRegion}
              options={regions}
              onChange={setSelectedRegion}
            />

            <FilterSelect
              label="Segment"
              value={selectedSegment}
              options={segments}
              onChange={setSelectedSegment}
            />
          </div>
        </section>

        {/* =========================
            KPI OVERVIEW
            ========================= */}

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4 mb-10">

          <KpiCard
            title="Total Sales"
            value={formatCurrency(kpis.totalSales)}
            accent="cyan"
          />

          <KpiCard
            title="Total Profit"
            value={formatCurrency(kpis.totalProfit)}
            accent="green"
          />

          <KpiCard
            title="Quantity Sold"
            value={formatNumber(kpis.totalQuantity)}
            accent="blue"
          />

          <KpiCard
            title="Orders"
            value={formatNumber(kpis.totalOrders)}
            accent="purple"
          />

          <KpiCard
            title="Customers"
            value={formatNumber(kpis.totalCustomers)}
            accent="orange"
          />

          <KpiCard
            title="Profit Margin"
            value={`${kpis.profitMargin.toFixed(2)}%`}
            accent="green"
          />

        </section>

        {/* =========================
            SALES OVERVIEW
            ========================= */}

        <SectionTitle
          title="Sales Overview"
          description="Track revenue trends and category-level sales performance."
        />

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-10">

          <ChartCard
            title="Monthly Sales Trend"
            description="Monthly revenue based on the current filter selection."
          >
            <ResponsiveContainer width="100%" height={340}>
              <LineChart data={monthlySales}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e293b"
                />

                <XAxis
                  dataKey="month"
                  stroke="#64748b"
                  tick={{ fontSize: 11 }}
                />

                <YAxis
                  stroke="#64748b"
                  tick={{ fontSize: 11 }}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "10px",
                    color: "#fff",
                  }}
                  formatter={(value) =>
                    formatCurrency(Number(value ?? 0))
                  }
                />

                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#22d3ee"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Sales by Category"
            description="Revenue generated by each product category."
          >
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={categorySales}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e293b"
                />

                <XAxis
                  dataKey="category"
                  stroke="#64748b"
                />

                <YAxis
                  stroke="#64748b"
                  tick={{ fontSize: 11 }}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "10px",
                    color: "#fff",
                  }}
                  formatter={(value) =>
                    formatCurrency(Number(value ?? 0))
                  }
                />

                <Bar
                  dataKey="sales"
                  fill="#22d3ee"
                  radius={[7, 7, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

        </section>

        {/* =========================
            PROFITABILITY
            ========================= */}

        <SectionTitle
          title="Profitability Analytics"
          description="Understand profit contribution, transaction profitability, and discount impact."
        />

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

          <KpiCard
            title="Profitable Transactions"
            value={formatNumber(
              profitSummary?.profitable_transactions || 0
            )}
            accent="green"
          />

          <KpiCard
            title="Loss Transactions"
            value={formatNumber(
              profitSummary?.loss_transactions || 0
            )}
            accent="red"
          />

          <KpiCard
            title="Zero Profit Transactions"
            value={formatNumber(
              profitSummary?.zero_profit_transactions || 0
            )}
            accent="orange"
          />

        </section>

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-10">

          <ChartCard
            title="Profit by Sub-Category"
            description="Profit contribution across product sub-categories."
          >
            <ResponsiveContainer width="100%" height={380}>
              <BarChart
                data={profitSubcategories}
                layout="vertical"
                margin={{ left: 25, right: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e293b"
                />

                <XAxis
                  type="number"
                  stroke="#64748b"
                />

                <YAxis
                  type="category"
                  dataKey="subcategory"
                  width={100}
                  stroke="#64748b"
                  tick={{ fontSize: 11 }}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "10px",
                    color: "#fff",
                  }}
                  formatter={(value) =>
                    formatCurrency(Number(value ?? 0))
                  }
                />

                <Bar
                  dataKey="profit"
                  fill="#34d399"
                  radius={[0, 7, 7, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Discount vs Profit"
            description="Total profit across different discount levels."
          >
            <ResponsiveContainer width="100%" height={380}>
              <BarChart data={discountProfit}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e293b"
                />

                <XAxis
                  dataKey="discount"
                  stroke="#64748b"
                  tickFormatter={(value) =>
                    `${Number(value) * 100}%`
                  }
                />

                <YAxis stroke="#64748b" />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "10px",
                    color: "#fff",
                  }}
                  formatter={(value) =>
                    formatCurrency(Number(value ?? 0))
                  }
                  labelFormatter={(label) =>
                    `Discount: ${Number(label) * 100}%`
                  }
                />

                <Bar
                  dataKey="profit"
                  fill="#f59e0b"
                  radius={[7, 7, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

        </section>

        {/* =========================
            CUSTOMER ANALYTICS
            ========================= */}

        <SectionTitle
          title="Customer Analytics"
          description="Analyze customer value, repeat behavior, order frequency, and revenue contribution."
        />

        <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

          <KpiCard
            title="Customer Revenue"
            value={formatCurrency(
              customerSummary.totalCustomerSales
            )}
            accent="cyan"
          />

          <KpiCard
            title="Customer Profit"
            value={formatCurrency(
              customerSummary.totalCustomerProfit
            )}
            accent="green"
          />

          <KpiCard
            title="Repeat Customers"
            value={formatNumber(
              customerSummary.repeatCustomers
            )}
            accent="purple"
          />

          <KpiCard
            title="Average Customer Value"
            value={formatCurrency(
              customerSummary.averageCustomerValue
            )}
            accent="orange"
          />

        </section>

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">

          <ChartCard
            title="Top Customers by Sales"
            description="Top customers ranked by revenue."
          >
            <ResponsiveContainer width="100%" height={380}>
              <BarChart
                data={customerSales}
                layout="vertical"
                margin={{ left: 25, right: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e293b"
                />

                <XAxis
                  type="number"
                  stroke="#64748b"
                />

                <YAxis
                  type="category"
                  dataKey="customer"
                  width={135}
                  stroke="#64748b"
                  tick={{ fontSize: 11 }}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "10px",
                    color: "#fff",
                  }}
                  formatter={(value) =>
                    formatCurrency(Number(value ?? 0))
                  }
                />

                <Bar
                  dataKey="sales"
                  fill="#60a5fa"
                  radius={[0, 7, 7, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Customer Order Frequency"
            description="Customers with the highest number of orders."
          >
            <ResponsiveContainer width="100%" height={380}>
              <BarChart
                data={customerOrderFrequency}
                layout="vertical"
                margin={{ left: 25, right: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e293b"
                />

                <XAxis
                  type="number"
                  stroke="#64748b"
                />

                <YAxis
                  type="category"
                  dataKey="customer"
                  width={135}
                  stroke="#64748b"
                  tick={{ fontSize: 11 }}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "10px",
                    color: "#fff",
                  }}
                />

                <Bar
                  dataKey="orders"
                  fill="#a78bfa"
                  radius={[0, 7, 7, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

        </section>

        <DataTable
          title="Customer Value Analysis"
          headers={[
            "Customer",
            "Sales",
            "Profit",
            "Orders",
            "Average Order Value",
          ]}
        >
          {customers.slice(0, 15).map((customer) => (
            <tr
              key={customer.customer_id}
              className="border-t border-slate-800 hover:bg-slate-800/40 transition"
            >
              <td className="px-4 py-3 font-medium">
                {customer.customer_name}
              </td>

              <td className="px-4 py-3">
                {formatCurrency(customer.sales)}
              </td>

              <td
                className={`px-4 py-3 ${
                  customer.profit < 0
                    ? "text-red-400"
                    : "text-emerald-400"
                }`}
              >
                {formatCurrency(customer.profit)}
              </td>

              <td className="px-4 py-3">
                {formatNumber(customer.orders)}
              </td>

              <td className="px-4 py-3">
                {formatCurrency(
                  customer.average_order_value
                )}
              </td>
            </tr>
          ))}
        </DataTable>

        {/* =========================
            PRODUCT ANALYTICS
            ========================= */}

        <div className="mt-10">
          <SectionTitle
            title="Product Analytics"
            description="Evaluate product-level sales, profitability, quantity, and loss-making products."
          />

          <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

            <KpiCard
              title="Total Products"
              value={formatNumber(
                productSummary.totalProducts
              )}
              accent="cyan"
            />

            <KpiCard
              title="Profitable Products"
              value={formatNumber(
                productSummary.profitableProducts
              )}
              accent="green"
            />

            <KpiCard
              title="Loss-Making Products"
              value={formatNumber(
                productSummary.lossProducts
              )}
              accent="red"
            />

            <KpiCard
              title="Average Product Sales"
              value={formatCurrency(
                productSummary.averageProductSales
              )}
              accent="orange"
            />

          </section>

          <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">

            <ChartCard
              title="Top Products by Sales"
              description="Highest-revenue products under the selected filters."
            >
              <ResponsiveContainer width="100%" height={420}>
                <BarChart
                  data={topProductsBySales}
                  layout="vertical"
                  margin={{ left: 20, right: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#1e293b"
                  />

                  <XAxis
                    type="number"
                    stroke="#64748b"
                  />

                  <YAxis
                    type="category"
                    dataKey="product"
                    width={175}
                    stroke="#64748b"
                    tick={{ fontSize: 10 }}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: "10px",
                      color: "#fff",
                    }}
                    formatter={(value) =>
                      formatCurrency(Number(value ?? 0))
                    }
                  />

                  <Bar
                    dataKey="sales"
                    fill="#22d3ee"
                    radius={[0, 7, 7, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Top Products by Profit"
              description="Products generating the highest total profit."
            >
              <ResponsiveContainer width="100%" height={420}>
                <BarChart
                  data={topProductsByProfit}
                  layout="vertical"
                  margin={{ left: 20, right: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#1e293b"
                  />

                  <XAxis
                    type="number"
                    stroke="#64748b"
                  />

                  <YAxis
                    type="category"
                    dataKey="product"
                    width={175}
                    stroke="#64748b"
                    tick={{ fontSize: 10 }}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: "10px",
                      color: "#fff",
                    }}
                    formatter={(value) =>
                      formatCurrency(Number(value ?? 0))
                    }
                  />

                  <Bar
                    dataKey="profit"
                    fill="#34d399"
                    radius={[0, 7, 7, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

          </section>

          <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">

            <ChartCard
              title="Top Products by Quantity"
              description="Products with the highest units sold."
            >
              <ResponsiveContainer width="100%" height={420}>
                <BarChart
                  data={topProductsByQuantity}
                  layout="vertical"
                  margin={{ left: 20, right: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#1e293b"
                  />

                  <XAxis
                    type="number"
                    stroke="#64748b"
                  />

                  <YAxis
                    type="category"
                    dataKey="product"
                    width={175}
                    stroke="#64748b"
                    tick={{ fontSize: 10 }}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: "10px",
                      color: "#fff",
                    }}
                  />

                  <Bar
                    dataKey="quantity"
                    fill="#f59e0b"
                    radius={[0, 7, 7, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <DataTable
              title="Loss-Making Products"
              headers={[
                "Product",
                "Sales",
                "Profit",
                "Quantity",
              ]}
            >
              {lossMakingProducts.map((product) => (
                <tr
                  key={product.product_id}
                  className="border-t border-slate-800 hover:bg-slate-800/40 transition"
                >
                  <td className="px-4 py-3 font-medium">
                    {product.product_name}
                  </td>

                  <td className="px-4 py-3">
                    {formatCurrency(product.sales)}
                  </td>

                  <td className="px-4 py-3 text-red-400">
                    {formatCurrency(product.profit)}
                  </td>

                  <td className="px-4 py-3">
                    {formatNumber(product.quantity)}
                  </td>
                </tr>
              ))}
            </DataTable>

          </section>

          <DataTable
            title="Product Performance"
            headers={[
              "Product",
              "Sales",
              "Profit",
              "Quantity",
              "Profit Margin",
            ]}
          >
            {products.slice(0, 20).map((product) => {
              const margin =
                product.sales === 0
                  ? 0
                  : (product.profit / product.sales) * 100;

              return (
                <tr
                  key={product.product_id}
                  className="border-t border-slate-800 hover:bg-slate-800/40 transition"
                >
                  <td className="px-4 py-3 font-medium">
                    {product.product_name}
                  </td>

                  <td className="px-4 py-3">
                    {formatCurrency(product.sales)}
                  </td>

                  <td
                    className={`px-4 py-3 ${
                      product.profit < 0
                        ? "text-red-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {formatCurrency(product.profit)}
                  </td>

                  <td className="px-4 py-3">
                    {formatNumber(product.quantity)}
                  </td>

                  <td
                    className={`px-4 py-3 ${
                      margin < 0
                        ? "text-red-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {margin.toFixed(2)}%
                  </td>
                </tr>
              );
            })}
          </DataTable>
        </div>

        {/* =========================
            REGIONAL ANALYTICS
            ========================= */}

        <div className="mt-10">
          <SectionTitle
            title="Regional Analytics"
            description="Compare sales, profit, quantity, and profit margins across geographic regions."
          />

          <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

            <KpiCard
              title="Highest Sales Region"
              value={regionalSummary.highestSalesRegion}
              accent="cyan"
            />

            <KpiCard
              title="Highest Profit Region"
              value={regionalSummary.highestProfitRegion}
              accent="green"
            />

            <KpiCard
              title="Lowest Profit Region"
              value={regionalSummary.lowestProfitRegion}
              accent="red"
            />

            <KpiCard
              title="Highest Quantity Region"
              value={regionalSummary.highestQuantityRegion}
              accent="orange"
            />

          </section>

          <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">

            <ChartCard
              title="Regional Sales"
              description="Sales comparison across regions."
            >
              <ResponsiveContainer width="100%" height={360}>
                <BarChart data={regionalSales}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#1e293b"
                  />

                  <XAxis
                    dataKey="region"
                    stroke="#64748b"
                  />

                  <YAxis stroke="#64748b" />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: "10px",
                      color: "#fff",
                    }}
                    formatter={(value) =>
                      formatCurrency(Number(value ?? 0))
                    }
                  />

                  <Bar
                    dataKey="sales"
                    fill="#60a5fa"
                    radius={[7, 7, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Regional Profit"
              description="Profit comparison across regions."
            >
              <ResponsiveContainer width="100%" height={360}>
                <BarChart data={regionalSales}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#1e293b"
                  />

                  <XAxis
                    dataKey="region"
                    stroke="#64748b"
                  />

                  <YAxis stroke="#64748b" />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: "10px",
                      color: "#fff",
                    }}
                    formatter={(value) =>
                      formatCurrency(Number(value ?? 0))
                    }
                  />

                  <Bar
                    dataKey="profit"
                    fill="#34d399"
                    radius={[7, 7, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

          </section>

          <DataTable
            title="Regional Performance"
            headers={[
              "Region",
              "Sales",
              "Profit",
              "Quantity",
              "Profit Margin",
            ]}
          >
            {regionalSales.map((region) => {
              const margin =
                region.sales === 0
                  ? 0
                  : (region.profit / region.sales) * 100;

              return (
                <tr
                  key={region.region}
                  className="border-t border-slate-800 hover:bg-slate-800/40 transition"
                >
                  <td className="px-4 py-3 font-semibold">
                    {region.region}
                  </td>

                  <td className="px-4 py-3">
                    {formatCurrency(region.sales)}
                  </td>

                  <td
                    className={`px-4 py-3 ${
                      region.profit < 0
                        ? "text-red-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {formatCurrency(region.profit)}
                  </td>

                  <td className="px-4 py-3">
                    {formatNumber(region.quantity)}
                  </td>

                  <td
                    className={`px-4 py-3 ${
                      margin < 0
                        ? "text-red-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {margin.toFixed(2)}%
                  </td>
                </tr>
              );
            })}
          </DataTable>
        </div>

        {/* =========================
            BUSINESS KPI & INSIGHTS
            ========================= */}

        <div className="mt-10">
          <SectionTitle
            title="Business KPI & Insights"
            description="Executive-level metrics translating the dataset into measurable business performance indicators."
          />

          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

            <KpiCard
              title="Sales per Order"
              value={formatCurrency(
                businessInsights.salesPerOrder
              )}
              accent="cyan"
            />

            <KpiCard
              title="Profit per Order"
              value={formatCurrency(
                businessInsights.profitPerOrder
              )}
              accent="green"
            />

            <KpiCard
              title="Units per Order"
              value={formatDecimal(
                businessInsights.unitsPerOrder
              )}
              accent="purple"
            />

            <KpiCard
              title="Average Selling Price"
              value={formatCurrency(
                businessInsights.averageSellingPrice
              )}
              accent="orange"
            />

          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

            <KpiCard
              title="Positive Profit Rate"
              value={`${businessInsights.positiveProfitRate.toFixed(
                2
              )}%`}
              accent="green"
            />

            <KpiCard
              title="Profitable Lines"
              value={formatNumber(
                businessInsights.profitableLines
              )}
              accent="green"
            />

            <KpiCard
              title="Loss Lines"
              value={formatNumber(
                businessInsights.lossLines
              )}
              accent="red"
            />

            <KpiCard
              title="Avg Orders / Customer"
              value={formatDecimal(
                customerSummary.averageOrdersPerCustomer
              )}
              accent="purple"
            />

          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">

            <InsightCard
              title="Top Category"
              value={businessInsights.topCategory}
              description="Category with the highest sales contribution."
            />

            <InsightCard
              title="Top Segment"
              value={businessInsights.topSegment}
              description="Customer segment with the highest sales."
            />

            <InsightCard
              title="Top Product"
              value={
                businessInsights.topProduct.length > 45
                  ? `${businessInsights.topProduct.slice(0, 45)}...`
                  : businessInsights.topProduct
              }
              description="Product with the highest sales under current filters."
            />

          </section>

          <ChartCard
            title="Segment Business Performance"
            description="Sales contribution across customer segments."
          >
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={performanceBySegment}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e293b"
                />

                <XAxis
                  dataKey="segment"
                  stroke="#64748b"
                />

                <YAxis stroke="#64748b" />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "10px",
                    color: "#fff",
                  }}
                  formatter={(value) =>
                    formatCurrency(Number(value ?? 0))
                  }
                />

                <Bar
                  dataKey="sales"
                  fill="#818cf8"
                  radius={[7, 7, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* =========================
            FINAL FOOTER
            ========================= */}

        <footer className="mt-12 pt-8 border-t border-slate-800">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

            <div>
              <p className="font-semibold text-white">
                E-Commerce Revenue & Customer Analytics
              </p>

              <p className="text-sm text-slate-500 mt-1">
                Data Analyst Portfolio Project
              </p>
            </div>

            <div className="text-sm text-slate-500 md:text-right">
              <p>
                Developed by{" "}
                <span className="text-slate-300">
                  Ravipalli Tirumala Kumar
                
                </span>
                <div className="text-sm text-slate-400 mt-1">ravipalli1973@gmail.com</div>
              </p>

              <p className="mt-1">
                Next.js • TypeScript • Recharts • Python • Pandas • SQL
              </p>
            </div>

          </div>

        </footer>

      </div>
    </main>
  );
}

/* ================================================================
   REUSABLE COMPONENTS
   ================================================================ */

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-400 mb-2">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-3 text-sm text-white outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
      >
        <option value="All">All</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function KpiCard({
  title,
  value,
  accent = "cyan",
}: {
  title: string;
  value: string;
  accent?:
    | "cyan"
    | "green"
    | "blue"
    | "purple"
    | "orange"
    | "red";
}) {
  const accentClasses = {
    cyan: "border-cyan-400/20",
    green: "border-emerald-400/20",
    blue: "border-blue-400/20",
    purple: "border-purple-400/20",
    orange: "border-orange-400/20",
    red: "border-red-400/20",
  };

  const dotClasses = {
    cyan: "bg-cyan-400",
    green: "bg-emerald-400",
    blue: "bg-blue-400",
    purple: "bg-purple-400",
    orange: "bg-orange-400",
    red: "bg-red-400",
  };

  return (
    <div
      className={`bg-slate-900 border ${accentClasses[accent]} rounded-2xl p-5 shadow-lg hover:-translate-y-0.5 transition`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${dotClasses[accent]}`}
        />

        <p className="text-sm text-slate-400">
          {title}
        </p>
      </div>

      <p className="text-2xl font-bold text-white mt-3 break-words">
        {value}
      </p>
    </div>
  );
}

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5">
      <h2 className="text-2xl sm:text-3xl font-bold text-white">
        {title}
      </h2>

      <p className="text-sm text-slate-500 mt-2 max-w-3xl">
        {description}
      </p>
    </div>
  );
}

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">
          {title}
        </h3>

        <p className="text-sm text-slate-500 mt-1">
          {description}
        </p>
      </div>

      {children}
    </div>
  );
}

function InsightCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
      <p className="text-sm text-slate-400">
        {title}
      </p>

      <p className="text-xl font-bold text-cyan-400 mt-3 break-words">
        {value}
      </p>

      <p className="text-xs text-slate-500 mt-2 leading-5">
        {description}
      </p>
    </div>
  );
}

function DataTable({
  title,
  headers,
  children,
}: {
  title: string;
  headers: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
      <div className="p-5 border-b border-slate-800">
        <h3 className="text-lg font-semibold text-white">
          {title}
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-950">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left font-medium text-slate-400 whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}
