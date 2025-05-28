import { useState, useRef, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface SalesByPeriod {
  period: string;
  sales: number;
  orders: number;
}

interface TopProduct {
  _id?: string;
  name: string;
  totalSales: number;
  unitsSold: number;
}

interface SalesSummary {
  totalSales: number;
  totalOrders: number;
  avgOrderValue: number;
  salesByPeriod: SalesByPeriod[];
  topProducts: TopProduct[];
}

function Reports() {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const [salesSummary, setSalesSummary] = useState<SalesSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const API_BASE_URL = "https://eatsonline-fyp.onrender.com/api/v1";
  useEffect(() => {
    const fetchSalesSummary = async () => {
      try {
        setLoading(true);
        const response = await axios.get<SalesSummary>(
          `${API_BASE_URL}/order/report/summary`
        );
        setSalesSummary(response.data);
        setError(null);
        console.log("SalesSummary from API:", response.data);
      } catch (error) {
        setError("Failed to load sales summary.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesSummary();
  }, []); // Run once on mount

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;

    const originalClassList = [...document.documentElement.classList];
    document.documentElement.classList.remove("dark");
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: "#fff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("sales-report.pdf");
    } catch (err) {
      console.error("Error generating PDF", err);
    } finally {
      originalClassList.forEach((cls) => {
        if (cls === "dark") document.documentElement.classList.add("dark");
      });
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading sales report...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-600">{error}</div>;
  }

  if (!salesSummary) {
    return <div className="text-center p-8">No sales data available.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto my-8 p-8 bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-black/40">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
          Sales Reports
        </h1>
        <button
          onClick={handleDownloadPDF}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 dark:text-white rounded-md transition dark:bg-orange-500 dark:hover:bg-orange-600"
          type="button"
        >
          Download PDF
        </button>
      </div>

      <div ref={reportRef}>
        <div className="mb-6 flex items-center gap-4">
          <label
            className="text-lg text-gray-700 dark:text-gray-300"
            htmlFor="period-select"
          >
            View by:
          </label>
          <select
            id="period-select"
            value={period}
            onChange={(e) =>
              setPeriod(e.target.value as "daily" | "weekly" | "monthly")
            }
            className="p-2 border border-gray-300 dark:border-gray-700 rounded-md text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-md text-center">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Total Sales
            </h3>
            <p className="text-2xl text-orange-600 dark:text-orange-400">
              PKR {salesSummary?.totalSales?.toFixed(2)}
            </p>
          </div>
          <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-md text-center">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Total Orders
            </h3>
            <p className="text-2xl text-orange-600 dark:text-orange-400">
              {salesSummary.totalOrders}
            </p>
          </div>
          <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-md text-center">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Avg. Order Value
            </h3>
            <p className="text-2xl text-orange-600 dark:text-orange-400">
              PKR {salesSummary?.avgOrderValue?.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Sales by Period */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Sales by {period.charAt(0).toUpperCase() + period.slice(1)}
          </h2>
          <div className="border border-gray-300 dark:border-gray-700 rounded-md overflow-hidden">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-200 dark:bg-gray-700 font-semibold text-gray-700 dark:text-gray-300 p-4">
              <span className="col-span-2 md:col-span-2">Period</span>
              <span>Sales</span>
              <span>Orders</span>
            </div>
            {salesSummary.salesByPeriod?.length === 0 ? (
              <p className="p-4 text-center text-gray-500 dark:text-gray-400">
                No data available
              </p>
            ) : (
              salesSummary.salesByPeriod.map((item, index) => (
                <div
                  key={index}
                  className={`grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border-t border-gray-300 dark:border-gray-700 ${
                    index % 2 === 0
                      ? "bg-white dark:bg-gray-800"
                      : "bg-gray-50 dark:bg-gray-900"
                  }`}
                >
                  <span className="col-span-2 md:col-span-2">
                    {item.period}
                  </span>
                  <span>PKR {item.sales.toFixed(2)}</span>
                  <span>{item.orders}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Top Selling Products
          </h2>
          <div className="border border-gray-300 dark:border-gray-700 rounded-md overflow-hidden">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-200 dark:bg-gray-700 font-semibold text-gray-700 dark:text-gray-300 p-4">
              <span className="col-span-2 md:col-span-2">Product</span>
              <span>Sales</span>
              <span>Units Sold</span>
            </div>
            {salesSummary.topProducts?.length === 0 ? (
              <p className="p-4 text-center text-gray-500 dark:text-gray-400">
                No data available
              </p>
            ) : (
              salesSummary.topProducts.map((product, index) => (
                <div
                  key={product._id ?? index}
                  className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border-t border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                >
                  <span className="col-span-2 md:col-span-2">
                    {product.name}
                  </span>
                  <span>PKR {product.totalSales.toFixed(2)}</span>
                  <span>{product.unitsSold}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
