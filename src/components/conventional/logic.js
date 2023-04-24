// List of all funds in portfolio (URLs)
const funds_urls = {
    "idbi_nifty_jr_index_fund": "https://api.mfapi.in/mf/118348",
    "ICICI_prudential_US_blue_chip": "https://api.mfapi.in/mf/120186",
    "ICICI_prudential_technology_fund": "https://api.mfapi.in/mf/120594",
    "UTI_transportation_and_logistics_fund": "https://api.mfapi.in/mf/120730",
    "dsp_worldenergy": "https://api.mfapi.in/mf/119275",
    "aditya_birla_sunlife_gold_fund": "https://api.mfapi.in/mf/120546",
    "invesco_india_infrastructure_fund": "https://api.mfapi.in/mf/120405",
    "MIRAE_asset_great_consumer_fund": "https://api.mfapi.in/mf/118837",
    "dsp_world_agriculture": "https://api.mfapi.in/mf/119271",
    "SBI_magnum_global_fund": "https://api.mfapi.in/mf/119711",
    "TATA_SNP_BSE_sensex_index_fund": "https://api.mfapi.in/mf/119287",
    "DSP_world_mining": "https://api.mfapi.in/mf/119279",
    "DSP_natural_resources_and_new_energy_fund": "https://api.mfapi.in/mf/119028",
    "frankling_Asian_equity": "https://api.mfapi.in/mf/118559",
    "NIPPON_india_pharma_fund": "https://api.mfapi.in/mf/118759",
    "DSP_world_gold_fund_of_fund": "https://api.mfapi.in/mf/119277",
    "ICICI_prudential_banking_and_financial_services_fund": "https://api.mfapi.in/mf/120244",
    "Sundaram_global_brand": "https://api.mfapi.in/mf/119602",
    "INVESCO_india_PSU_equity_fund": "https://api.mfapi.in/mf/120395"
}
// SIP:
const SIP_amount = 125;

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
