let currencies_config;
let prices_quotes;

window.addEventListener('load', (event) => {
  setCurrencies();

  startPricesQuotesInterval();
});

function setCurrencies() {
  const currencies_config_url = 'https://api.vitawallet.io/api/currencies_config';

  getData(currencies_config_url)
    .then(data => {
      fillAmountCurrenciesSelect(data);
      fillDestCurrenciesSelect(data);
    });
}

function setPricesQuotes() {
  const prices_quote_url = 'https://api.vitawallet.io/api/prices_quote';
  getData(prices_quote_url)
    .then(data => {
      prices_quotes = data;
    });
}

function startPricesQuotesInterval() {
  setPricesQuotes();
  setInterval(setPricesQuotes, 120000);
}

async function getData(url = '', data = {}) {
  const response = await fetch(url);

  return response.json();
}

function fillAmountCurrenciesSelect(data = {}) {
  const amount_currencies_select = document.getElementById('amount_selector');

  const keys = Object.keys(data.vita_currencies);

  keys.forEach(element => {
    if( element === 'btc') return;

    option_element = document.createElement('option');
    option_element.value = data.vita_currencies[element].label
    option_element.innerHTML = data.vita_currencies[element].currency_name

    amount_currencies_select.appendChild(option_element);
  });
}

function fillDestCurrenciesSelect(data = {}) {
  const dest_currencies_select = document.getElementById('dest_countries_select');

  const keys = Object.keys(data.countries);

  keys.forEach(element => {

    option_element = document.createElement('option');
    option_element.value = data.countries[element].label
    option_element.innerHTML = data.countries[element].currency_name

    dest_currencies_select.appendChild(option_element);
  });
}

