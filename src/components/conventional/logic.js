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

function check_first_date_of_month(date, month, SIP, cost, NAV, units) {
    
    if (month !== date.getMonth()) {
        //Invest
        cost += SIP;
        units += SIP / NAV;
    }

    const result = [cost, units]

    return result;
}

// Handle Change in Date Range:
function handle_date_range_change() {
    return {
        "start_date": new Date(document.querySelector('input[name="start_date"]').value),
        "end_date": new Date(document.querySelector('input[name="end_date"]').value)
    }
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
    // click_all_start_buttons
}
