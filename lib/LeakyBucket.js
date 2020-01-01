module.exports = class LeakyBucket {
  constructor({ bucket_capacity = 10, drop_in_time = 1000, drop_out_time=60000, warn_if_blocked = false, warn_intervall = 1000 } = {}){
    this.bucket_capacity = bucket_capacity;
    this.drop_in_time = drop_in_time;
    this.drop_out_time = drop_out_time;
    this.warn_if_blocked = warn_if_blocked;
    this.warn_intervall = warn_intervall;

    this.drops_in_bucket = 0;
    this.last_drop = 0;
    this.last_warning = 0;
  }

  millis() { return Date.now(); }

  addDrop() {
    this.leakDrops(); // first, check if we can leak some drops and if so.. do leak

    const actual_millis = this.millis();
    if (actual_millis - this.last_drop < this.drop_in_time) return false;

    if (this.drops_in_bucket < this.bucket_capacity) { // check if we can add a new drop to the bucket
      this.drops_in_bucket++; // add a new drop
      this.last_drop = actual_millis; // update the timestamp of the latest drop
      return true; // new drop was added...return true
    };
      
    if (this.drops_in_bucket >= this.bucket_capacity) { // if bucket is full
      if (actual_millis - this.last_warning > this.warn_intervall && this.warn_if_blocked) {
        console.log('Events are blocked for', this.getBlockedTime(), 'seconds.');
        this.last_warning = actual_millis;
      }
      return false; // return false
    };
    
    return false; // return false if drop_in_time was fell below
  }

  leakDrops() {
    const actual_millis = this.millis(); // get actual milliseconds
    if (actual_millis - this.last_drop < this.drop_out_time) return; // dropout time reached? no -> return...

    var drops_to_leak = Math.round((actual_millis - this.last_drop) / this.drop_out_time); // calculate how many drops to leak
        
    if (drops_to_leak > 0) { // are there drops to leak?
      if (this.drops_in_bucket <= drops_to_leak) { // more drops to leak than in bucket?
        this.drops_in_bucket = 0; // set drops in bucket to 0
      } else { // drops to leak <= drops in bucket? leak drops_to_leak
        this.drops_in_bucket = this.drops_in_bucket - drops_to_leak; // 
      }
    };
  }  

  getDropsInBucket() { return this.drops_in_bucket; }
  getDropsRemaining() { return this.bucket_capacity - this.drops_in_bucket; }
  getBlockedTime() { return Math.round((this.drop_out_time-(this.millis()-this.last_drop)) / 1000); }

  getCapacity() { return this.bucket_capacity; }
}