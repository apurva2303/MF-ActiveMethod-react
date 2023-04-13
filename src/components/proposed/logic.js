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

function check_first_date_of_month(date, month, SIP, cost, NAV, cum_units, invested_amt, dates_of_investment) {

    let units_bought = 0;

    if (month !== date.getMonth()) {
        //Invest
        cost += SIP;
        units_bought = SIP / NAV;
        cum_units += units_bought;
        invested_amt = SIP;
        dates_of_investment.push(date_to_ddmmyyyy(date));
    }

    const result = [cost, cum_units, invested_amt, dates_of_investment, units_bought]

    return result;
}

// Handle Change in Date Range:
function handle_date_range_change() {
    return {
        "start_date": new Date(document.querySelector('input[name="start_date"]').value),
        "end_date": new Date(document.querySelector('input[name="end_date"]').value)
    }
}


function portfolio_redemption(
    fund,
    date,
    total_NAV_growth,
    transaction_level_NAV_growth,
    redeemed_amt,
    NAV_of_day,
    dates_of_active_investments,
    fund_transaction_data,
    cost,
    cum_units,
) {

    if (total_NAV_growth >= total_NAV_growth_check) {

        while (transaction_level_NAV_growth >= transaction_NAV_growth_check) {
            console.log(dates_of_active_investments);

            // redeem the first investment:      

            let first_date_of_investment = dates_of_active_investments[0];

            let first_investment_obj = fund_transaction_data.data.find((obj) => obj.ddmmyyyy === first_date_of_investment);

            // Find the first units bought using fund_transaction_data
            let redeemed_units = first_investment_obj.units_bought;
            redeemed_amt += redeemed_units * NAV_of_day;

            console.log("=========================");
            console.log("fund = ", fund);
            console.log("popped on = ", date_to_ddmmyyyy(date));
            console.log("Today's NAV = ", NAV_of_day);
            console.log("Investment of = ", dates_of_active_investments[0]);
            console.log("NAV growth = ", total_NAV_growth);
            console.log("Transactional NAV growth = ", transaction_level_NAV_growth);
            console.log("=========================")


            // POP the last transaction from the dates array and fund_transaction_data
            dates_of_active_investments.shift();
            cost -= first_investment_obj.invested_amt;
            cum_units -= redeemed_units;

            if (dates_of_active_investments.length > 0) {
                let NAV_of_next_investment_date = fund_transaction_data.data.find((obj) => obj.ddmmyyyy === dates_of_active_investments[0]).NAV_of_day;
                transaction_level_NAV_growth = ((Number(NAV_of_day) - Number(NAV_of_next_investment_date)) / Number(NAV_of_next_investment_date)) * 100;
            }
            else {
                break;
            }
        }
    }

    return [redeemed_amt, dates_of_active_investments, cost, cum_units];
}


function fund_redemption(
    date,
    total_NAV_growth,
    transaction_level_NAV_growth,
    redeemed_amt,
    NAV_of_day,
    dates_of_active_investments,
    fund_transaction_data,
    cost,
    cum_units,
) {


    if (total_NAV_growth >= total_NAV_growth_check) {

        while (transaction_level_NAV_growth >= transaction_NAV_growth_check) {

            // redeem the first investment:      

            let first_date_of_investment = dates_of_active_investments[0];

            let first_investment_obj = fund_transaction_data.find((obj) => obj.ddmmyyyy === first_date_of_investment);

            // Find the first units bought using fund_transaction_data
            let redeemed_units = first_investment_obj.units_bought;
            redeemed_amt += redeemed_units * NAV_of_day;

            console.log("=========================");
            console.log("popped on = ", date_to_ddmmyyyy(date));
            console.log("Investment of = ", dates_of_active_investments[0]);
            console.log("Today's NAV = ", NAV_of_day);
            console.log('Redeemed Number of Units = ', redeemed_units);
            console.log("Redeemed Amount = ", redeemed_amt);
            console.log("Remaining Units = ", cum_units - redeemed_units);
            console.log("NAV growth = ", total_NAV_growth);
            console.log("Transactional NAV growth = ", transaction_level_NAV_growth);
            console.log("=========================");


            // POP the last transaction from the dates array and fund_transaction_data
            dates_of_active_investments.shift();
            cost -= first_investment_obj.invested_amt;
            cum_units -= redeemed_units;


            if (dates_of_active_investments.length > 0) {
                let NAV_of_next_investment_date = fund_transaction_data.find((obj) => obj.ddmmyyyy === dates_of_active_investments[0]).NAV_of_day;
                transaction_level_NAV_growth = ((Number(NAV_of_day) - Number(NAV_of_next_investment_date)) / Number(NAV_of_next_investment_date)) * 100;
            }
            else {
                break;
            }
        }
    }

    return [redeemed_amt, dates_of_active_investments, cost, cum_units];
}

const total_NAV_growth_check = 10;
const transaction_NAV_growth_check = 10;


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
    portfolio_redemption,
    fund_redemption,
    find_largest_array
}
