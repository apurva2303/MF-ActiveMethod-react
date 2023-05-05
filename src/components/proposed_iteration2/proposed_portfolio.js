import { useEffect, useState } from "react";
import {
    funds_urls,
    fund_investment_dates,
    fetch_NAV,
    date_to_ddmmyyyy,
    check_date_for_holiday,
    check_date_for_investment,
    portfolio_redemption as redemption,
    find_largest_array
} from "./logic.js";

export default function Proposed_2_portfolio() {

    const [investment_kitty, set_investment_kitty] = useState(0);
    const [total_monthly_SIP_amt, set_total_monthly_SIP_amt] = useState(0);
    const [start_date, set_start_date] = useState('');
    const [end_date, set_end_date] = useState('');
    const [allFundsData, setAllFundData] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [total_nav_growth_check, set_total_nav_growth_check] = useState(0);
    const [transactional_nav_growth_check, set_transactional_nav_growth_check] = useState(0);

    const debt_interest_rate = 0.05;

    // console.log(allFundsData);

    // If investment kitty goes negative, an alert is thrown, everytime investment_kitty is changed
    useEffect(() => {
        if (investment_kitty < 0) {
            alert("Investment Kitty is running negative!");
        }
    }, [investment_kitty]);


    useEffect(() => {

        if (allFundsData[0] !== undefined) {
            populate_table(allFundsData);
        }

        console.log("all funds data", allFundsData)

    }, [allFundsData]);

    useEffect(() => {
        console.log("tableData", tableData);
    }, [tableData])


    // Populates the combined table to be displayed on the portfolio page
    const populate_table = (allFundsData) => {

        const newArray = [];

        var largest_fund_data = find_largest_array(allFundsData);
        const ddmmyyyyValues = largest_fund_data.map(obj => obj.ddmmyyyy);

        var new_investment_kitty = investment_kitty;

        // Run a loop through date array, and for 1 date, check all of the funds for more data.
        ddmmyyyyValues.forEach(date => {

            let portfolio_cost = 0;
            let portfolio_value = 0;
            let portfolio_investment_kitty_contribution = 0;

            // Check for all the funds for the given date:
            allFundsData.forEach((fundObj) => {

                // Loop through the data array of each object to find the object with matching ddmmyyyy value
                const foundObject = fundObj.data.find(obj => obj.ddmmyyyy === date);

                if (foundObject) {

                    portfolio_cost += Number(foundObject.cost);
                    portfolio_value += Number(foundObject.investment_value);
                    portfolio_investment_kitty_contribution += foundObject.investment_kitty_contribution;

                }


            });

            new_investment_kitty = ((Number(new_investment_kitty) + Number(portfolio_investment_kitty_contribution))) * (1 + debt_interest_rate / 365);

            let newObj = {
                date: date,
                portfolio_cost: portfolio_cost,
                portfolio_value: portfolio_value,
                portfolio_investment_kitty_contribution: portfolio_investment_kitty_contribution,
                investment_kitty: new_investment_kitty,
                combined_value: new_investment_kitty + Number(portfolio_value)
            }

            newArray.push(newObj);
        });

        set_investment_kitty(new_investment_kitty);
        setTableData(newArray);
    }


    // Function doing all calculations for a fund after the "start" button click
    const TableDataCalc = async (fund) => {

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
            const month_investment_update = check_date_for_investment(
                fund,
                current_date,
                month,
                Number(SIP_individual_fund),
                Number(cost),
                Number(NAV_of_day),
                cum_units,
                invested_amt,
                dates_of_active_investments
            );

            cost = month_investment_update[0];
            cum_units = month_investment_update[1];
            invested_amt = month_investment_update[2];
            dates_of_active_investments = month_investment_update[3];
            units_bought = month_investment_update[4];

            if (Number(fund_investment_dates[fund]) <= current_date.getDate()) {
                month = current_date.getMonth();
            }


            investment_value = (cum_units * NAV_of_day).toFixed(4);
            avg_NAV = cost / cum_units;
            NAV_growth = (((NAV_of_day - avg_NAV) / avg_NAV) * 100).toFixed(2);


            //If there is any left transaction to be redeemed then:
            if (dates_of_active_investments.length > 0) {
                first_transaction_NAV = all_NAV_data.find((obj) => obj.date === dates_of_active_investments[0]).nav;
                transaction_level_NAV_growth = ((NAV_of_day - first_transaction_NAV) / first_transaction_NAV) * 100;

                // Call the redemption function to see the redeemed amount on current date if applicable o/w 0;
                const daily_redemption_update = redemption(
                    fund,
                    current_date,
                    Number(NAV_growth),
                    transaction_level_NAV_growth,
                    redeemed_amt,
                    NAV_of_day,
                    dates_of_active_investments,
                    newTableData,
                    cost,
                    cum_units,
                    total_nav_growth_check,
                    transactional_nav_growth_check
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

            newTableData["data"].push(newObj);
        }

        return newTableData;
    }


    // Handler of the "start" button, calls function for table data calculation for each fund:
    const handleStart = async (e) => {

        e.preventDefault();

        set_investment_kitty(e.target.investment_kitty.value);

        const promises = Object.keys(funds_urls).map(async (item) => {
            const newData = await TableDataCalc(item);
            return newData;
        });

        const full_data = await Promise.all(promises);

        setAllFundData(full_data);

    }


    // Displays the table Data on the table:
    const DisplayData = tableData?.map((item, index) => {
        return (
            <tr key={index}>
                <td>{item.date}</td>
                <td>{item.portfolio_cost}</td>
                <td>{item.portfolio_value}</td>
                <td>{item.portfolio_investment_kitty_contribution}</td>
                <td>{item.investment_kitty}</td>
                <td>{item.combined_value}</td>
            </tr>
        )
    });

    return (
        <div>

            <h1>Proposed Method (2nd Iteration) - Portfolio</h1>

            <p>Get the detailed table for:</p>
            <ul>
                {Object.keys(funds_urls).map((item, i) => (
                    <li key={i}><a href={`/proposed2/${item}`}>{item}</a></li>
                ))}
            </ul>

            <form onSubmit={handleStart}>

                <input type="number" name="investment_kitty" placeholder="Investment Kitty" onChange={(e) => set_investment_kitty(e.target.value)} />
                <input type="number" name="total_monthly_SIP_amt" onChange={(e) => set_total_monthly_SIP_amt(e.target.value)} placeholder="Total monthly SIP" />
                <input type="number" name="total_NAV_growth_check" onChange={(e) => set_total_nav_growth_check(e.target.value)} placeholder="Total NAV Growth Percent" />
                <input type="number" name="transactional_NAV_growth_check" onChange={(e) => set_transactional_nav_growth_check(e.target.value)} placeholder="Transactional NAV Growth Percent" />

                <label>Start Date</label>
                <input onChange={(e) => set_start_date(e.target.value)} name="start_date" type="date" />

                <label>End Date</label>
                <input onChange={(e) => set_end_date(e.target.value)} name="end_date" type="date" />

                <button type="submit" className="start">Start</button>
            </form>


            <table>
                <thead>
                    <tr>
                        <td>Date</td>
                        <td>Portfolio Cost</td>
                        <td>Portfolio Value</td>
                        <td>Kitty Contribution</td>
                        <td>Investment Kitty</td>
                        <td>Kitty + Value</td>
                    </tr>
                </thead>
                <tbody id="portfolio_tbody">
                    {
                        DisplayData
                    }
                </tbody>
            </table>

        </div>
    )
}