class Ticker {
  constructor(reference) {
    if (!reference) {
      reference = $();
    }
    this.$object = reference;
  }
  post(msg) {
    this.$object.prepend($('<span>').text(msg));
    $('#ticker:last-child').remove();
  }
}

class Trader {
  constructor(args) {
    let privateProperties = {};
    args = args || {};
    privateProperties.name = args.name || "Joe Trader";
    // should there be code to check name is unique?
    privateProperties.cash = args.cash || 1000;
    this.get = (key) => privateProperties[key];
    this.set = (key, value) => {
      privateProperties[key] = value;
      sBind.update(this, key);
    }
  }

  get$() {
    return $('<div>')
        .addClass('instance trader')

        .append(
            $('<div>').text('Name: ').append(sBind.bindOutput(this, 'name')))
        .append(
            $('<div>').text('Cash: $').append(sBind.bindOutput(this, 'cash')));
  }
}

class Stock {
  constructor(args, callback) { // callback to run if/when stock fails
    let privateProperties =
        {}; // this are not attached to object, thus locally scoped
    args = args || {};
    privateProperties.ticker = args.ticker || new Ticker();
    privateProperties.trader = args.trader || new Trader('THE WOLF');
    privateProperties.name = args.name || "Blue Chip";
    privateProperties.value = args.value || 100;
    privateProperties.volatility = args.volatility || 5;
    privateProperties.owned = args.owned || 0;

    this.get = (key) => privateProperties[key];
    this.set = (key, value) => {
      privateProperties[key] = value;
      sBind.update(this, key);
    };

    // price changes
    privateProperties.interval = window.setInterval(function(context) {
      if (context.get('value') > 0 &&
          Math.random() * 10 + 1 < context.get('volatility')) {
        let sign = 1;     // positive or negative change?
        const delta = 10; // amount of change
        if (Math.random() > 0.515) {
          sign = -1;
        }
        let newValue = context.get('value') + delta * sign;
        if (newValue <= 0) {
          newValue = 0;
          window.clearInterval(context.get('interval'));
          callback(this);
        }
        context.set('value', newValue);
        context.get('ticker').post('Value of ' + context.get('name') +
                                   ' changed by $' + delta * sign);
      }
    }, 1500, this);
  }

  transaction(trader, count) {
    const cash = trader.get('cash'), cost = count * this.get('value'),
          owned = this.get('owned');
    // bounds checking
    if (count > 0 && cost > cash) {           // case purchase
      return false;                           // can't afford, purchase failed!
    } else if (count < 0 && owned < -count) { // case sale
      return false;           // not enough owned for sale, fail!
    } else if (count === 0) { // no count? no transaction silly!
      return false;
    }
    this.set('owned', owned + count);
    trader.set('cash', cash - cost);
    return count;
  }

  get$() {
    return $('<div>')
        .addClass('instance stock')
        .append($('<div>').text('Name: ').append(
            //            sBind.bind({reference : this, key : 'name'})))
            sBind.bindOutput(this, 'name')))
        .append(
            $('<div>').text('Value: $').append(sBind.bindOutput(this, 'value')))
        .append($('<div>')
                    .text('Volatility: ')
                    .append(sBind.bindOutput(this, 'volatility')))
        .append($('<div>')
                    .text('Shares owned: ')
                    .append(sBind.bindOutput(this, 'owned')))
        .append(sBind.bindInput(
            $('<button>').text('Buy!'), 'click',
            (e) => {
              if (e.data.stock.transaction(e.data.trader, e.data.count) ===
                  false) {
                console.log('purchase failed!');
              }
            },
            {stock : this, trader : this.get('trader'), count : 1}))
        .append(sBind.bindInput($('<button>').text('Sell!'), 'click', (e) => {
          if (e.data.stock.transaction(e.data.trader, e.data.count) === false) {
            console.log('Sale failed!');
          }
        }, {stock : this, trader : this.get('trader'), count : -1}));
  }
}

$(function() { // execute this code after DOM initializes
  let trader = new Trader(), ticker = new Ticker(), stocks = [], stockNames = [
    'Talking Blues Preservation Society',
    'Beanlamp',
    'Revisionist Online',
    'Blue Chip',
    'Sky Blue',
    'The Linux Foundation'
  ];
  trader.get$().appendTo('#viewport');

  let failCallback =
      stock => { console.log(stockNames); } // should we use stock?

  for (let i = 0; i < 6; i++) {
    let x = Math.floor(Math.random() * stockNames.length);
    stocks.push(new Stock({name : stockNames.splice(x, 1), trader : trader},
                          failCallback));
  }

  stocks.forEach(function(aStock) { aStock.get$().appendTo('#viewport'); });
});
