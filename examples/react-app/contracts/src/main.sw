contract;

abi CounterContract {
  #[storage(read)]
  fn get_count() -> u64;

  #[storage(read, write)]
  fn increment_counter(amount: u64) -> u64;
}

storage {
  counter: u64 = 0,
}

impl CounterContract for Contract {
  #[storage(read)]
  fn get_count() -> u64 {
    storage.counter.try_read().unwrap_or(0)
  }

  #[storage(read, write)]
  fn increment_counter(amount: u64) -> u64 {
    let incremented = storage.counter.try_read().unwrap_or(0) + amount;
    storage.counter.write(incremented);
    incremented
  }
}
