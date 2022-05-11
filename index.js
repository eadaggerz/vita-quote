let currencies_config;
let prices_quotes;
const elements_that_trigger_quote = document.querySelectorAll('.quote-event');
const elements_that_trigger_inverse_quote = document.querySelectorAll('.inverse-quote-event');
const elements_that_trigger_minimal_amount = document.querySelectorAll('.amount-event');
const dest_countries_select = document.getElementById('dest_countries_select');
const from_currency_select = document.getElementById('amount_selector');

window.addEventListener('load', (event) => {
  setCurrencies();

  startPricesQuotesInterval();

  $('.select2').select2({
    templateResult: addFlag,
    templateSelection: addFlag
  });
});

elements_that_trigger_quote.forEach((item) => {
  item.addEventListener('input', (event) => {
    calculateQuote();
  });
});

elements_that_trigger_inverse_quote.forEach((item) => {
  item.addEventListener('input', (event) => {
    calculateQuote(true);
  });
});

elements_that_trigger_minimal_amount.forEach((item) => {
  item.addEventListener('change', (event) => {
    setMinimalAmount();
    setArrivalDate();
    setExchangeRate();
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
      setArrivalDate();
      setExchangeRate();
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

function addFlag(opt) {
  if(!opt.id) {
    return opt.text;
  }

  var opt_image = $(opt.element).data('image');

  if(!opt_image) {
    return opt.text.toUpperCase();
  } else {
    var $opt = $(
      '<span><img src="' + opt_image + '"width="60px" />' + opt.text.toUpperCase() + '</span>'
    );
    return $opt
  }
}

function calculateQuote(inverse = false) {
  const from_currency = from_currency_select.value
  const to_currency = dest_countries_select.value;
  const from_currency_input = document.getElementById('amount');
  const from_currency_value = from_currency_input.value;
  const to_currency_input = document.getElementById('destinatario');
  const to_currency_value = to_currency_input.value;
  let quote;

  if (!inverse && from_currency_value === null) return;
  if (inverse && to_currency_value === null) return;
  if (prices_quotes === undefined) return;

  const send_price = prices_quotes["fiat"][to_currency.toLowerCase()][`${from_currency.toLowerCase()}_sell`];


  if ( inverse ) {
    quote = to_currency_value / send_price;

    from_currency_input.value = quote.toFixed(2);

    return;
  }

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

function setArrivalDate() {
  const to_currency = dest_countries_select.value;
  const arrival_date_element = document.getElementById('arrival_date');

  if (prices_quotes === undefined) return;

  const days = prices_quotes['days'][to_currency.toLowerCase()];

  let date = new Date();

  date.setDate(date.getDate() + days); // non-intituive method that adds days to current date

  arrival_date_element.innerHTML = `${'Fecha de llegada:</br>'+date.getMonth()} / ${date.getDate()}`;
}

function setExchangeRate() {
  const from_currency = from_currency_select.value;
  const to_currency = dest_countries_select.value;
  const exachange_rate_element = document.getElementById('exchange_rate');

  if (prices_quotes === undefined) return;

  const send_price = prices_quotes["fiat"][to_currency.toLowerCase()][`${from_currency.toLowerCase()}_sell`];

  exachange_rate_element.innerHTML = `${"Tasa de cambio:</br>"+send_price.toFixed(2)}`;
}