const LeakyBucket = require('./lib/LeakyBucket');
var leakyBucket = new LeakyBucket({warn_if_blocked : true}); 

while(true) {
  if (leakyBucket.addDrop() === true) {
    console.log(`Send event now...(${leakyBucket.getDropsRemaining()} drops remaining before events are blocked). Drops in bucket: ${leakyBucket.getDropsInBucket()}`);
  }
}