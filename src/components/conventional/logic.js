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
    if (month != date.getMonth()) {
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

// function click_all_start_buttons(start_date, end_date) {
//     const allReturnedData = document.createElement('div');

//     const htmlFiles = [
//         `ConventionalMethod-nifty_jr.html`,
//         `ConventionalMethod-sensex.html`,
//         `ConventionalMethod-gold.html`,
//         `ConventionalMethod-international.html`
//     ]; // array of all the HTML files

//     htmlFiles.forEach(file => {
//         fetch(file)
//             .then(response => response.text())
//             .then(data => {

//                 const parser = new DOMParser();
//                 const dom = parser.parseFromString(data, 'text/html');

//                 // Find the date input tags
//                 const startDateInput = dom.querySelectorAll('input[name="start_date"]')[0];
//                 const endDateInput = dom.querySelectorAll('input[name="end_date"]')[0];

//                 // Setting the values of date input tags:
//                 startDateInput.value = start_date;
//                 endDateInput.value = end_date;

//                 const startButton = dom.querySelector('.start');
//                 startButton.click();


//                 // Wait for the table data to be loaded
//                 const tableDataPromise = new Promise(resolve => {
//                     const checkTableData = setInterval(() => {
//                         const table = dom.querySelector('#fund_table tbody');
//                         if (table && table.innerHTML !== '') {
//                             clearInterval(checkTableData);
//                             resolve(table.innerHTML);
//                         }
//                     }, 250);
//                 });

//                 // Once the table data is loaded, append it to the temporary element
//                 tableDataPromise.then(tableData => {
//                     allReturnedData.innerHTML += `<table>${tableData}</table>`;
//                     console.log(allReturnedData);
//                 });
//             })
//             .catch(error => {
//                 console.error(`Error fetching ${htmlFile}:`, error);
//             });
//     });



// }


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
