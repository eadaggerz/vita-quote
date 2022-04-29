let currencies_config;
let prices_quotes;
const elements_that_trigger_quote = document.querySelectorAll('.quote-event');
const elements_that_trigger_minimal_amount = document.querySelectorAll('.amount-event');
const dest_countries_select = document.getElementById('dest_countries_select');
const from_currency_select = document.getElementById('amount_selector');

window.addEventListener('load', (event) => {
  setCurrencies();

  startPricesQuotesInterval();
});

elements_that_trigger_quote.forEach((item) => {
  item.addEventListener('input', (event) => {
    calculateQuote();
  });
});

elements_that_trigger_minimal_amount.forEach((item) => {
  item.addEventListener('change', (event) => {
    setMinimalAmount();
  });
});

function setCurrencies() {
  const currencies_config_url = 'https://api.vitawallet.io/api/currencies_config';

  getData(currencies_config_url)
    .then(data => {
      currencies_config = data
      fillAmountCurrenciesSelect(data);
      fillDestCurrenciesSelect(data);
    });
}

function setPricesQuotes() {
  const prices_quote_url = 'https://api.vitawallet.io/api/prices_quote';

  getData(prices_quote_url)
    .then(data => {
      prices_quotes = data;
      setMinimalAmount();
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
    option_element.value = data.vita_currencies[element].label;

    text_element = document.createTextNode(data.vita_currencies[element].currency_name);

    option_element.appendChild(text_element);

    amount_currencies_select.appendChild(option_element);
  });
}

function fillDestCurrenciesSelect(data = {}) {
  const keys = Object.keys(data.countries);

  keys.forEach(element => {
    if (data.countries[element].iso_code === 'BTC') return;

    option_element = document.createElement('option');
    option_element.value = data.countries[element].iso_code;
    option_element.innerHTML = data.countries[element].currency_name;

    dest_countries_select.appendChild(option_element);
  });
}

function searchFlagUrl(currency_iso_code, countries) {
  let flag_url = '';

  keys = Object.keys(countries);

  keys.some( key => {
    flag_url = countries[key].flag;

    return (countries[key].iso_code === currency_iso_code);
  });

  return flag_url;
}

function calculateQuote() {
  const from_currency = from_currency_select.value
  const to_currency = dest_countries_select.value;
  const from_currency_value = document.getElementById('amount').value;
  const to_currency_input = document.getElementById('destinatario');

  if (from_currency_value === null) return;
  if (prices_quotes === undefined) return;

  const send_price = prices_quotes["fiat"][to_currency.toLowerCase()][`${from_currency.toLowerCase()}_sell`];

   quote = send_price * from_currency_value;
   to_currency_input.value = quote.toFixed(2);
}

function setMinimalAmount() {
  const from_currency = from_currency_select.value
  const to_currency = dest_countries_select.value;
  const minimal_amount_element = document.getElementById('minimal_amount');

  if (prices_quotes === undefined) return;

  const minimal_amount = prices_quotes["fiat"][to_currency.toLowerCase()][`${from_currency.toLowerCase()}_min`];

  minimal_amount_element.innerHTML = `${Number(minimal_amount).toFixed(2)} ${from_currency.toUpperCase()}`;
}