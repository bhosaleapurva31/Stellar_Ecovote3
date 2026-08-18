#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, symbol_short};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Votes(u32),
    Total,
    Question,
    RewardContract,
    HasVoted(Address),
    Admin,
    Balance(Address),
}

#[contract]
pub struct VoterRewardContract;

#[contractimpl]
impl VoterRewardContract {
    pub fn init(env: Env, admin: Address) {
        env.storage().instance().set(&DataKey::Admin, &admin);
    }

    pub fn award_points(env: Env, caller: Address, voter: Address, points: u32) {
        caller.require_auth();
        
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        assert!(caller == admin, "Only admin contract can award points");

        let mut balance: u32 = env.storage().instance().get(&DataKey::Balance(voter.clone())).unwrap_or(0);
        balance += points;
        env.storage().instance().set(&DataKey::Balance(voter.clone()), &balance);
        env.events().publish((symbol_short!("awarded"), voter), balance);
    }

    pub fn get_points(env: Env, voter: Address) -> u32 {
        env.storage().instance().get(&DataKey::Balance(voter)).unwrap_or(0)
    }
}

#[contract]
pub struct PollContract;

#[contractimpl]
impl PollContract {
    pub fn init(env: Env, question: String, reward_contract: Address) {
        env.storage().instance().set(&DataKey::Question, &question);
        env.storage().instance().set(&DataKey::Total, &0u32);
        env.storage().instance().set(&DataKey::RewardContract, &reward_contract);
        env.storage().instance().set(&DataKey::Votes(0), &0u32);
        env.storage().instance().set(&DataKey::Votes(1), &0u32);
        env.storage().instance().set(&DataKey::Votes(2), &0u32);
        env.storage().instance().set(&DataKey::Votes(3), &0u32);
    }

    pub fn vote(env: Env, voter: Address, option: u32) -> u32 {
        voter.require_auth();
        assert!(option <= 3, "Invalid option");
        
        // Prevent double voting on-chain
        let already_voted = env.storage().instance().get(&DataKey::HasVoted(voter.clone())).unwrap_or(false);
        assert!(!already_voted, "Already voted");

        // Record vote
        let mut count: u32 = env.storage().instance().get(&DataKey::Votes(option)).unwrap_or(0);
        count += 1;
        env.storage().instance().set(&DataKey::Votes(option), &count);

        let mut total: u32 = env.storage().instance().get(&DataKey::Total).unwrap_or(0);
        total += 1;
        env.storage().instance().set(&DataKey::Total, &total);

        // Mark as voted
        env.storage().instance().set(&DataKey::HasVoted(voter.clone()), &true);

        // Inter-contract communication: Award 10 points
        let reward_contract: Address = env.storage().instance().get(&DataKey::RewardContract).unwrap();
        let reward_client = VoterRewardContractClient::new(&env, &reward_contract);
        reward_client.award_points(&env.current_contract_address(), &voter, 10);

        // Publish event
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

    pub fn has_voted(env: Env, voter: Address) -> bool {
        env.storage().instance().get(&DataKey::HasVoted(voter)).unwrap_or(false)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env, String};

    fn setup<'a>(env: &'a Env) -> (PollContractClient<'a>, VoterRewardContractClient<'a>, Address) {
        env.mock_all_auths();

        // 1. Register VoterReward contract
        let reward_contract_id = env.register_contract(None, VoterRewardContract);
        let reward_client = VoterRewardContractClient::new(env, &reward_contract_id);

        // 2. Register PollContract
        let poll_contract_id = env.register_contract(None, PollContract);
        let poll_client = PollContractClient::new(env, &poll_contract_id);

        // 3. Initialize both
        reward_client.init(&poll_contract_id);
        
        let q = String::from_str(env, "Which blockchain is best for payments?");
        poll_client.init(&q, &reward_contract_id);

        let voter = Address::generate(env);
        (poll_client, reward_client, voter)
    }

    #[test]
    fn test_init_zero_votes() {
        let env = Env::default();
        let (poll_client, reward_client, voter) = setup(&env);
        assert_eq!(poll_client.total_votes(), 0);
        assert_eq!(poll_client.get_votes(0), 0);
        assert_eq!(reward_client.get_points(&voter), 0);
        assert_eq!(poll_client.has_voted(&voter), false);
    }

    #[test]
    fn test_vote_increments_and_awards_points() {
        let env = Env::default();
        let (poll_client, reward_client, voter) = setup(&env);
        
        // Vote for option 0
        poll_client.vote(&voter, 0);
        
        assert_eq!(poll_client.get_votes(0), 1);
        assert_eq!(poll_client.total_votes(), 1);
        assert_eq!(poll_client.has_voted(&voter), true);
        
        // Verify cross-contract reward point assignment
        assert_eq!(reward_client.get_points(&voter), 10);
    }

    #[test]
    #[should_panic(expected = "Already voted")]
    fn test_double_voting_panics() {
        let env = Env::default();
        let (poll_client, _reward_client, voter) = setup(&env);
        
        poll_client.vote(&voter, 0);
        poll_client.vote(&voter, 0); // Should fail/panic with "Already voted"
    }

    #[test]
    #[should_panic(expected = "Only admin contract can award points")]
    fn test_reward_access_control() {
        let env = Env::default();
        env.mock_all_auths();
        
        let reward_contract_id = env.register_contract(None, VoterRewardContract);
        let reward_client = VoterRewardContractClient::new(&env, &reward_contract_id);
        
        let admin = Address::generate(&env);
        reward_client.init(&admin);
        
        let voter = Address::generate(&env);
        
        // Attempt to call award_points directly from non-admin account/contract
        let intruder = Address::generate(&env);
        reward_client.award_points(&intruder, &voter, 50); // Should fail/panic
    }

    #[test]
    fn test_get_question() {
        let env = Env::default();
        let (poll_client, _reward_client, _voter) = setup(&env);
        let q = poll_client.get_question();
        let expected = String::from_str(&env, "Which blockchain is best for payments?");
        assert_eq!(q, expected);
    }
}