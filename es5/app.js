'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Ticker = function () {
  function Ticker(reference) {
    _classCallCheck(this, Ticker);

    if (!reference) {
      reference = $();
    }
    this.$object = reference;
  }

  _createClass(Ticker, [{
    key: 'post',
    value: function post(msg) {
      this.$object.prepend($('<span>').text(msg));
      $('#ticker:last-child').remove();
    }
  }]);

  return Ticker;
}();

var Trader = function () {
  function Trader(args) {
    var _this = this;

    _classCallCheck(this, Trader);

    var privateProperties = {};
    args = args || {};
    privateProperties.name = args.name || "Joe Trader";
    // should there be code to check name is unique?
    privateProperties.cash = args.cash || 1000;
    this.get = function (key) {
      return privateProperties[key];
    };
    this.set = function (key, value) {
      privateProperties[key] = value;
      sBind.update(_this, key);
    };
  }

  _createClass(Trader, [{
    key: 'get$',
    value: function get$() {
      return $('<div>').addClass('instance trader').append($('<div>').text('Name: ').append(sBind.bind({ reference: this, key: 'name' }))).append($('<div>').text('Cash: $').append(sBind.bind({ reference: this, key: 'cash' })));
    }
  }]);

  return Trader;
}();

var Stock = function () {
  function Stock(args, callback) {
    var _this2 = this;

    _classCallCheck(this, Stock);

    // callback to run if/when stock fails
    var privateProperties = {}; // this are not attached to object, thus locally scoped
    args = args || {};
    privateProperties.ticker = args.ticker || new Ticker();
    privateProperties.trader = args.trader || new Trader('THE WOLF');
    privateProperties.name = args.name || "Blue Chip";
    privateProperties.value = args.value || 100;
    privateProperties.volatility = args.volatility || 5;
    privateProperties.owned = args.owned || 0;

    this.get = function (key) {
      return privateProperties[key];
    };
    this.set = function (key, value) {
      privateProperties[key] = value;
      sBind.update(_this2, key);
    };

    // price changes
    privateProperties.interval = window.setInterval(function (context) {
      if (context.get('value') > 0 && Math.random() * 10 + 1 < context.get('volatility')) {
        var sign = 1; // positive or negative change?
        var delta = 10; // amount of change
        if (Math.random() > 0.515) {
          sign = -1;
        }
        var newValue = context.get('value') + delta * sign;
        if (newValue <= 0) {
          newValue = 0;
          window.clearInterval(context.get('interval'));
          callback(this);
        }
        context.set('value', newValue);
        context.get('ticker').post('Value of ' + context.get('name') + ' changed by $' + delta * sign);
      }
    }, 1500, this);
  }

  _createClass(Stock, [{
    key: 'transaction',
    value: function transaction(trader, count) {
      var cash = trader.get('cash'),
          cost = count * this.get('value'),
          owned = this.get('owned');
      // bounds checking
      if (count > 0 && cost > cash) {
        // case purchase
        return false; // can't afford, purchase failed!
      } else if (count < 0 && owned < -count) {
          // case sale
          return false; // not enough owned for sale, fail!
        } else if (count === 0) {
            // no count? no transaction silly!
            return false;
          }
      this.set('owned', owned + count);
      trader.set('cash', cash - cost);
      return count;
    }
  }, {
    key: 'get$',
    value: function get$() {
      return $('<div>').addClass('instance stock').append($('<div>').text('Name: ').append(sBind.bind({ reference: this, key: 'name' }))).append($('<div>').text('Value: $').append(sBind.bind({ reference: this, key: 'value' }))).append($('<div>').text('Volatility: ').append(sBind.bind({ reference: this, key: 'volatility' }))).append($('<div>').text('Shares owned: ').append(sBind.bind({ reference: this, key: 'owned' }))).append($('<button>').text('Buy!').click({ stock: this, trader: this.get('trader'), count: 1 }, function (e) {
        if (e.data.stock.transaction(e.data.trader, e.data.count) === false) {
          // check if purchase failed
          console.log('Purchase failed!');
        }
      })).append(sBind.bind({
        type: 'input',
        eventData: { stock: this, trader: this.get('trader'), count: -1 },
        reference: this,
        $object: $('<button>').text('Sell!'),
        typeOfEvent: 'click',
        callback: function callback(e) {
          if (e.data.stock.transaction(e.data.trader, e.data.count) === false) {
            console.log('Sale failed!');
          }
        }
      }));
    }
  }]);

  return Stock;
}();

$(function () {
  // execute this code after DOM initializes
  var trader = new Trader(),
      ticker = new Ticker(),
      stocks = [],
      stockNames = ['Talking Blues Preservation Society', 'Beanlamp', 'Revisionist Online', 'Blue Chip', 'Sky Blue', 'The Linux Foundation'];
  trader.get$().appendTo('#viewport');

  var failCallback = function failCallback(stock) {
    console.log(stockNames);
  }; // should we use stock?

  for (var i = 0; i < 6; i++) {
    var x = Math.floor(Math.random() * stockNames.length);
    stocks.push(new Stock({ name: stockNames.splice(x, 1), trader: trader }, failCallback));
  }

  stocks.forEach(function (aStock) {
    aStock.get$().appendTo('#viewport');
  });
});