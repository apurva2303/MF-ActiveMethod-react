import { useEffect, useState } from 'react';

import {
    funds_urls,
    SIP_amount,
    fetch_NAV,
    fetch_fund_name,
    date_to_ddmmyyyy,
    check_date_for_holiday,
    check_first_date_of_month,
} from "./logic.js";


export default function ConventionalPortfolio(props) {

    const [start_date, set_start_date] = useState('');
    const [end_date, set_end_date] = useState('');
    const [allFundsData, setAllFundData] = useState([]);
    const [tableData, setTableData] = useState([]);

    const full_data = [];

    const TableDataCalc = async (fund) => {

        const current_fund_url = funds_urls[`${fund}`];
        const all_NAV_data = await fetch_NAV(current_fund_url);

        var month = -1;
        var cost = 0;
        var units = 0;
        var investment_value = 0;
        var avg_NAV = 0;
        var NAV_growth;
        const newTableData = {
            fund: fund,
            data: []
        };

        const fund_name = await fetch_fund_name(current_fund_url);

        for (
            let current_date = new Date(start_date);
            current_date <= new Date(end_date);
            current_date.setDate(current_date.getDate() + 1)
        ) {

            // If current date is a holiday, then continue to next iteration. Else proceed:
            if (check_date_for_holiday(current_date, all_NAV_data)) {
                continue;
            }

            // Getting day's NAV 
            const ddmmyyyy = date_to_ddmmyyyy(current_date);
            const day_NAV_data = all_NAV_data.find((obj) => obj.date === ddmmyyyy)
            const NAV_of_day = day_NAV_data.nav;

            const month_investment_update = check_first_date_of_month(
                current_date,
                month,
                SIP_amount,
                cost,
                NAV_of_day,
                units
            );

            // If first date of month, then invest within this function
            month = current_date.getMonth();

            cost = month_investment_update[0];
            units = month_investment_update[1];

            investment_value = (units * NAV_of_day).toFixed(4);
            avg_NAV = cost / units;
            NAV_growth = (((NAV_of_day - avg_NAV) / avg_NAV) * 100).toFixed(2);

            // populate_table();
            let newObj = {
                ddmmyyyy: ddmmyyyy,
                NAV_of_day: NAV_of_day,
                cost: cost,
                investment_value: investment_value,
                units: units,
                avg_NAV: avg_NAV,
                NAV_growth: NAV_growth
            }
            newTableData["data"].push(newObj);
        }

        setAllFundData(oldArray => [...oldArray, newTableData]);
        // full_data.push(newTableData);
        // console.log(full_data);
        // setAllFundData(full_data);
    }


    // Everytime the component loads or allFndsData is changed, this function is called:
    useEffect(() => {

        if (allFundsData.length > 0) {
            populate_table();
        }
        console.log(tableData)

    }, [allFundsData])


    // Takes the allFundsData array and returns the largest "data" array:
    const find_largest_array = (array_of_arrays) => {
        var largest_array = array_of_arrays[0].data;
        for (let i = 0; i < array_of_arrays.length; i++) {
            if (largest_array.length < array_of_arrays[i].data.length) {
                largest_array = array_of_arrays[i].data;
            }
        }

        return largest_array;

    }

    // Displays the table Data on the table:
    const DisplayData = tableData?.map((item, index) => {
        return (
            <tr className="text-light table-cell" key={index}>
                <td>{item.date}</td>
                {Object.keys(funds_urls).map((fund_name) => {
                    return (
                        <>
                            <td>{item[fund_name] ? item[fund_name].cost : "NA"}</td>
                            <td>{item[fund_name] ? item[fund_name].value : "NA"}</td>
                        </>
                    )
                })}

                <td>{item.portfolio.cost}</td>
                <td>{item.portfolio.value}</td>

            </tr>
        );
    });

    // Populates the combined table to be displayed on the portfolio page
    const populate_table = () => {

        const newArray = [];

        var largest_fund_data = find_largest_array(allFundsData);
        const ddmmyyyyValues = largest_fund_data.map(obj => obj.ddmmyyyy);

        let oldObj = {
            date: date_to_ddmmyyyy(new Date(start_date)),
        }
        Object.keys(funds_urls).map((item) => {
            oldObj[item] = {
                cost: 0,
                value: 0
            }
        })

        // Run a loop through date array, and for 1 date, check all of the funds for more data.
        ddmmyyyyValues.forEach(date => {

            let cost_sum = 0;
            let value_sum = 0;

            console.log(cost_sum)

            let newObj = {
                date: date,
            }

            // console.log(date);


            // Check for all the funds for the given date:
            allFundsData.forEach((fundObj) => {

                // Loop through the data array of each object to find the object with matching ddmmyyyy value
                const foundObject = fundObj.data.find(obj => obj.ddmmyyyy === date);

                if (foundObject) {

                    cost_sum += foundObject.cost;
                    value_sum += Number(foundObject.investment_value);

                    newObj[fundObj.fund] = {
                        cost: foundObject.cost,
                        value: Number(foundObject.investment_value)
                    }

                    // console.log(newObj);

                }
                else {

                    cost_sum += oldObj[fundObj.fund].cost;
                    value_sum += Number(oldObj[fundObj.fund].value);

                    newObj[fundObj.fund] = {
                        cost: oldObj[fundObj.fund].cost,
                        value: Number(oldObj[fundObj.fund].value)
                    }
                }

                oldObj = Object.assign({}, newObj);
            });

            newObj.portfolio = {
                cost: cost_sum,
                value: value_sum
            }

            newArray.push(newObj);

        });

        setTableData(newArray);

    }

    const handleStart = () => {

        Object.keys(funds_urls).map((item) => {
            TableDataCalc(item);
        });

    }

    return (
        <div>
            <h1>Conventional Method - Portfolio</h1>

            <p>Get the detailed table for:</p>
            <ul>
                {Object.keys(funds_urls).map((item, i) => (
                    <li key={i}><a href={`/conventional/${item}`}>{item}</a></li>
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
                        <th></th>
                        {Object.keys(funds_urls).map((item, i) => {
                            return (
                                <th colSpan={2}>{item}</th>
                            )
                        })}
                        <th colSpan={2}>Portfolio</th>
                    </tr>
                    <tr>
                        <th>Date</th>
                        {Object.keys(funds_urls).map((item, i) => {
                            return (
                                <>
                                    <th>Cost</th>
                                    <th>Value</th>
                                </>
                            )
                        })}
                        <th>Cost</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody id="portfolio_tbody">{DisplayData}</tbody>
            </table>
        </div>
    )
}