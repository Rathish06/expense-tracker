import React, { useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useAuth } from '../../contexts/AuthContext';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const ExpensePredictions = () => {
    const { user } = useAuth();
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [monthsAhead, setMonthsAhead] = useState(1);

    const fetchPredictions = async () => {
        try {
            setLoading(true);
            
            // Since there's no predictions endpoint in the backend,
            // we'll just set some default values for now
            setPredictions([
                {
                    month: 'Next Month',
                    predicted: 1200,
                    categories: {
                        'Food': 300,
                        'Transportation': 200,
                        'Entertainment': 100,
                        'Utilities': 600
                    }
                }
            ]);
            
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPredictions();
    }, [monthsAhead]);

    const getChartData = (prediction) => {
        return {
            labels: Object.keys(prediction.categories),
            datasets: [
                {
                    label: 'Predicted Expenses',
                    data: Object.values(prediction.categories),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.5)',
                        'rgba(54, 162, 235, 0.5)',
                        'rgba(255, 206, 86, 0.5)',
                        'rgba(75, 192, 192, 0.5)',
                        'rgba(153, 102, 255, 0.5)',
                        'rgba(255, 159, 64, 0.5)',
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                    ],
                    borderWidth: 1,
                },
            ],
        };
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Expense Predictions by Category',
            },
        },
    };

    if (loading) return <div>Loading predictions...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Expense Predictions</h2>
            
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Predict expenses for:
                </label>
                <select
                    value={monthsAhead}
                    onChange={(e) => setMonthsAhead(parseInt(e.target.value))}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                    <option value={1}>Next Month</option>
                    <option value={3}>Next 3 Months</option>
                    <option value={6}>Next 6 Months</option>
                    <option value={12}>Next Year</option>
                </select>
            </div>
            
            {predictions.map((prediction, index) => (
                <div key={index} className="mb-6">
                    <h3 className="text-md font-medium text-gray-700 mb-2">
                        {prediction.month} - Total: ${prediction.predicted.toFixed(2)}
                    </h3>
                    <Bar data={getChartData(prediction)} options={chartOptions} />
                </div>
            ))}
        </div>
    );
};

export default ExpensePredictions; 