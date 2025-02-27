import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Form, Button } from "react-bootstrap";

const years = Array.from(
  { length: 10 },
  (_, i) => new Date().getFullYear() - i
);

const AreaChartComponent = () => {
  const [economicCenters, setEconomicCenters] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedEconomicCenter, setSelectedEconomicCenter] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [monthlyReports, setMonthlyReports] = useState([]);
  const [annualReports, setAnnualReports] = useState([]);

  useEffect(() => {
    fetchEconomicCenters();
    fetchItems();
  }, []);

  const fetchEconomicCenters = () => {
    fetch("http://localhost:8000/economicCenter")
      .then((response) => response.json())
      .then((data) => {
        console.log("Economic Centers Data:", data);
        setEconomicCenters(Array.isArray(data) ? data : []);
      })
      .catch((error) =>
        console.error("Error fetching economic centers:", error)
      );
  };

  const fetchItems = () => {
    fetch("http://localhost:8000/item")
      .then((response) => response.json())
      .then((data) => {
        console.log("Items Data:", data);
        setItems(Array.isArray(data.items) ? data.items : []);
      })
      .catch((error) => console.error("Error fetching items:", error));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (selectedEconomicCenter && selectedYear && selectedItem) {
      fetch(
        `http://localhost:8000/analytical/generate_report/${selectedEconomicCenter}/${selectedItem}/${selectedYear}`,
        {
          method: "GET",
        }
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("Fetched Reports:", data);

          // Separate monthly and annual reports based on the type field in API response
          const monthlyData = data.monthly_report;
          const annualData = data.annual_report;

          setMonthlyReports(monthlyData);
          setAnnualReports(annualData);
        })
        .catch((error) => console.error("Error fetching reports:", error));
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-4 bg-gray-900 text-white rounded-md">
          <p className="text-lg">{label}</p>
          <p className="text-blue-400">
            Quantity: <span className="ml-2">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <Form onSubmit={handleSubmit} className="mb-5">
        <div className="row g-3">
          <div className="col-md-4">
            <Form.Group controlId="economicCenterSelect">
              <Form.Label>Economic Center</Form.Label>
              <Form.Control
                as="select"
                value={selectedEconomicCenter}
                onChange={(e) => setSelectedEconomicCenter(e.target.value)}
              >
                <option value="">Select Economic Center</option>
                {economicCenters.map((center) => (
                  <option key={center.id} value={center.id}>
                    {center.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </div>
          <div className="col-md-4">
            <Form.Group controlId="yearSelect">
              <Form.Label>Year</Form.Label>
              <Form.Control
                as="select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="">Select Year</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </div>
          <div className="col-md-4">
            <Form.Group controlId="itemSelect">
              <Form.Label>Item</Form.Label>
              <Form.Control
                as="select"
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
              >
                <option value="">Select Item</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </div>
        </div>
        <Button type="submit" className="mt-3">
          Fetch Reports
        </Button>
      </Form>

      {monthlyReports.length > 0 && (
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart
            data={monthlyReports}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="5 5" />
            <XAxis
              dataKey="month"
              label={{
                value: "Month",
                position: "insideBottomRight",
                offset: 0,
              }}
            />
            <YAxis
              label={{
                value: "Quantity",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="quantity"
              stroke="#2563eb"
              fill="#3b82f6"
              stackId="1"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}

      {annualReports.length > 0 && (
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart
            data={annualReports}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="5 5" />
            <XAxis
              dataKey="year"
              label={{
                value: "Year",
                position: "insideBottomRight",
                offset: 0,
              }}
            />
            <YAxis
              label={{
                value: "Quantity",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="quantity"
              stroke="#2563eb"
              fill="#3b82f6"
              stackId="1"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default AreaChartComponent;
