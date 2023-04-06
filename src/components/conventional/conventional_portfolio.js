import { useEffect, useState } from 'react';
import { funds_urls } from './logic';
import { useNavigate } from 'react-router-dom';



export default function ConventionalPortfolio(props) {

    const navigate = useNavigate();

    const [start_date, set_start_date] = useState('');
    const [end_date, set_end_date] = useState('');
    const full_data = [];

    const handleStart = async () => {

        // Navigate to all the routes one by one.
        {
            Object.keys(funds_urls).map((item, i) => {
                navigate(`/${item}`, {state: { startDate: start_date, endDate: end_date, fullData : full_data}}); // startDate and endDate are the parameters I am sending to navigated paths.
                // Get the input tags, fill them and click start button
            })
        }

    }

    // useEffect(() => {
    //     console.log(full_data);
    // })


    return (
        <div>
            <h1>Conventional Method - Portfolio</h1>

            <p>Get the table for:</p>
            <ul>
                {Object.keys(funds_urls).map((item, i) => (
                    <li key={i}><a href={`/${item}`}>{item}</a></li>
                ))}
            </ul>

            <label>Start Date</label>
            <input onChange={(e) => set_start_date(e.target.value)} name="start_date" type="date" />

            <label>End Date</label>
            <input onChange={(e) => set_end_date(e.target.value)} name="end_date" type="date" />

            <button onClick={handleStart} className="start">Start</button>

            <table>
                <thead>
                    <tr>
                        <td>Date</td>
                        <td>Cost</td>
                        <td>Value</td>
                    </tr>
                </thead>
            </table>
        </div>
    )
}