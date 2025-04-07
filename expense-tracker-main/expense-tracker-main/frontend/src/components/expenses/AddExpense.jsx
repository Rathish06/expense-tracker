import React, { useState } from 'react';
import CategorySuggestions from './CategorySuggestions';

const AddExpense = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
    });
    const [validationErrors, setValidationErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState([]);

    const validateForm = () => {
        const errors = {};
        if (!formData.amount || formData.amount <= 0) {
            errors.amount = 'Amount must be greater than 0';
        }
        if (!formData.date) {
            errors.date = 'Date is required';
        }
        if (!formData.description.trim()) {
            errors.description = 'Description is required';
        }
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setError(null);

        try {
            // First, try to get category suggestions if no category is selected
            if (!formData.category) {
                const response = await fetch('http://localhost:8000/api/v1/expenses/suggest-category', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        description: formData.description,
                        amount: parseFloat(formData.amount)
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to get category suggestions');
                }

                const data = await response.json();
                setSuggestions(data.suggestions);
                setShowSuggestions(true);
                setLoading(false);
                return;
            }

            // If category is selected, submit the expense
            const response = await fetch('http://localhost:8000/api/v1/expenses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    ...formData,
                    amount: parseFloat(formData.amount)
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to create expense');
            }

            const data = await response.json();
            onSubmit(data);
            setFormData({
                category: '',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                description: ''
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCategorySelect = (category) => {
        setFormData(prev => ({ ...prev, category }));
        setShowSuggestions(false);
        handleSubmit({ preventDefault: () => {} });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (validationErrors[name]) {
            setValidationErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    return (
        <div className="bg-white shadow sm:rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Expense</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                    </label>
                    <input
                        type="text"
                        name="description"
                        id="description"
                        value={formData.description}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                            validationErrors.description ? 'border-red-300' : 'border-gray-300'
                        } focus:ring-indigo-500 focus:border-indigo-500`}
                        required
                    />
                    {validationErrors.description && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                        Amount
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                            type="number"
                            name="amount"
                            id="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            className={`block w-full pl-7 pr-12 sm:text-sm rounded-md ${
                                validationErrors.amount ? 'border-red-300' : 'border-gray-300'
                            } focus:ring-indigo-500 focus:border-indigo-500`}
                            required
                        />
                    </div>
                    {validationErrors.amount && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.amount}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                        Date
                    </label>
                    <input
                        type="date"
                        name="date"
                        id="date"
                        value={formData.date}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                            validationErrors.date ? 'border-red-300' : 'border-gray-300'
                        } focus:ring-indigo-500 focus:border-indigo-500`}
                        required
                    />
                    {validationErrors.date && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.date}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                        Category (Optional)
                    </label>
                    <input
                        type="text"
                        name="category"
                        id="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md shadow-sm sm:text-sm border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                    />
                </div>

                {error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Error</h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>{error}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {loading ? 'Adding...' : 'Add Expense'}
                    </button>
                </div>
            </form>

            {showSuggestions && (
                <CategorySuggestions
                    suggestions={suggestions}
                    onSelect={handleCategorySelect}
                    onCancel={() => setShowSuggestions(false)}
                />
            )}
        </div>
    );
};

export default AddExpense; 