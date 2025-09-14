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
import { Avatar, Box, Button, Card, Flex, Text } from "@radix-ui/themes";
import { CheckIcon, Cross1Icon } from "@radix-ui/react-icons";
import Gauge from "./gauge";

interface VotingProps {
  setTxReceipt: (receipt: UseWaitForTransactionReceiptReturnType['data']) => void;
}

const Voting: React.FC<VotingProps> = ({ setTxReceipt }) => {
  const { getVotes, castVote, clearVote, hasVoted, getUserVotes } = useMultiBaas();
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { sendTransactionAsync } = useSendTransaction();

  const [votesCount, setVotesCount] = useState<number[]>([]);
  const [currentVoteIndex, setCurrentVoteIndex] = useState<number | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}`>();

  const { data: txReceipt, isLoading: isTxProcessing } =
    useWaitForTransactionReceipt({ hash: txHash });

  // Wrap fetchVotes with useCallback
  const fetchVotes = useCallback(async () => {
    try {
      const votesArray = await getVotes();
      if (votesArray) {
        setVotesCount(votesArray.map((vote) => parseInt(vote)));
      }
    } catch (error) {
      console.error("Error fetching votes:", error);
    }
  }, [getVotes]);

  // Wrap checkUserVote with useCallback
  const checkUserVote = useCallback(async () => {
    if (address) {
      try {
        const hasVotedResult = await hasVoted(address);
        if (hasVotedResult) {
          const userVoteIndex = await getUserVotes(address);
          if (userVoteIndex !== null) {
            setCurrentVoteIndex(parseInt(userVoteIndex));
          } else {
            setCurrentVoteIndex(null);
          }
        } else {
          setCurrentVoteIndex(null);
        }
      } catch (error) {
        console.error("Error checking user vote:", error);
      }
    }
  }, [address, hasVoted, getUserVotes]);

  useEffect(() => {
    if (isConnected) {
      fetchVotes();
      checkUserVote();
    }
  }, [isConnected, txReceipt, fetchVotes, checkUserVote]);

  useEffect(() => {
    if (txReceipt) {
      setTxReceipt(txReceipt);
    }
  }, [txReceipt, setTxReceipt]);

  const handleVote = async (index: number) => {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }
    try {
      const tx =
        currentVoteIndex === index
          ? await clearVote()
          : await castVote(index.toString());
      const hash = await sendTransactionAsync(tx);
      setTxHash(hash);
    } catch (error) {
      console.error("Error sending transaction:", error);
    }
  };

  return (
    // <div className="container">
    //   <h1 className="title">Cast your vote</h1>
    //   {!isConnected ? (
    //     <div className="text-center">Please connect your wallet to vote</div>
    //   ) : (
    //     <div className="spinner-parent">
    //       {votesCount.map((voteCount, index) => (
    //         <VoteButton
    //           key={index}
    //           index={index}
    //           voteCount={voteCount}
    //           isActive={index === currentVoteIndex}
    //           isDisabled={isTxProcessing}
    //           handleVote={handleVote}
    //         />
    //       ))}
    //       {isTxProcessing && (
    //         <div className="overlay">
    //           <div className="spinner"></div>
    //         </div>
    //       )}
    //     </div>
    //   )}
    // </div>
    <Flex justify="center" className="my-10 px-4">
      <Box maxWidth="650px" width="100%" >
        <div className="card-bg p-6">
          <Flex gap="3" align="center" className="mb-4">
            <Text as="div" size="2" color="iris" align="center" weight="light">
              We ask your opinion about $APE with the first ApeCoin related opinion market. Is it APE season?! Agree or Disagree!
            </Text>

          </Flex>
          <Card variant="surface">
            <Flex justify="between">
              <Flex gap="3" align="center">
                <Avatar
                  size="7"
                  src="https://assets.rjassets.com/static/playlist/8257595/fd47301058cabdc-artwork.jpg"
                  radius="medium"
                  fallback="T"
                />
                <Box>
                  <Text as="div" size="5" weight="bold">
                    It's $APE season on Solana!
                  </Text>
                  <Text as="div" size="2" color="gray">
                    <div className="flex gap-2 items-center">
                      <div>Created by: </div>
                      <Avatar
                        size="1"
                        src="https://api.dicebear.com/9.x/notionists-neutral/svg?seed=Felix"
                        radius="medium"
                        fallback="T"
                      />
                      <div>0x7f3...c4d2</div>
                    </div>
                  </Text>
                  <div className="mt-5">
                    Total Market Cap: <b>$2,000,000,000</b>
                  </div>
                  <div className="flex justify-around  w-full mt-2 gap-5">
                    <Button color="violet" variant="outline" size="3" style={{ width: "80%" }}>
                      <CheckIcon />
                      Agree
                    </Button>
                    <Button color="crimson" variant="outline" size="3" style={{ width: "80%" }}>
                      <Cross1Icon />
                      Disagree
                    </Button>


                  </div>
                </Box>
              </Flex>
              <Flex>
                <Gauge
                  value={votesCount[currentVoteIndex ?? 0]}
                  min={0}
                  max={100}
                  scale={0.5}
                  label="Agree" />
              </Flex>
            </Flex>
          </Card>
        </div>
      </Box>
    </Flex >
  );
};

export default Voting;
