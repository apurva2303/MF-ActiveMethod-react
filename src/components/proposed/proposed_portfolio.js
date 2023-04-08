import { useEffect, useState } from "react";
import {
    funds_urls,
    fetch_NAV,
    fetch_fund_name,
    date_to_ddmmyyyy,
    check_date_for_holiday,
    check_first_date_of_month,
    redemption,
} from "./logic.js";

export default function Proposed_portfolio() {

    const [investment_kitty, set_investment_kitty] = useState(0);
    const [total_monthly_SIP_amt, set_total_monthly_SIP_amt] = useState(0);
    const [start_date, set_start_date] = useState('');
    const [end_date, set_end_date] = useState('');
    const [allFundsData, setAllFundData] = useState([]);
    const [tableData, setTableData] = useState([]);

    // console.log(allFundsData);

    // If investement kitty goes negative, an alert is thrown, everytime investment_kitty is changed
    useEffect(() => {
        if (investment_kitty < 0) {
            alert("Investment Kitty is running negative!");
        }
    }, [investment_kitty]);


    // Function doing all calculations for a fund after the "start" button click
    const TableDataCalc = async (fund) => {

        const current_fund_url = funds_urls[`${fund}`];
        const all_NAV_data = await fetch_NAV(current_fund_url);

        var month = 1;
        var cost = 0;
        var units = 0;
        var investment_value = 0;
        var avg_NAV = 0;
        var NAV_growth;
        var first_transaction_NAV;
        var transation_level_NAV_growth;
        var dates_of_active_investments = [];
        const number_of_funds = Object.keys(funds_urls).length
        const SIP_individual_fund = total_monthly_SIP_amt / number_of_funds;

        const newTableData = {
            fund: fund,
            data: []
        };

        for (
            let current_date = new Date(start_date);
            current_date <= new Date(end_date);
            current_date.setDate(current_date.getDate() + 1)
        ) {

            var invested = 0;
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
                SIP_individual_fund,
                cost,
                NAV_of_day,
                units,
                invested,
                dates_of_active_investments
            );

            month = current_date.getMonth();
            cost = month_investment_update[0];
            units = month_investment_update[1];
            invested = month_investment_update[2];
            dates_of_active_investments = month_investment_update[3];


            investment_value = (units * NAV_of_day).toFixed(4);
            avg_NAV = cost / units;
            NAV_growth = (((NAV_of_day - avg_NAV) / avg_NAV) * 100).toFixed(2);


            //If there is any left transaction to be redeemed then:
            if (dates_of_active_investments.length > 0) {
                first_transaction_NAV = all_NAV_data.find((obj) => obj.date === dates_of_active_investments[0]).nav;
                transation_level_NAV_growth = ((NAV_of_day - first_transaction_NAV) / first_transaction_NAV) * 100;

                // Call the redemption function to see the redeemed amount on current date if applicable o/w 0;
                const daily_redemption_update = redemption(
                    fund,
                    current_date,
                    Number(NAV_growth),
                    transation_level_NAV_growth,
                    redeemed_amt,
                    NAV_of_day,
                    dates_of_active_investments,
                    newTableData,
                    cost,
                    units
                )

                redeemed_amt = daily_redemption_update[0];
                dates_of_active_investments = daily_redemption_update[1];
                cost = daily_redemption_update[2];
                units = daily_redemption_update[3];
            }

            // Update Investment Kitty according to investment and redemption:
            set_investment_kitty(investment_kitty - invested + redeemed_amt);


            let newObj = {
                ddmmyyyy: ddmmyyyy,
                NAV_of_day: NAV_of_day,
                cost: cost,
                investment_value: investment_value,
                units: units,
                avg_NAV: avg_NAV,
                NAV_growth: NAV_growth,
                transation_level_NAV_growth: transation_level_NAV_growth,
                investment_kitty_contribution: (redeemed_amt - invested)
            }

            newTableData["data"].push(newObj);
        }

        console.log(newTableData);
        console.log(dates_of_active_investments);

        setAllFundData(oldArray => [...oldArray, newTableData]);
    }


    // Handler of the "start" button, calls function for table data calculation for each fund:
    const handleStart = () => {

        Object.keys(funds_urls).map((item) => {
            TableDataCalc(item);
        });

    }

    return (
        <div>
            <input type="number" name="investment_kitty" placeholder="Investment Kitty" onChange={(e) => set_investment_kitty(e.target.value)} />
            <input type="number" name="total_monthly_SIP_amt" onChange={(e) => set_total_monthly_SIP_amt(e.target.value)} placeholder="Total monthly SIP" />

            <label>Start Date</label>
            <input onChange={(e) => set_start_date(e.target.value)} name="start_date" type="date" />

            <label>End Date</label>
            <input onChange={(e) => set_end_date(e.target.value)} name="end_date" type="date" />

            <button onClick={handleStart} className="start">Start</button>

        </div>
    )
}