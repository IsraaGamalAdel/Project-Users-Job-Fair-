import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import 'bootstrap/dist/css/bootstrap.min.css';

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

export default function Home() {
    const [customers, setCustomers] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [customerTransactionData, setCustomerTransactionData] = useState(null);
    const [transactionDataByDate, setTransactionDataByDate] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const usersResult = await axios.get('http://localhost:3030/users');
                const transactionsResult = await axios.get('http://localhost:3030/transactions');
                setCustomers(usersResult.data);
                setTransactions(transactionsResult.data);
                setFilteredTransactions(transactionsResult.data);

                // Set selected customer and date
                if (usersResult.data.length > 0) {
                    setSelectedCustomer(usersResult.data[0].id);
                    setCustomerTransactionData(getTransactionDataForCustomer(usersResult.data[0].id));
                }
                // Set selected date
                if (transactionsResult.data.length > 0) {
                    setSelectedDate(transactionsResult.data[0].date);
                    setTransactionDataByDate(getTransactionData(transactionsResult.data[0].date));
                }
            } 
            catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    const handleDelete = async (id ,customerId) => {
        const confirm = window.confirm('Are you sure you want to delete this transaction?');
        if (confirm) {
            try {
                await axios.delete(`http://localhost:3030/transactions/${id}`);
                const updatedTransactions = transactions.filter(transaction => transaction.id !== id);
                console.log(updatedTransactions + " updated value " );
                setTransactions(updatedTransactions);
                setFilteredTransactions(updatedTransactions);

                const customerTransactions = updatedTransactions.filter(transaction => transaction.customer_id == customerId);
                if (customerTransactions.length === 0) {
                    await axios.delete(`http://localhost:3030/users/${customerId}`);
                    const updatedCustomers = customers.filter(customer => customer.id !== customerId);
                    setCustomers(updatedCustomers);
                    window.location.reload(true);
                }
            } 
            catch (error) {
                console.error('Error deleting transaction:', error);
            }
        }
    };

    const handleFilter = (e) => {
        const value = e.target.value.toLowerCase();
        const filtered = transactions.filter(transaction =>
            customers.find(customer => customer.id == transaction.customer_id && customer.name.toLowerCase().includes(value))
        );
        setFilteredTransactions(filtered);
    };    
    const handleDateChange = (e) => {
        const date = e.target.value;
        setSelectedDate(date);
        if (date) {
            const dateData = getTransactionData(date);
            setTransactionDataByDate(dateData);
        } else {
            setTransactionDataByDate(null);
        }
    };
    const getTransactionData = (date) => {
        const data = transactions.filter(transaction => transaction.date == date);
        const groupedData = data.reduce((acc, transaction) => {
            if (!acc[transaction.customer_id]) {
                const customer = customers.find(customer => customer.id == transaction.customer_id);
                acc[transaction.customer_id] = {
                    name: customer ? customer.name : 'Unknown',
                    totalAmount: 0, transactionCount: 0
                };
            }
            acc[transaction.customer_id].totalAmount += transaction.amount;
            acc[transaction.customer_id].transactionCount += 1;
            return acc;
        }, {});

        return {
            labels: Object.values(groupedData).map(data => data.name),
            datasets: [
                {
                    label: 'Total Amount',
                    data: Object.values(groupedData).map(data => data.totalAmount),
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                },
            ],
        };
    };
    const handleCustomerChange = (e) => {
        const customerId = e.target.value;
        setSelectedCustomer(customerId);
        if (customerId) {
            const customerData = getTransactionDataForCustomer(customerId);
            setCustomerTransactionData(customerData);
        } else {
            setCustomerTransactionData(null);
        }
    };
    const getTransactionDataForCustomer = (date) => {
        const customerTransactions = transactions.filter(transaction => transaction.customer_id == date);
        const groupedData = customerTransactions.reduce((acc, transaction) => {
            if (!acc[transaction.date]) {
                acc[transaction.date] = {
                    totalAmount: 0, transactionCount: 0
                };
            }
            acc[transaction.date].totalAmount += transaction.amount;
            acc[transaction.date].transactionCount += 1;
            return acc;
        }, {});

        return {
            labels: Object.keys(groupedData),
            datasets: [
                {
                    label: 'Total Amount',
                    data: Object.values(groupedData).map(data => data.totalAmount),
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                },
            ],
        };
    };

    return <>
        <div className='container-fluid d-flex flex-column justify-content-center align-items-center bg-light'>
            <div className='col-sm-12 col-md-12 mt-5 text-center'>
                <h3 className='fs-1 fw-bold'>Table Users</h3>
            </div>
            <div className='w-75 mt-3 rounded bg-white border shadow p-4 mb-5'>
                <div className='d-flex justify-content-between align-items-center mb-3'>
                    <div>
                        <input type="text" placeholder='Search...' onChange={handleFilter} className='p-2 px-4 border rounded' />
                    </div>
                    <div>
                        <Link to='/Create' className='btn btn-success px-5'>Add</Link>
                    </div>
                </div>
                <div className='table-responsive'>
                    <table className='container table table-striped'>
                        <thead className=' '>
                            <tr className='text-center'>
                                <th>Name</th>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.map(transaction => {
                                const customer = customers.find(c => c.id == transaction.customer_id);
                                return (
                                    <tr key={transaction.id} className='text-center'>
                                        <td>{customer ? customer.name : 'Unknown'}</td>
                                        <td>{transaction.date}</td>
                                        <td>{transaction.amount}</td>
                                        <td>
                                            <Link to={`/edit/${transaction.id}`} className='btn btn-sm btn-primary me-3 px-3'>Edit</Link>
                                            <button onClick={() => handleDelete(transaction.id, transaction.customer_id)} className='btn btn-sm btn-danger px-3'>Delete</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className='w-75 mt-3 rounded bg-white border shadow p-4 mb-5'>
                <div className='row'>
                    <div className='col-sm-12 col-md-12'>
                        <div className='mt-5 w-100'>
                            <div className="mt-4">
                                <h3>Transaction Chart</h3>
                                <div className='mb-3'>
                                    <label htmlFor="customerSelect" className='p-2 pe-5 fs-4'>Select Customer: </label>
                                    <select className='p-2 border rounded fs-5 text-primary px-4' id="customerSelect" onChange={handleCustomerChange} value={selectedCustomer }>
                                        <option value=''>Select Customer</option>
                                        {customers.map(customer => (
                                            <option key={customer.id} value={customer.id}>{customer.name}</option>
                                        ))}
                                    </select>
                                </div>
                                {selectedCustomer && (
                                    <Bar data={ getTransactionDataForCustomer(selectedCustomer)} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className='w-75 mt-3 rounded bg-white border shadow p-4 mb-5'>
                <div className='row'>
                    <div className='col-sm-12 col-md-12'>
                        <div className='mt-5 w-100'>
                            <div className="mt-4">
                                <h3>Transaction Chart for Date: {selectedDate}</h3>
                                <div className='mb-3'>
                                    <label htmlFor="transactionDate" className='p-2 pe-5 fs-4'>Select Date: </label>
                                    <input className='p-2 border rounded fs-5 text-primary' type="date" id="transactionDate" onChange={handleDateChange} value={selectedDate } />
                                </div>
                                {selectedDate && (
                                    <Bar data={getTransactionData(selectedDate)} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
}
