import { useState } from 'react';
import { funds_urls } from './logic';


export default function ConventionalPortfolio() {

    const [start_date, set_start_date] = useState('');
    const [end_date, set_end_date] = useState('');


    const handleStart = () => {
        // Click all the individual fund's start button
        // click_all_start_buttons(start_date, end_date);
    }


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
            <input name="start_date" type="date" />
            <label>End Date</label>
            <input name="end_date" type="date" />
            <button id="date_range_submit">Submit</button>


            <button onClick={handleStart} >Start</button>
            <table>
                <thead>
                    <td>Date</td>
                    <td>Cost</td>
                    <td>Value</td>
                </thead>
            </table>
        </div>
    )
}