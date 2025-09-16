"use client";
import type { PostMethodArgs, MethodCallResponse, TransactionToSignResponse, Event } from "@curvegrid/multibaas-sdk";
import type { SendTransactionParameters } from "@wagmi/core";
import { Configuration, ContractsApi, EventsApi, ChainsApi }from "@curvegrid/multibaas-sdk";
import { useAccount } from "wagmi";
import { useCallback, useMemo } from "react";


interface ChainStatus {
  chainID: number;
  blockNumber: number;
}

export interface Question {
  question: string;
  createdBy: string;
  possibleAnswers: [string, string];
  image: string;
  voteCounts: [string, string]; // BigNumber as string
}

interface MultiBaasHook {
  getChainStatus: () => Promise<ChainStatus | null>;
  createQuestion: (question: string, answer1: string, answer2: string, image: string) => Promise<SendTransactionParameters>;
  vote: (questionId: number, answerIndex: number) => Promise<SendTransactionParameters>;
  clearVote: (questionId: number) => Promise<SendTransactionParameters>;
  getQuestion: (questionId: number) => Promise<Question | null>;
  getQuestionsCount: () => Promise<number | null>;
  hasVoted: (questionId: number, ethAddress: string) => Promise<boolean | null>;
  getUserVote: (questionId: number, ethAddress: string) => Promise<number | null>;
  getVotedEvents: () => Promise<Array<Event> | null>;
}

const useMultiBaas = (): MultiBaasHook => {
  const mbBaseUrl = process.env.NEXT_PUBLIC_MULTIBAAS_DEPLOYMENT_URL || "";
  const mbApiKey = process.env.NEXT_PUBLIC_MULTIBAAS_DAPP_USER_API_KEY || "";
  const votingContractLabel =
    process.env.NEXT_PUBLIC_MULTIBAAS_VOTING_CONTRACT_LABEL || "";
  const votingAddressAlias =
    process.env.NEXT_PUBLIC_MULTIBAAS_VOTING_ADDRESS_ALIAS || "";

  const chain = "ethereum";

  // Memoize mbConfig
  const mbConfig = useMemo(() => {
    return new Configuration({
      basePath: new URL("/api/v0", mbBaseUrl).toString(),
      accessToken: mbApiKey,
    });
  }, [mbBaseUrl, mbApiKey]);

  // Memoize Api
  const contractsApi = useMemo(() => new ContractsApi(mbConfig), [mbConfig]);
  const eventsApi = useMemo(() => new EventsApi(mbConfig), [mbConfig]);
  const chainsApi = useMemo(() => new ChainsApi(mbConfig), [mbConfig]);

  const { address, isConnected } = useAccount();

  const getChainStatus = async (): Promise<ChainStatus | null> => {
    try {
      const response = await chainsApi.getChainStatus(chain);
      return response.data.result as ChainStatus;
    } catch (err) {
      console.error("Error getting chain status:", err);
      return null;
    }
  };

  const callContractFunction = useCallback(
    async (methodName: string, args: PostMethodArgs['args'] = []): Promise<MethodCallResponse['output'] | TransactionToSignResponse['tx']> => {
      const payload: PostMethodArgs = {
        args,
        contractOverride: true,
        ...(isConnected && address ? { from: address } : {}),
      };

      const response = await contractsApi.callContractFunction(
        chain,
        votingAddressAlias,
        votingContractLabel,
        methodName,
        payload
      );

      const kind = (response.data.result as any)?.kind;
      if (kind === "MethodCallResponse") {
        return (response.data.result as any).output;
      } else if (kind === "TransactionToSignResponse") {
        return (response.data.result as any).tx;
      } else {
        throw new Error(`Unexpected response type: ${kind}`);
      }
    },
    [contractsApi, chain, votingAddressAlias, votingContractLabel, isConnected, address]
  );


  // New contract methods
  const createQuestion = useCallback(async (question: string, answer1: string, answer2: string, image: string): Promise<SendTransactionParameters> => {
    return await callContractFunction("createQuestion", [question, answer1, answer2, image]);
  }, [callContractFunction]);

  const vote = useCallback(async (questionId: number, answerIndex: number): Promise<SendTransactionParameters> => {
    return await callContractFunction("vote", [questionId, answerIndex]);
  }, [callContractFunction]);

  const clearVote = useCallback(async (questionId: number): Promise<SendTransactionParameters> => {
    return await callContractFunction("clearVote", [questionId]);
  }, [callContractFunction]);

  const getQuestion = useCallback(async (questionId: number): Promise<Question | null> => {
    try {
      const result = await callContractFunction("getQuestion", [questionId]);
      // result: [question, createdBy, possibleAnswers, image, voteCounts]
      return {
        question: result[0],
        createdBy: result[1],
        possibleAnswers: result[2],
        image: result[3],
        voteCounts: result[4],
      };
    } catch (err) {
      console.error("Error getting question:", err);
      return null;
    }
  }, [callContractFunction]);

  const getQuestionsCount = useCallback(async (): Promise<number | null> => {
    try {
      const result = await callContractFunction("getQuestionsCount");
      return Number(result);
    } catch (err) {
      console.error("Error getting questions count:", err);
      return null;
    }
  }, [callContractFunction]);

  const hasVoted = useCallback(async (questionId: number, ethAddress: string): Promise<boolean | null> => {
    try {
      const result = await callContractFunction("hasVoted", [questionId, ethAddress]);
      return result;
    } catch (err) {
      console.error("Error checking if user has voted:", err);
      return null;
    }
  }, [callContractFunction]);

  const getUserVote = useCallback(async (questionId: number, ethAddress: string): Promise<number | null> => {
    try {
      const result = await callContractFunction("votes", [questionId, ethAddress]);
      return Number(result);
    } catch (err) {
      console.error("Error getting user's vote:", err);
      return null;
    }
  }, [callContractFunction]);


  const getVotedEvents = useCallback(async (): Promise<Array<Event> | null> => {
    try {
      // Updated event signature: Voted(address,uint256,uint8)
      const eventSignature = "Voted(address,uint256,uint8)";
      const response = await eventsApi.listEvents(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        false,
        chain,
        votingAddressAlias,
        votingContractLabel,
        eventSignature,
        50
      );
      return response.data.result;
    } catch (err) {
      console.error("Error getting voted events:", err);
      return null;
    }
  }, [eventsApi, chain, votingAddressAlias, votingContractLabel]);

  return {
    getChainStatus,
    createQuestion,
    vote,
    clearVote,
    getQuestion,
    getQuestionsCount,
    hasVoted,
    getUserVote,
    getVotedEvents,
  };
};

export default useMultiBaas;
