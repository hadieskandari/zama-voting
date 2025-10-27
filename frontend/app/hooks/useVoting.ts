import { useCallback } from 'react';
import { useContractWrite, useContractRead, useWalletClient, usePublicClient } from 'wagmi';
import { encodeAbiParameters, parseAbiParameter } from 'viem';

// Contract ABI imports
import SimpleVotingABI from '../../../blockchain/artifacts/contracts/SimpleVoting.sol/SimpleVoting.json';

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';

export interface Question {
  question: string;
  createdBy: string;
  possibleAnswers: [string, string];
  image: string;
  voteCounts: [string, string];
}

export function useVoting() {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const createQuestion = useContractWrite({
    address: contractAddress as `0x${string}`,
    abi: SimpleVotingABI.abi,
    functionName: 'createQuestion',
  });

  const vote = useContractWrite({
    address: contractAddress as `0x${string}`,
    abi: SimpleVotingABI.abi,
    functionName: 'vote',
  });

  const clearVote = useContractWrite({
    address: contractAddress as `0x${string}`,
    abi: SimpleVotingABI.abi,
    functionName: 'clearVote',
  });

  const { data: questionsCount, refetch: refetchQuestionsCount } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: SimpleVotingABI.abi,
    functionName: 'getQuestionsCount',
  });

  const getQuestion = useCallback(async (questionId: number): Promise<Question | null> => {
    try {
      const data = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: SimpleVotingABI.abi,
        functionName: 'getQuestion',
        args: [BigInt(questionId)],
      });
      
      if (!data) return null;
      
      const [question, createdBy, possibleAnswers, image, voteCounts] = data as any;
      return {
        question,
        createdBy,
        possibleAnswers,
        image,
        voteCounts: voteCounts.map((count: bigint) => count.toString()) as [string, string],
      };
    } catch (err) {
      console.error('Error getting question:', err);
      return null;
    }
  }, [publicClient]);

  const hasVoted = useCallback(async (questionId: number, address: string): Promise<boolean> => {
    try {
      const data = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: SimpleVotingABI.abi,
        functionName: 'hasVoted',
        args: [BigInt(questionId), address],
      });
      return !!data;
    } catch (err) {
      console.error('Error checking if has voted:', err);
      return false;
    }
  }, [publicClient]);

  const handleCreateQuestion = useCallback(async (
    question: string,
    answer1: string,
    answer2: string,
    image: string
  ) => {
    try {
      const { hash } = await createQuestion.writeAsync({
        args: [question, answer1, answer2, image],
      });
      return hash;
    } catch (err) {
      console.error('Error creating question:', err);
      throw err;
    }
  }, [createQuestion]);

  const handleVote = useCallback(async (questionId: number, answerIndex: number) => {
    try {
      const { hash } = await vote.writeAsync({
        args: [BigInt(questionId), BigInt(answerIndex)],
      });
      return hash;
    } catch (err) {
      console.error('Error voting:', err);
      throw err;
    }
  }, [vote]);

  const handleClearVote = useCallback(async (questionId: number) => {
    try {
      const { hash } = await clearVote.writeAsync({
        args: [BigInt(questionId)],
      });
      return hash;
    } catch (err) {
      console.error('Error clearing vote:', err);
      throw err;
    }
  }, [clearVote]);

  return {
    createQuestion: handleCreateQuestion,
    vote: handleVote,
    clearVote: handleClearVote,
    getQuestion,
    hasVoted,
    questionsCount: questionsCount ? Number(questionsCount) : 0,
    refetchQuestionsCount,
    isLoading: createQuestion.isLoading || vote.isLoading || clearVote.isLoading,
  };
}