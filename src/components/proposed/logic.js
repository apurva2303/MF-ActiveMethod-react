// List of all funds in portfolio (URLs)
const funds_urls = {
    "nifty_jr": 'https://api.mfapi.in/mf/118348',
    "sensex": 'https://api.mfapi.in/mf/119287',
    "gold": 'https://api.mfapi.in/mf/116795',
    "international": 'https://api.mfapi.in/mf/120186',
}

// SIP:
const SIP_amount = 1000;

// Fetching the full NAV data:
async function fetch_NAV(url) {

    return fetch(url)
        .then(response => response.json())
        .then(response => response.data)
        .then(data => {
            return data;
        })
        .catch(error => console.error(error));

}

// Fetching the fund's Name
async function fetch_fund_name(url) {

    return fetch(url)
        .then(response => response.json())
        .then(response => response.meta)
        .then(data => data["scheme_name"])
        .then(data => {
            return data
        })
        .catch(error => console.error(error));

}

function date_to_ddmmyyyy(date) {

    var dd = date.getDate().toString().padStart(2, '0');
    var mm = (date.getMonth() + 1).toString().padStart(2, '0');
    var yyyy = date.getFullYear();

    var ddmmyyyy = `${dd}-${mm}-${yyyy}`;

    return ddmmyyyy;

}

// Functions definitions:
function check_date_for_holiday(date, all_NAV_data) {

    var ddmmyyyy = date_to_ddmmyyyy(date)

    var holiday_flag = false;

    if (all_NAV_data.find((obj) => obj.date === ddmmyyyy) === undefined) {
        holiday_flag = true;
    }

    return holiday_flag;

}

function check_first_date_of_month(date, month, SIP, cost, NAV, units, invested, dates_of_investment) {

    if (month !== date.getMonth()) {
        //Invest
        cost += SIP;
        units += SIP / NAV;
        invested = SIP;
        dates_of_investment.push(date_to_ddmmyyyy(date));
    }

    const result = [cost, units, invested, dates_of_investment]

    return result;
}

// Handle Change in Date Range:
function handle_date_range_change() {
    return {
        "start_date": new Date(document.querySelector('input[name="start_date"]').value),
        "end_date": new Date(document.querySelector('input[name="end_date"]').value)
    }
}


function redemption(
    fund,
    date,
    total_NAV_growth,
    transation_level_NAV_growth,
    redeemed_amt,
    NAV_of_day,
    dates_of_active_investments,
    fund_transaction_data,
    cost,
    units,
) {

    let first_date_of_investment = dates_of_active_investments[0];

    if (total_NAV_growth >= growth) {
        if (transation_level_NAV_growth >= growth) {

            //redeem the first investment:       

            let first_investment_obj = fund_transaction_data.data.find((obj) => obj.ddmmyyyy === first_date_of_investment);

            // Find the first units bought using fund_transaction_data
            let redeemed_units = first_investment_obj.units;
            redeemed_amt += redeemed_units * NAV_of_day;

            console.log("=========================");
            console.log("fund = ", fund);
            console.log("popped on = ", date_to_ddmmyyyy(date));
            console.log("Today's NAV = ", NAV_of_day);
            console.log("Investment of = ", dates_of_active_investments[0]);
            console.log("NAV growth = ", total_NAV_growth);
            console.log("Transactional NAV growth = ", transation_level_NAV_growth);
            console.log("=========================")


            // POP the last transaction from the dates array and fund_transaction_data
            dates_of_active_investments.shift();
            cost -= first_investment_obj.cost;
            units -= redeemed_units;

            let avg_NAV = cost / units;
            total_NAV_growth = (((NAV_of_day - avg_NAV) / avg_NAV) * 100);
            transation_level_NAV_growth = ((NAV_of_day - dates_of_active_investments[0]) / dates_of_active_investments[0]) * 100;

            // recursively calling redemption
            redemption(
                fund,
                date,
                total_NAV_growth,
                transation_level_NAV_growth,
                redeemed_amt,
                NAV_of_day,
                dates_of_active_investments,
                fund_transaction_data,
                cost,
                units
            );
        }
    }

    return [redeemed_amt, dates_of_active_investments, cost, units];
}

const growth = 10;


// Exporting all the functions and data
export {
    funds_urls,
    SIP_amount,
    fetch_NAV,
    fetch_fund_name,
    date_to_ddmmyyyy,
    check_date_for_holiday,
    check_first_date_of_month,
    handle_date_range_change,
    redemption
}
