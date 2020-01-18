var Counter = require('../models/Counter');

var countController = {};

/*
If counter exists, return counter, otherwise create new counter with this id.
*/
getCounter = function(counterId, next) {
  Counter.findOne({
      _id: counterId
  }, function(err, counter) {
      if (err) { throw error; }
      if (counter) { next(counter); }
      if (!counter) {
        counter = new Counter({
          _id: counterId
        });
        counter.save(function(err) {
          if (err) {throw error; }
          next(counter);
        });
      }
    });
}

/*
Increment the counter by 1 and save in MongoDB.
*/
countController.incrementCounter = function(counterId, next) {
  getCounter(counterId, function(counter) {
    counter.count += 1;
    counter.save(function(err) {
      if (err) { console.log(err) };
      next(counter.count);
    });
  })
}


module.exports = countController;
