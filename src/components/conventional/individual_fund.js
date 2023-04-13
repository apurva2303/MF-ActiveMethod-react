import { useEffect, useState } from "react";
import {
    funds_urls,
    SIP_amount,
    fetch_NAV,
    fetch_fund_name,
    date_to_ddmmyyyy,
    check_date_for_holiday,
    check_first_date_of_month,
} from "./logic.js";

import { useLocation } from 'react-router-dom';

function Conventional_Individual_fund(props) {
    const [fund, setFund] = useState('');
    const [start_date, set_start_date] = useState('');
    const [end_date, set_end_date] = useState('');
    const [tableData, setTableData] = useState([]);


    useEffect(() => {
        setFund(props.fund);
    });

    const DisplayTableData = tableData?.map((item, index) => {
        return (
            <tr key={index}>
                <td>{item.ddmmyyyy}</td>
                <td>{item.NAV_of_day}</td>
                <td>{item.cost}</td>
                <td>{item.investment_value}</td>
                <td>{item.units}</td>
                <td>{isNaN(item.avg_NAV) ? "-" : item.avg_NAV}</td>
                <td>{isNaN(item.NAV_growth) ? "-" : item.NAV_growth}</td>
            </tr>
        )
    });

    const handleStart = async () => {

        const current_fund_url = funds_urls[`${fund}`];

        const all_NAV_data = await fetch_NAV(current_fund_url);

        var month = 1;
        var cost = 0;
        var units = 0;
        var investment_value = 0;
        var avg_NAV = 0;
        var NAV_growth;
        const newTableData = [];

        const fund_name = await fetch_fund_name(current_fund_url);

        var fund_name_element = document.getElementById("fund_name");

        fund_name_element.innerHTML = fund_name;


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

            // console.log(ddmmyyyy, current_date, new Date(end_date));


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

            newTableData.push(newObj);
        }

        setTableData(newTableData);

    }


    return (
        <>
            <h1>Conventional Method - Individual Fund Logic ({fund})</h1>

            <label>Start Date</label>
            <input onChange={(e) => set_start_date(e.target.value)} value={start_date} name="start_date" type="date" />

            <label>End Date</label>
            <input onChange={(e) => set_end_date(e.target.value)} value={end_date} name="end_date" type="date" />

            <button onClick={handleStart} className="start">Start</button>

            <p id="fund_name"></p>

            <table id="fund_table">
                <thead>
                    <tr>
                        <td>Date</td>
                        <td>Fund NAV</td>
                        <td>Cost</td>
                        <td>Value</td>
                        <td>Units</td>
                        <td>Average NAV</td>
                        <td>NAV Growth</td>
                    </tr>
                </thead>
                <tbody id="fund_tbody">
                    {DisplayTableData}
                </tbody>
            </table>
        </>
    )
}

export default Conventional_Individual_fund;