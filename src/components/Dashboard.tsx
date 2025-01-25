import React, { useState, useRef } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, DollarSign, Activity, Plus, X, Download, FileInput, Wand2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

type ChartType = 'line' | 'bar' | 'area' | 'pie';
type DataPoint = { name: string; value: number };
type Template = {
  name: string;
  description: string;
  format: string;
  example: DataPoint[];
};

const templates: Template[] = [
  {
    name: 'Monthly Sales',
    description: 'Track monthly sales performance',
    format: 'Month (string), Sales Amount (number)',
    example: [
      { name: 'Jan', value: 1200 },
      { name: 'Feb', value: 1900 },
      { name: 'Mar', value: 1600 },
      { name: 'Apr', value: 2100 },
    ]
  },
  {
    name: 'Product Categories',
    description: 'Compare sales across product categories',
    format: 'Category (string), Revenue (number)',
    example: [
      { name: 'Electronics', value: 5400 },
      { name: 'Clothing', value: 3200 },
      { name: 'Books', value: 2100 },
      { name: 'Home', value: 4300 },
    ]
  },
  {
    name: 'Weekly Traffic',
    description: 'Website traffic by weekday',
    format: 'Day (string), Visitors (number)',
    example: [
      { name: 'Mon', value: 2500 },
      { name: 'Tue', value: 3100 },
      { name: 'Wed', value: 3800 },
      { name: 'Thu', value: 3600 },
      { name: 'Fri', value: 3200 },
    ]
  }
];

const ChartCreator = () => {
  const [chartType, setChartType] = useState<ChartType>('line');
  const [data, setData] = useState<DataPoint[]>([]);
  const [newName, setNewName] = useState('');
  const [newValue, setNewValue] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addDataPoint = () => {
    if (newName && newValue) {
      setData([...data, { name: newName, value: Number(newValue) }]);
      setNewName('');
      setNewValue('');
    }
  };

  const removeDataPoint = (index: number) => {
    setData(data.filter((_, i) => i !== index));
  };

  const loadTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setData(template.example);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const lines = content.split('\n');
          const newData: DataPoint[] = [];
          
          // Skip header row and process each line
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line) {
              const [name, valueStr] = line.split(',').map(item => item.trim());
              const value = Number(valueStr);
              if (!isNaN(value)) {
                newData.push({ name, value });
              }
            }
          }
          
          setData(newData);
        } catch (error) {
          console.error('Error parsing CSV:', error);
          alert('Error parsing CSV file. Please ensure it matches the template format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const downloadTemplate = () => {
    if (!selectedTemplate) return;
    
    const header = 'name,value\n';
    const content = selectedTemplate.example
      .map(point => `${point.name},${point.value}`)
      .join('\n');
    
    const blob = new Blob([header + content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedTemplate.name.toLowerCase().replace(/\s+/g, '-')}-template.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportAsPNG = async () => {
    if (chartRef.current) {
      try {
        const canvas = await html2canvas(chartRef.current);
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = `chart-${Date.now()}.png`;
        link.click();
      } catch (error) {
        console.error('Error exporting PNG:', error);
      }
    }
  };

  const exportAsPDF = async () => {
    if (chartRef.current) {
      try {
        const canvas = await html2canvas(chartRef.current);
        const imageData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        
        pdf.addImage(imageData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`chart-${Date.now()}.pdf`);
      } catch (error) {
        console.error('Error exporting PDF:', error);
      }
    }
  };

  const renderChart = () => {
    const commonProps = {
      width: "100%",
      height: 300,
      data: data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#3b82f6" />
          </LineChart>
        );
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#3b82f6" />
          </BarChart>
        );
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="value" stroke="#8b5cf6" fill="#c4b5fd" />
          </AreaChart>
        );
      case 'pie':
        return (
          <PieChart {...commonProps}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#8b5cf6'][index % 3]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        );
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-6">Create Your Chart</h2>
      
      {/* Templates Section */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Quick Start Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((template, index) => (
            <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <h4 className="font-medium text-gray-800 mb-2">{template.name}</h4>
              <p className="text-sm text-gray-600 mb-2">{template.description}</p>
              <p className="text-xs text-gray-500 mb-3">Format: {template.format}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => loadTemplate(template)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
                >
                  <Wand2 className="w-4 h-4" />
                  Load
                </button>
                <button
                  onClick={() => {
                    setSelectedTemplate(template);
                    downloadTemplate();
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100"
                >
                  <FileInput className="w-4 h-4" />
                  Template
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* File Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Import Data (CSV)</label>
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 border border-gray-300"
          >
            <FileInput className="w-4 h-4" />
            Upload CSV
          </button>
        </div>
      </div>
      
      {/* Chart Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Chart Type</label>
        <select
          value={chartType}
          onChange={(e) => setChartType(e.target.value as ChartType)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="line">Line Chart</option>
          <option value="bar">Bar Chart</option>
          <option value="area">Area Chart</option>
          <option value="pie">Pie Chart</option>
        </select>
      </div>

      {/* Data Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Add Data Point</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Label"
            className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="number"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="Value"
            className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={addDataPoint}
            className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-300"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Data Table */}
      {data.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Current Data</h3>
          <div className="bg-gray-50 rounded-md p-4">
            {data.map((point, index) => (
              <div key={index} className="flex items-center justify-between py-1">
                <span className="text-sm">{point.name}: {point.value}</span>
                <button
                  onClick={() => removeDataPoint(index)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chart Display */}
      {data.length > 0 && (
        <>
          <div className="mb-4 flex gap-2">
            <button
              onClick={exportAsPNG}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-300"
            >
              <Download className="w-4 h-4" />
              Export as PNG
            </button>
            <button
              onClick={exportAsPDF}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:ring-2 focus:ring-green-300"
            >
              <Download className="w-4 h-4" />
              Export as PDF
            </button>
          </div>
          <div ref={chartRef} className="h-[400px] bg-white">
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Chart Creator</h1>
      <ChartCreator />
    </div>
  );
}