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

interface VotingProps {
  setTxReceipt: (receipt: UseWaitForTransactionReceiptReturnType['data']) => void;
  question: any;
  primary?: boolean
}

const Voting: React.FC<VotingProps> = ({ setTxReceipt, question, primary = false }) => {
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
  const [userHasVoted, setUserHasVoted] = useState<{ [questionId: number]: boolean }>({});
  const [txHash, setTxHash] = useState<`0x${string}`>();
  const { data: txReceipt, isLoading: isTxProcessing } = useWaitForTransactionReceipt({ hash: txHash });


  // Fetch user votes for all questions
  // const fetchUserVotes = useCallback(async () => {
  //   if (!isConnected || !address) return;
  //   const votes: { [questionId: number]: number | null } = {};
  //   const voted: { [questionId: number]: boolean } = {};
  //   for (const q of questions) {
  //     voted[q.id] = await hasVoted(q.id, address);
  //     votes[q.id] = voted[q.id] ? await getUserVote(q.id, address) : null;
  //   }
  //   setUserVotes(votes);
  //   setUserHasVoted(voted);
  // }, [isConnected, address, questions, hasVoted, getUserVote]);

  // useEffect(() => {
  //   fetchQuestions();
  // }, [txReceipt, fetchQuestions]);

  // useEffect(() => {
  //   fetchUserVotes();
  // }, [isConnected, address, questions, txReceipt, fetchUserVotes]);

  useEffect(() => {
    if (txReceipt) setTxReceipt(txReceipt);
  }, [txReceipt, setTxReceipt]);

  const handleVote = async (questionId: number, answerIndex: number) => {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }
    try {
      let tx;
      if (userHasVoted[questionId] && userVotes[questionId] === answerIndex) {
        tx = await clearVote(questionId);
      } else {
        tx = await vote(questionId, answerIndex);
      }
      const hash = await sendTransactionAsync(tx);
      setTxHash(hash);
    } catch (error) {
      console.error("Error sending transaction:", error);
    }
  };

  return (
    <Flex justify="center" className="my-10 px-4">
      {primary ?
        <Box maxWidth="650px" width="100%">

          <div className="card-bg p-6">

            <Flex gap="3" align="center" className="mb-4">
              <Text as="div" size="2"  align="center" weight="light">
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
                        <div>{question.createdBy.slice(0, 6)}...{question.createdBy.slice(-4)}</div>
                      </div>
                    </Text>
                    <div className="flex justify-around w-full mt-2 gap-5">
                      {!isConnected ? (
                        <div className="text-center w-full">
                          <Button onClick={() => openConnectModal?.()} className="w-full" size="3" color="indigo">Connect your wallet to vote</Button>
                        </div>
                      ) : (
                        <div className="spinner-parent flex gap-4 w-full">
                          {question.possibleAnswers.map((ans: string, idx: number) => (
                            <VoteButton
                              key={idx}
                              index={idx}
                              voteCount={parseInt(question.voteCounts[idx])}
                              isActive={userHasVoted[question.id] && userVotes[question.id] === idx}
                              isDisabled={isTxProcessing}
                              handleVote={() => handleVote(question.id, idx)}
                              label={ans}
                              color={!idx ? "from-stone-900 to-green-500 absolute inset-0 bg-gradient-to-r rounded-lg" : "from-rose-500 to-stone-900 absolute inset-0 bg-gradient-to-r rounded-lg"
                              }
                            />
                          ))}
                          {isTxProcessing && (
                            <div className="overlay">
                              <div className="spinner"></div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </Box>
                </Flex>
                <Flex>
                  {/* <Gauge
                  value={parseInt(question.voteCounts[1])}
                  min={0}
                  max={100}
                  scale={0.5}
                  label={question.possibleAnswers[1]}
                /> */}
                </Flex>
              </Flex>
            </Card>

          </div>
        </Box>
        :
        <Card variant="surface" key={question.id} className="mb-6">
          <Flex justify="between">
            <Flex gap="3" align="center">
              <Avatar size="7" src={question.image} radius="medium" fallback={question.question.slice(0, 2).toUpperCase()} />
              <Box>
                <Text as="div" size="5" weight="bold">{question.question}</Text>
                <Text as="div" size="2" color="gray">
                  <div className="flex gap-2 items-center">
                    <div>Created by: </div>
                    <Avatar size="1" src={`https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${question.createdBy}`} radius="medium" fallback="T" />
                    <div>{question.createdBy.slice(0, 6)}...{question.createdBy.slice(-4)}</div>
                  </div>
                </Text>
                <div className="flex justify-around w-full mt-2 gap-5">
                  {!isConnected ? (
                    <div className="text-center w-full">
                      <Button onClick={() => openConnectModal?.()} className="w-full" size="3" color="indigo">Connect your wallet to vote</Button>
                    </div>
                  ) : (
                    <div className="spinner-parent flex gap-4 w-full">
                      {question.possibleAnswers.map((ans: string, idx: number) => (
                        <VoteButton
                          key={idx}
                          index={idx}
                          voteCount={parseInt(question.voteCounts[idx])}
                          isActive={userHasVoted[question.id] && userVotes[question.id] === idx}
                          isDisabled={isTxProcessing}
                          handleVote={() => handleVote(question.id, idx)}
                          label={ans}
                          color={!idx ? "from-indigo-500 to-purple-500 absolute inset-0 bg-gradient-to-r rounded-lg" : "from-pink-500 to-red-500 absolute inset-0 bg-gradient-to-r rounded-lg"
                          }
                        />
                      ))}
                      {isTxProcessing && (
                        <div className="overlay">
                          <div className="spinner"></div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Box>
            </Flex>
            <Flex>
              {/* <Gauge
                  value={parseInt(question.voteCounts[1])}
                  min={0}
                  max={100}
                  scale={0.5}
                  label={question.possibleAnswers[1]}
                /> */}
            </Flex>
          </Flex>
          <div className="mt-4">
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Full name</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Group</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                <Table.Row>
                  <Table.RowHeaderCell>Danilo Sousa</Table.RowHeaderCell>
                  <Table.Cell>danilo@example.com</Table.Cell>
                  <Table.Cell>Developer</Table.Cell>
                </Table.Row>

                <Table.Row>
                  <Table.RowHeaderCell>Zahra Ambessa</Table.RowHeaderCell>
                  <Table.Cell>zahra@example.com</Table.Cell>
                  <Table.Cell>Admin</Table.Cell>
                </Table.Row>

                <Table.Row>
                  <Table.RowHeaderCell>Jasper Eriksson</Table.RowHeaderCell>
                  <Table.Cell>jasper@example.com</Table.Cell>
                  <Table.Cell>Developer</Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table.Root>
          </div>
        </Card>
      }
    </Flex>
  );
};

export default Voting;
