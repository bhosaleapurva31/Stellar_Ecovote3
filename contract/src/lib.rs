#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, symbol_short};

#[contracttype]
pub enum DataKey {
    Votes(u32),
    Total,
    Question,
}

#[contract]
pub struct PollContract;

#[contractimpl]
impl PollContract {
    pub fn init(env: Env, question: String) {
        env.storage().instance().set(&DataKey::Question, &question);
        env.storage().instance().set(&DataKey::Total, &0u32);
        env.storage().instance().set(&DataKey::Votes(0), &0u32);
        env.storage().instance().set(&DataKey::Votes(1), &0u32);
        env.storage().instance().set(&DataKey::Votes(2), &0u32);
        env.storage().instance().set(&DataKey::Votes(3), &0u32);
    }

    pub fn vote(env: Env, voter: Address, option: u32) -> u32 {
        voter.require_auth();
        assert!(option <= 3, "Invalid option");
        let mut count: u32 = env.storage().instance()
            .get(&DataKey::Votes(option)).unwrap_or(0);
        count += 1;
        env.storage().instance().set(&DataKey::Votes(option), &count);
        let mut total: u32 = env.storage().instance()
            .get(&DataKey::Total).unwrap_or(0);
        total += 1;
        env.storage().instance().set(&DataKey::Total, &total);
        env.events().publish((symbol_short!("voted"), option), count);
        count
    }

    pub fn get_votes(env: Env, option: u32) -> u32 {
        env.storage().instance().get(&DataKey::Votes(option)).unwrap_or(0)
    }

    pub fn total_votes(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::Total).unwrap_or(0)
    }

    pub fn get_question(env: Env) -> String {
        env.storage().instance().get(&DataKey::Question).unwrap()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env, String};

    fn setup() -> (Env, PollContractClient<'static>, Address) {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, PollContract);
        let client = PollContractClient::new(&env, &contract_id);
        let q = String::from_str(&env, "Which blockchain is best for payments?");
        client.init(&q);
        let voter = Address::generate(&env);
        (env, client, voter)
    }

    #[test]
    fn test_init_zero_votes() {
        let (_env, client, _voter) = setup();
        assert_eq!(client.total_votes(), 0);
        assert_eq!(client.get_votes(&0), 0);
        assert_eq!(client.get_votes(&1), 0);
        assert_eq!(client.get_votes(&2), 0);
        assert_eq!(client.get_votes(&3), 0);
    }

    #[test]
    fn test_vote_increments() {
        let (_env, client, voter) = setup();
        client.vote(&voter, &0);
        client.vote(&voter, &0);
        client.vote(&voter, &1);
        assert_eq!(client.get_votes(&0), 2);
        assert_eq!(client.get_votes(&1), 1);
        assert_eq!(client.get_votes(&2), 0);
    }

    #[test]
    fn test_total_votes_correct() {
        let (_env, client, voter) = setup();
        client.vote(&voter, &0);
        client.vote(&voter, &1);
        client.vote(&voter, &2);
        client.vote(&voter, &3);
        assert_eq!(client.total_votes(), 4);
    }

    #[test]
    fn test_multiple_votes_same_option() {
        let (_env, client, voter) = setup();
        client.vote(&voter, &2);
        client.vote(&voter, &2);
        client.vote(&voter, &2);
        assert_eq!(client.get_votes(&2), 3);
        assert_eq!(client.total_votes(), 3);
    }

    #[test]
    fn test_get_question() {
        let (env, client, _voter) = setup();
        let q = client.get_question();
        let expected = String::from_str(&env, "Which blockchain is best for payments?");
        assert_eq!(q, expected);
    }
}