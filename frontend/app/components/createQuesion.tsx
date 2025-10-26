"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Button, Box, Text, TextField, Flex } from "@radix-ui/themes";
import useMultiBaas from "../hooks/useMultiBaas";
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import SpotlightCard from "./spotlightCard";


const CreateQuestion: React.FC = () => {
  const { createQuestion, getQuestion, getQuestionsCount, getUserQuestions } = useMultiBaas();
  const { isConnected, address } = useAccount();
  const [question, setQuestion] = useState("");
  type QuestionWithId = { id: number } & Partial<{
    question: string;
    createdBy: string;
    possibleAnswers: [string, string];
    image: string;
    voteCounts: [string, string];
  }>;
  const [q, setQ] = useState<QuestionWithId[]>([]);
  const [answer1, setAnswer1] = useState("");
  const [answer2, setAnswer2] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const { openConnectModal } = useConnectModal();
  const { sendTransactionAsync } = useSendTransaction();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const { data: txReceipt, isLoading: isTxProcessing } = useWaitForTransactionReceipt({ hash: txHash });

  const ctc = (id: number) => {
    const url = `${window.location.origin}/vote?questionId=${id}`;
    navigator.clipboard.writeText(url);
    alert("Question link copied to clipboard!");
  }

  const fetchUserQuestions = useCallback(async () => {
    try {
      const userQuestionsIds = await getUserQuestions(address || "");
      if (!userQuestionsIds || userQuestionsIds.length === 0) {
        setQ([]);
        return;
      }
      const userQuestions = [];
      for (const id of userQuestionsIds) {
        const ques = await getQuestion(id);
        userQuestions.push({ ...ques, id });
      }
      setQ(userQuestions);
    } catch (err) {
      setQ([]);
    }
  }, [getUserQuestions, getQuestion]);

  useEffect(() => {
    if (isConnected) {
      fetchUserQuestions();
    } else {
      setQ([]);
    }
  }, [isConnected, fetchUserQuestions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!isConnected) {
      setError("Connect your wallet to create a question.");
      return;
    }
    if (!question || !answer1 || !answer2) {
      setError("All fields except image are required.");
      return;
    }
    setLoading(true);
    try {
      const txParams = await createQuestion(question, answer1, answer2, image);

      // If the hook returned transaction parameters, send them via wagmi
      if (txParams && (txParams as any).to) {
        const hash = await sendTransactionAsync(txParams as any);
        setTxHash(hash);
        setSuccess("Transaction submitted — waiting for confirmation...");
      } else {
        // Some paths may return immediate success/output
        setSuccess("Question created successfully!");
        // fetch user's questions to update UI
        fetchUserQuestions();
      }
    } catch (err: any) {
      setError(err.message || "Failed to create question.");
    } finally {
      setLoading(false);
    }
  };

  // When transaction is confirmed, clear the form and refresh user's questions
  useEffect(() => {
    if (txReceipt) {
      setSuccess("Question confirmed on-chain.");
      setQuestion("");
      setAnswer1("");
      setAnswer2("");
      setImage("");
      fetchUserQuestions();
      setTxHash(undefined);
    }
  }, [txReceipt, fetchUserQuestions]);

  return (

    <div className="w-full px-16">
      {isConnected ? (
        <div>

          <Box maxWidth="500px" mx="auto" my="6">
            <SpotlightCard >
              <div className="mb-6 w-full">
              <Text size="4">Fill out the fields bellow to create your private voting card to share with anyone onchain.</Text>
              </div>
              < form onSubmit={handleSubmit} >
                <Text as="label" size="3">Question</Text>
                <TextField.Root size="3"
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  placeholder="Enter your question"
                  className="mb-3 w-full"
                />
                <Text as="label" size="3">Answer 1</Text>
                <TextField.Root size="3"
                  value={answer1}
                  onChange={e => setAnswer1(e.target.value)}
                  placeholder="First answer option"
                  className="mb-3 w-full"
                />
                <Text as="label" size="3">Answer 2</Text>
                <TextField.Root size="3"
                  value={answer2}
                  onChange={e => setAnswer2(e.target.value)}
                  placeholder="Second answer option"
                  className="mb-3 w-full"
                />
                <Text as="label" size="3">Image URL (optional)</Text>
                <TextField.Root size="3"
                  value={image}
                  onChange={e => setImage(e.target.value)}
                  placeholder="Image URL or IPFS hash"
                  className="mb-3 w-full"
                />
                <div className="mb-2">
                {error && <Text color="red" className="mb-2">{error}</Text>}
                {success && <Text color="green" className="mb-2">{success}</Text>}
                </div>
                <Button type="submit" size="4" color="yellow" disabled={loading} className="w-full mt-6">
                  {loading ? "Creating..." : "Create Question"}
                </Button>
              </form >
            </SpotlightCard>
          </Box>
          <div className="mt-10">
            {q.length === 0 ? (
              <Text as="div" size="3" color="gray">You have not created any questions yet.</Text>
            ) : (
              <div>
                <Text as="div" size="5" weight="bold" className="mb-4">Your Questions</Text>
                <Flex direction="row" gap="4" >
                  {q.map((quest: any) => (
                    <SpotlightCard key={quest.id} className="mb-4 w-1/2">
                      {quest.image && <img src={quest.image} alt="Question Image" className="mt-2 max-w-full h-auto mb-2" />}
                      <Text as="div" size="4" weight="bold" className="mb-2">{quest.question}</Text>
                      <Flex gap="5">
                        <Text as="div" size="3">{quest.possibleAnswers[0]}({quest.voteCounts[0]})</Text>
                        <Text as="div" size="3">{quest.possibleAnswers[1]}({quest.voteCounts[1]})</Text>
                      </Flex>
                      <Button onClick={()=>ctc(quest.id)} >Share</Button>
                    </SpotlightCard>
                  ))}
                </Flex>
              </div>
            )}
          </div>
        </div>
      ) : (

        <div className="text-center w-full  flex flex-col justify-center items-center">
            <Button onClick={() => openConnectModal?.()} className="w-full" size="3" color="lime">Connect your wallet to create question</Button>
        </div>

      )}
    </div>

  );
};

export default CreateQuestion;
