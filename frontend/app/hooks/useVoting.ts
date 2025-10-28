import { useCallback } from 'react';
import { useContractWrite, useContractRead, usePublicClient, useWalletClient } from 'wagmi';
import { waitForTransactionReceipt } from 'viem/actions';

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
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  // Wagmi's hook return shapes can differ between versions (write, writeAsync, send, etc.).
  // Cast to any and adapt to the available API to avoid brittle type errors.
  const createQuestionRaw = useContractWrite({
    abi: SimpleVotingABI.abi,
    address: contractAddress as `0x${string}`,
    functionName: 'createQuestion',
  } as any) as any;
  const voteRaw = useContractWrite({
    abi: SimpleVotingABI.abi,
    address: contractAddress as `0x${string}`,
    functionName: 'vote',
  } as any) as any;
  const clearVoteRaw = useContractWrite({
    abi: SimpleVotingABI.abi,
    address: contractAddress as `0x${string}`,
    functionName: 'clearVote',
  } as any) as any;

  // Adapter: pick the available write function and memoize so callbacks can depend on them
  const createQuestion = useCallback((params: any) => {
    const fn = createQuestionRaw.write ?? createQuestionRaw.writeAsync ?? createQuestionRaw.send ?? createQuestionRaw.execute;
    if (fn) return fn(params);
    // fallback: use walletClient.writeContract if available
    if (walletClient && typeof walletClient.writeContract === 'function') {
      const args = params?.args ?? [];
      return (walletClient as any).writeContract({
        address: contractAddress as `0x${string}`,
        abi: SimpleVotingABI.abi,
        functionName: 'createQuestion',
        args,
      });
    }
    throw new Error('No write function available for createQuestion');
  }, [createQuestionRaw, walletClient]);

  const vote = useCallback((params: any) => {
    const fn = voteRaw.write ?? voteRaw.writeAsync ?? voteRaw.send ?? voteRaw.execute;
    if (fn) return fn(params);
    if (walletClient && typeof walletClient.writeContract === 'function') {
      const args = params?.args ?? [];
      return (walletClient as any).writeContract({
        address: contractAddress as `0x${string}`,
        abi: SimpleVotingABI.abi,
        functionName: 'vote',
        args,
      });
    }
    throw new Error('No write function available for vote');
  }, [voteRaw, walletClient]);

  const clearVote = useCallback((params: any) => {
    const fn = clearVoteRaw.write ?? clearVoteRaw.writeAsync ?? clearVoteRaw.send ?? clearVoteRaw.execute;
    if (fn) return fn(params);
    if (walletClient && typeof walletClient.writeContract === 'function') {
      const args = params?.args ?? [];
      return (walletClient as any).writeContract({
        address: contractAddress as `0x${string}`,
        abi: SimpleVotingABI.abi,
        functionName: 'clearVote',
        args,
      });
    }
    throw new Error('No write function available for clearVote');
  }, [clearVoteRaw, walletClient]);

  const isCreatePending = createQuestionRaw.isPending ?? createQuestionRaw.isLoading ?? false;
  const isVotePending = voteRaw.isPending ?? voteRaw.isLoading ?? false;
  const isClearVotePending = clearVoteRaw.isPending ?? clearVoteRaw.isLoading ?? false;

  const { data: questionsCount, refetch: refetchQuestionsCount } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: SimpleVotingABI.abi,
    functionName: 'getQuestionsCount',
  });

  const getQuestion = useCallback(async (questionId: number): Promise<Question | null> => {
    if (!publicClient) return null;
    
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
    if (!publicClient) return false;
    
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
      if (!contractAddress) {
        throw new Error('Contract address not configured');
      }
      const result = await createQuestion({ args: [question, answer1, answer2, image] });

      // extract possible hash from the returned result (support multiple shapes)
      let hash: string | undefined;
      if (!result) throw new Error('Failed to create question - no transaction result');
      if (typeof result === 'string') {
        hash = result;
      } else if (typeof result === 'object') {
        // common shapes: { hash }, { transactionHash }, { wait: fn } (ethers)
        // @ts-ignore
        if (typeof result.hash === 'string') hash = result.hash;
        // @ts-ignore
        if (!hash && typeof result.transactionHash === 'string') hash = result.transactionHash;
        // ethers-style: wait() returns a receipt
        // @ts-ignore
        if (!hash && typeof result.wait === 'function') {
          // wait for the transaction to be mined and use the receipt's transactionHash
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const receipt = await result.wait();
          // @ts-ignore
          if (receipt && typeof receipt.transactionHash === 'string') hash = receipt.transactionHash;
        }
      }

      if (!hash) throw new Error('Failed to create question - unable to obtain transaction hash');

  // Wait for transaction to be confirmed (viem helper expects client + params)
  if (!publicClient) throw new Error('Public client not available');
  const receipt = await waitForTransactionReceipt(publicClient, { hash: hash as `0x${string}` });

      if (receipt?.status === 'success') {
        return hash;
      }
      throw new Error('Transaction failed');
    } catch (err) {
      console.error('Error creating question:', err);
      if (err instanceof Error) {
        throw new Error(`Failed to create question: ${err.message}`);
      }
      throw err;
    }
  }, [createQuestion, publicClient]);

  const handleVote = useCallback(async (questionId: number, answerIndex: number) => {
    try {
      const result = await vote({ args: [BigInt(questionId), answerIndex] });

      let hash: string | undefined;
      if (!result) throw new Error('Failed to vote - no transaction result');
      if (typeof result === 'string') hash = result;
      else if (typeof result === 'object') {
        // @ts-ignore
        if (typeof result.hash === 'string') hash = result.hash;
        // @ts-ignore
        if (!hash && typeof result.transactionHash === 'string') hash = result.transactionHash;
        // @ts-ignore
        if (!hash && typeof result.wait === 'function') {
          // @ts-ignore
          const receipt = await result.wait();
          // @ts-ignore
          if (receipt && typeof receipt.transactionHash === 'string') hash = receipt.transactionHash;
        }
      }

      if (!hash) throw new Error('Failed to vote - unable to obtain transaction hash');

  if (!publicClient) throw new Error('Public client not available');
  const receipt = await waitForTransactionReceipt(publicClient, { hash: hash as `0x${string}` });

      if (receipt?.status === 'success') return hash;
      throw new Error('Vote transaction failed');
    } catch (err) {
      console.error('Error voting:', err);
      throw err;
    }
  }, [vote, publicClient]);

  const handleClearVote = useCallback(async (questionId: number) => {
    try {
      const result = await clearVote({ args: [BigInt(questionId)] });

      let hash: string | undefined;
      if (!result) throw new Error('Failed to clear vote - no transaction result');
      if (typeof result === 'string') hash = result;
      else if (typeof result === 'object') {
        // @ts-ignore
        if (typeof result.hash === 'string') hash = result.hash;
        // @ts-ignore
        if (!hash && typeof result.transactionHash === 'string') hash = result.transactionHash;
        // @ts-ignore
        if (!hash && typeof result.wait === 'function') {
          // @ts-ignore
          const receipt = await result.wait();
          // @ts-ignore
          if (receipt && typeof receipt.transactionHash === 'string') hash = receipt.transactionHash;
        }
      }

      if (!hash) throw new Error('Failed to clear vote - unable to obtain transaction hash');

  if (!publicClient) throw new Error('Public client not available');
  const receipt = await waitForTransactionReceipt(publicClient, { hash: hash as `0x${string}` });

      if (receipt?.status === 'success') return hash;
      throw new Error('Clear vote transaction failed');
    } catch (err) {
      console.error('Error clearing vote:', err);
      throw err;
    }
  }, [clearVote, publicClient]);

  return {
    createQuestion: handleCreateQuestion,
    vote: handleVote,
    clearVote: handleClearVote,
    getQuestion,
    hasVoted,
    questionsCount,
    refetchQuestionsCount,
    isLoading: isCreatePending || isVotePending || isClearVotePending,
  };
}