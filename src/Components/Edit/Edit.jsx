import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const Edit = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [values, setValues] = useState({ name: '', date: '', amount: '' });
    const [userId, setUserId] = useState('');
    const [error, setError] = useState('');
    const [show , setshow] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log(`Fetching transaction with id: ${id}`);
                const transactionResult = await axios.get(`http://localhost:3030/transactions/${id}`);
                const transaction = transactionResult.data;
                setValues({ date: transaction.date, amount: transaction.amount });
                
                console.log(`Fetching user with id: ${transaction.customer_id}`);
                const userResult = await axios.get(`http://localhost:3030/users/${transaction.customer_id}`);
                const user = userResult.data;
                setValues((prevValues) => ({ ...prevValues, name: user.name }));
                setUserId(user.id);
            } 
            catch (error) {
                console.error('Error fetching data:', error);
                setError('Error fetching data. Please check if the transaction exists.');
            }
        };
        fetchData();
    }, [id]);

    const handleEdit = async (event) => {
        event.preventDefault();
        console.log(`Updating transaction with id: ${id}`);
        console.log(`Updating user with id: ${userId}`);
        
        const amount = parseFloat(values.amount);
        const customer_id = parseInt(userId, 10);
        
        if( values.name ==='' || values.date === '' || values.amount === '') {
            setshow(false);
            return;
        }
        console.log(values);
        setshow(true);
        try {
            await axios.put(`http://localhost:3030/users/${userId}`, { name: values.name });
            await axios.put(`http://localhost:3030/transactions/${id}`, { 
                customer_id: customer_id,  date: values.date, amount: amount
            });
            navigate('/');
        } 
        catch (error) {
            console.error('Error updating data:', error);
            setError('Error updating data. Please try again.');
        }
    };

    return <>
        <div className='d-flex flex-column justify-content-center align-items-center bg-light vh-100 w-100'>
            <div className='w-50 rounded bg-white border shadow px-5 pt-3 pb-5'>
                <h1>Edit User</h1>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleEdit}>
                    <div>
                        <label htmlFor='name'>Name :</label>
                        <input type="text" name='name' className="form-control" placeholder='Enter Name'
                            value={values.name || ''} onChange={(e) => setValues({ ...values, name: e.target.value })}
                        />
                        {!show && values.name === '' && <div className="alert alert-danger">Name is required.</div>}
                    </div>
                    <div>
                        <label htmlFor='date'>Date :</label>
                        <input type="date" name='date' className="form-control" placeholder='Enter Date'
                            value={values.date || ''} onChange={(e) => setValues({ ...values, date: e.target.value })}
                        />
                        {!show && values.date === '' && <div className="alert alert-danger">Date is required.</div>}
                    </div>
                    <div className='mt-2 mb-3'>
                        <label htmlFor='amount'>Amount</label>
                        <input type='number' name='amount' className="form-control" placeholder='Enter Amount'
                            value={values.amount || ''} onChange={(e) => setValues({ ...values, amount: e.target.value })}
                        />
                        {!show && values.amount === '' && <div className="alert alert-danger">Amount is required.</div>}
                    </div>
                    <button type='submit' className='btn btn-success mt-3'>Edit</button>
                    <Link to='/' className='btn btn-primary mt-3 ms-3'>Back</Link>
                </form>
            </div>
        </div>
    </>
};

export default Edit;

