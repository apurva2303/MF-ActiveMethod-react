import { useEffect, useState } from "react";
import {
    funds_urls,
    SIP_amount,
    fetch_NAV,
    fetch_fund_name,
    date_to_ddmmyyyy,
    check_date_for_holiday,
    check_first_date_of_month,
    fund_redemption as redemption
} from "./logic.js";


function Proposed_Individual_fund(props) {
    const [total_monthly_SIP_amt, set_total_monthly_SIP_amt] = useState(0);
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
                <td>{item.units_bought}</td>
                <td>{isNaN(item.avg_NAV) ? "-" : item.avg_NAV}</td>
                <td>{isNaN(item.NAV_growth) ? "-" : item.NAV_growth}</td>
                <td>{item.transaction_level_NAV_growth}</td>
                <td>{item.invested_amt}</td>
                <td>{item.redeemed_amt}</td>
                <td>{item.investment_kitty_contribution}</td>
            </tr>
        )
    });

    const handleStart = async () => {

        const current_fund_url = funds_urls[`${fund}`];

        const all_NAV_data = await fetch_NAV(current_fund_url);

        var month = -1;
        var cost = 0;
        var cum_units = 0;
        var units_bought = 0;
        var investment_value = 0;
        var avg_NAV = 0;
        var NAV_growth;
        var first_transaction_NAV;
        var transaction_level_NAV_growth;
        var dates_of_active_investments = [];
        const SIP_individual_fund = total_monthly_SIP_amt;

        const newTableData = [];

        const fund_name = await fetch_fund_name(current_fund_url);

        var fund_name_element = document.getElementById("fund_name");

        fund_name_element.innerHTML = fund_name;

        for (
            let current_date = new Date(start_date);
            current_date <= new Date(end_date);
            current_date.setDate(current_date.getDate() + 1)
            ) {

                var invested_amt = 0;
                var redeemed_amt = 0;
    
                // If current date is a holiday, then continue to next iteration. Else proceed:
                if (check_date_for_holiday(current_date, all_NAV_data)) {
                    continue;
                }
    
                // Getting day's NAV 
                const ddmmyyyy = date_to_ddmmyyyy(current_date);
                const day_NAV_data = all_NAV_data.find((obj) => obj.date === ddmmyyyy)
                const NAV_of_day = day_NAV_data.nav;
    
                // If first date of month, then invest within this function
                const month_investment_update = check_first_date_of_month(
                    current_date,
                    month,
                    Number(SIP_individual_fund),
                    Number(cost),
                    Number(NAV_of_day),
                    cum_units,
                    invested_amt,
                    dates_of_active_investments
                );
    
                month = current_date.getMonth();
                cost = month_investment_update[0];
                cum_units = month_investment_update[1];
                invested_amt = month_investment_update[2];
                dates_of_active_investments = month_investment_update[3];
                units_bought = month_investment_update[4];
    
    
                investment_value = (cum_units * NAV_of_day).toFixed(4);
                avg_NAV = cost / cum_units;
                NAV_growth = (((NAV_of_day - avg_NAV) / avg_NAV) * 100).toFixed(2);
    
    
                //If there is any left transaction to be redeemed then:
                if (dates_of_active_investments.length > 0) {
                    first_transaction_NAV = all_NAV_data.find((obj) => obj.date === dates_of_active_investments[0]).nav;
                    transaction_level_NAV_growth = ((NAV_of_day - first_transaction_NAV) / first_transaction_NAV) * 100;
    
                    // Call the redemption function to see the redeemed amount on current date if applicable o/w 0;
                    const daily_redemption_update = redemption(
                        current_date,
                        Number(NAV_growth),
                        transaction_level_NAV_growth,
                        redeemed_amt,
                        NAV_of_day,
                        dates_of_active_investments,
                        newTableData,
                        cost,
                        cum_units
                    )
    
                    redeemed_amt = daily_redemption_update[0];
                    dates_of_active_investments = daily_redemption_update[1];
                    cost = daily_redemption_update[2];
                    cum_units = daily_redemption_update[3];
                }
    
                // // Update Investment Kitty according to investment and redemption:
                // investment_kitty = (investment_kitty - invested + redeemed_amt);
    
    
                let newObj = {
                    ddmmyyyy: ddmmyyyy,
                    NAV_of_day: NAV_of_day,
                    cost: cost,
                    investment_value: investment_value,
                    units: cum_units,
                    avg_NAV: avg_NAV,
                    units_bought: units_bought,
                    invested_amt: invested_amt,
                    redeemed_amt: redeemed_amt,
                    NAV_growth: NAV_growth,
                    transaction_level_NAV_growth: transaction_level_NAV_growth,
                    investment_kitty_contribution: (redeemed_amt - invested_amt),
                }
    
                newTableData.push(newObj);
            }
    

        setTableData(newTableData);

    }


    return (
        <>
            <h1>Proposed Method - Individual Fund Logic ({fund})</h1>

            <input type="number" name="total_monthly_SIP_amt" onChange={(e) => set_total_monthly_SIP_amt(e.target.value)} placeholder="Total monthly SIP" />

            <label>Start Date</label>
            <input onChange={(e) => set_start_date(e.target.value)} value={start_date} name="start_date" type="date" />

            <label>End Date</label>
            <input onChange={(e) => set_end_date(e.target.value)} value={end_date} name="end_date" type="date" />

            <button onClick={handleStart} className="start">Start</button>

            <p id="fund_name"></p>

            <table id="fund_table">
                <thead>
                    <tr>
                        <td>date</td>
                        <td>NAV_of_day</td>
                        <td>cost</td>
                        <td>value</td>
                        <td>cum_units</td>
                        <td>units_bought</td>
                        <td>avg_NAV</td>
                        <td>NAV_growth</td>
                        <td>transaction_level_NAV_growth</td>
                        <td>invested_amt</td>
                        <td>redeemed_amt</td>
                        <td>investment_kitty_contribution</td>
                    </tr>
                </thead>
                <tbody id="fund_tbody">
                    {DisplayTableData}
                </tbody>
            </table>
        </>
    )
}

export default Proposed_Individual_fund;