import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Create = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState({ name: '', date: '', amount: '' });
  const [maxUserId, setMaxUserId] = useState(0);
  const [maxTransactionId, setMaxTransactionId] = useState(0);
  const [customers, setCustomers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [error, setError] = useState('');
  const [show, setShow] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersResult = await axios.get('http://localhost:3030/users');
        const transactionsResult = await axios.get('http://localhost:3030/transactions');
        setCustomers(usersResult.data);
        setTransactions(transactionsResult.data);
        setFilteredTransactions(transactionsResult.data);

        const userIds = usersResult.data.map(user => parseInt(user.id, 10));
        const maxUser = userIds.length ? Math.max(...userIds) : 0;
        setMaxUserId(maxUser);

        const transactionIds = transactionsResult.data.map(transaction => parseInt(transaction.id, 10));
        const maxTransaction = transactionIds.length ? Math.max(...transactionIds) : 0;
        setMaxTransactionId(maxTransaction);
      } 
      catch (error) {
        console.error('Error fetching data:', error);
        setError('Error fetching data. Please check if the transaction exists.');
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let TowUser = customers.find(user => user.name === value.name);
    let userId;
    if (TowUser) {
      userId = parseFloat (TowUser.id);
    } 
    else {
      // const userId =  parseFloat(value.id) > 0 ? parseFloat(value.id) :  maxUserId + 1;
      userId = maxUserId + 1;
      const newUser = { id: userId.toString(), name: value.name };
      await axios.post('http://localhost:3030/users', newUser);
      setMaxUserId(userId);
    }

    const newTransactionId = maxTransactionId + 1;
    const amount = parseFloat(value.amount);

    const newTransaction = { id: newTransactionId.toString(), customer_id: userId, date: value.date, amount: amount, };

    if (value.name === '' || value.date === '' || value.amount === '') {
      setShow(false);
      return;
    }
    console.log(value)
    setShow(true);
    try {
      await axios.post('http://localhost:3030/transactions', newTransaction);
      navigate('/');
    } 
    catch (error) {
      console.error('Error adding data:', error);
      setError('Error adding data. Please try again.');
    }
  };

  return (
    <div className='d-flex flex-column justify-content-center align-items-center bg-light vh-100 w-100'>
      <div className='w-50 rounded bg-white border shadow px-5 pt-3 pb-5'>
        <h1>Add User</h1>
        {error && <p className='text-danger'>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor='name'>Name :</label>
            <input type='text' name='name' className='form-control' placeholder='Enter Name'
              onChange={(e) => setValue({ ...value, name: e.target.value })}
            />
            {!show && value.name === '' && <div className="alert alert-danger">Name is required.</div>}
          </div>
          <div>
            <label htmlFor='date'>Date :</label>
            <input type='date' name='date' className='form-control' placeholder='Enter Date'
              onChange={(e) => setValue({ ...value, date: e.target.value })}
            />
            {!show && value.date === '' && <div className="alert alert-danger">Date is required.</div>}
          </div>
          <div className='mt-2 mb-3'>
            <label htmlFor='amount'>Amount</label>
            <input type='number' name='amount' className='form-control' placeholder='Enter Amount'
              onChange={(e) => setValue({ ...value, amount: e.target.value })}
            />
            {!show && value.amount === '' && <div className="alert alert-danger">Amount is required.</div>}
          </div>
          <button className='btn btn-success mt-3'>Submit</button>
          <Link to='/' className='btn btn-primary mt-3 ms-3'>Back</Link>
        </form>
      </div>
    </div>
  );
};

export default Create;
