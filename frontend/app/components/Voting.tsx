"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  useSendTransaction,
  useWaitForTransactionReceipt,
  UseWaitForTransactionReceiptReturnType,
} from "wagmi";
import useMultiBaas from "../hooks/useMultiBaas";
import VoteButton from "./VoteButton";
import { Avatar, Box, Button, Card, Flex, Table, Text } from "@radix-ui/themes";
import { CheckIcon, Cross1Icon } from "@radix-ui/react-icons";
import Gauge from "./gauge";
import CreateQuestion from "./createQuesion";

interface VotingProps {
  setTxReceipt: (receipt: UseWaitForTransactionReceiptReturnType['data']) => void;
  question: any;
  questitonId: number;
  primary?: boolean
}

const Voting: React.FC<VotingProps> = ({ setTxReceipt, question, primary = true }) => {

  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { sendTransactionAsync } = useSendTransaction();
  const {
    getQuestionsCount,
    getQuestion,
    vote,
    clearVote,
    hasVoted,
    getUserVote,
  } = useMultiBaas();


  const [userVotes, setUserVotes] = useState<{ [questionId: number]: number | null }>({});
  const [userHasVoted, setUserHasVoted] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<`0x${string}`>();
  const { data: txReceipt, isLoading: isTxProcessing } = useWaitForTransactionReceipt({ hash: txHash });


  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qp: { [key: string]: string } = {};
    params.forEach((value, key) => {
      qp[key] = value;
    });
    question.id = Number(qp.questionId);
    if (txReceipt) setTxReceipt(txReceipt);
    hasVoted(question.id, address || "").then((voted) => {
      console.log('vote:', voted);
      setUserHasVoted(Boolean(voted));
    });
    console.log(userHasVoted);
    console.log("question in voting component:", question);
  }, [txReceipt, setTxReceipt]);

  const handleVote = async (questionId: number, answerIndex: number) => {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }
    try {
      let tx;
      if (userHasVoted) {
        tx = await clearVote(questionId);
      } else {
        // Pass the vote as a euint8 - Zama's FHEVM will handle encryption
        tx = await vote(questionId, answerIndex.toString());
      }
      const hash = await sendTransactionAsync(tx);
      setTxHash(hash);
    } catch (error) {
      console.error("Error sending transaction:", error);
    }
  };

  const clearVoteHandle = async (questionId: number) => {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }
    try {
      const tx = await clearVote(questionId);
      const hash = await sendTransactionAsync(tx);
      setTxHash(hash);

    } catch (error) {
      console.error("Error sending transaction:", error);
    }
  }

  return (
    <Flex justify="center" className="my-10 px-4">
      {primary ?
        <Box maxWidth="650px" width="100%">

          <div className="card-bg p-6">

            <Flex gap="3" align="center" className="mb-4">
              <Text as="div" size="2" align="center" weight="light">
                We ask your opinion about $ZAMA. Your vote is confidential and cannot be linked back to you.
              </Text>
            </Flex>


            <Card variant="surface" key={question.id} className="mb-6">
              <Flex justify="between">
                <Flex gap="3" align="center" >
                  <Avatar size="7" src={question.image} radius="medium" fallback={question.question.slice(0, 2).toUpperCase()} />
                  <Box>
                    <Text as="div" size="5" weight="bold">{question.question}</Text>
                    <Text as="div" size="2" color="gray">
                      <div className="flex gap-2 items-center">
                        <div>Created by: </div>
                        <Avatar size="1" src={`https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${question.createdBy}`} radius="medium" fallback="T" />
                        <div>{question.createdBy?.slice(0, 6)}...{question.createdBy?.slice(-4)}</div>
                      </div>

                    </Text>
                    <div className="flex justify-around w-full mt-2 gap-5">
                      {!isConnected ? (
                        <div className="text-center w-full">
                          <Button onClick={() => openConnectModal?.()} className="w-full" size="3" color="indigo">Connect your wallet to vote</Button>
                        </div>
                      ) : (

                        !userHasVoted ?

                          <div className="spinner-parent flex gap-4 w-full">
                            {
                              question.possibleAnswers.map((ans: string, idx: number) => (
                                <VoteButton
                                  key={idx}
                                  index={idx}
                                  voteCount={parseInt(question.voteCounts[idx])}
                                  isActive={userHasVoted && userVotes[question.id] === idx}
                                  isDisabled={isTxProcessing}
                                  handleVote={() => handleVote(question.id, idx)}
                                  label={ans}
                                  color={!idx ? "from-stone-900 to-green-500 absolute inset-0 bg-gradient-to-r rounded-lg" : "from-rose-500 to-stone-900 absolute inset-0 bg-gradient-to-r rounded-lg"
                                  }
                                />
                              ))
                            }
                            {isTxProcessing && (
                              <div className="overlay">
                                <div className="spinner"></div>
                              </div>
                            )}
                          </div> :
                          <div className="text-center w-full py-4 font-medium">
                            <div>
                              <Button
                                onClick={() => clearVoteHandle(question.id)}
                                size="2"
                                variant="outline"
                                color="red"
                                className="mt-3"
                                disabled={isTxProcessing}
                              >
                                {isTxProcessing ? 'Processing...' : 'Clear Vote'}
                              </Button>
                            </div>
                          </div>
                      )
                      }
                    </div>
                  </Box>
                </Flex>
              </Flex>
            </Card>

          </div>
        </Box>
        :
        <div></div>
      }
    </Flex>
  );
};

export default Voting;
