"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Button, Box, Text, Flex, TextField } from "@radix-ui/themes";
import { useVoting } from "../hooks/useVoting";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import SpotlightCard from "./spotlightCard";

interface QuestionData {
  id: number;
  question?: string;
  createdBy?: string;
  possibleAnswers?: [string, string];
  image?: string;
  voteCounts?: [string, string];
}

const CreateQuestion: React.FC = () => {
  const { createQuestion, getQuestion, questionsCount, refetchQuestionsCount } = useVoting();
  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();

  const [question, setQuestion] = useState("");
  const [answer1, setAnswer1] = useState("");
  const [answer2, setAnswer2] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [userQuestions, setUserQuestions] = useState<QuestionData[]>([]);
  const [txHash, setTxHash] = useState<string | undefined>();

  const copyToClipboard = (id: number) => {
    const url = `${window.location.origin}/vote?questionId=${id}`;
    navigator.clipboard.writeText(url);
    setSuccess("Question link copied to clipboard!");
    setTimeout(() => setSuccess(""), 3000);
  };

  const fetchUserQuestions = useCallback(async () => {
    if (!address || typeof questionsCount !== 'number') return;
    
    try {
      const questions: QuestionData[] = [];
      for (let i = 0; i < questionsCount; i++) {
        const questionData = await getQuestion(i);
        if (questionData && questionData.createdBy.toLowerCase() === address.toLowerCase()) {
          questions.push({ ...questionData, id: i });
        }
      }
      setUserQuestions(questions);
    } catch (err) {
      console.error("Error fetching user questions:", err);
      setUserQuestions([]);
    }
  }, [address, questionsCount, getQuestion]);

  useEffect(() => {
    if (isConnected) {
      fetchUserQuestions();
    } else {
      setUserQuestions([]);
    }
  }, [isConnected, fetchUserQuestions]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isConnected) {
      openConnectModal?.();
      return;
    }

    if (!question || !answer1 || !answer2) {
      setError("Please fill in all required fields");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const hash = await createQuestion(question, answer1, answer2, image || '');
      setTxHash(hash);
      setSuccess("Question created successfully! Waiting for confirmation...");
      
      if (hash) {
        setSuccess("Question confirmed on-chain!");
        setQuestion("");
        setAnswer1("");
        setAnswer2("");
        setImage("");
        await refetchQuestionsCount();
        await fetchUserQuestions();
      }
    } catch (err) {
      console.error("Error creating question:", err);
      setError("Error creating question. Please try again.");
    } finally {
      setLoading(false);
      setTxHash(undefined);
    }
  };

  return (
    <div className="w-full px-4 md:px-16">
      {isConnected ? (
        <div>
          <Box maxWidth="500px" mx="auto" my="6">
            <SpotlightCard>
              <div className="mb-6 w-full">
                <Text size="4">Fill out the fields below to create your private voting card to share with anyone onchain.</Text>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <Text as="label" size="3" mb="2" weight="medium">Question</Text>
                    <TextField.Root
                      size="3"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Enter your question"
                      required
                    />
                  </div>

                  <div>
                    <Text as="label" size="3" mb="2" weight="medium">Answer 1</Text>
                    <TextField.Root
                      size="3"
                      value={answer1}
                      onChange={(e) => setAnswer1(e.target.value)}
                      placeholder="First answer option"
                      required
                    />
                  </div>

                  <div>
                    <Text as="label" size="3" mb="2" weight="medium">Answer 2</Text>
                    <TextField.Root
                      size="3"
                      value={answer2}
                      onChange={(e) => setAnswer2(e.target.value)}
                      placeholder="Second answer option"
                      required
                    />
                  </div>

                  <div>
                    <Text as="label" size="3" mb="2" weight="medium">Image URL (optional)</Text>
                    <TextField.Root
                      size="3"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="Image URL or IPFS hash"
                    />
                  </div>

                  <div className="mt-4">
                    {error && <Text color="red" className="mb-2">{error}</Text>}
                    {success && <Text color="green" className="mb-2">{success}</Text>}

                    <Button 
                      type="submit" 
                      size="3" 
                      color="yellow" 
                      disabled={loading} 
                      className="w-full mt-4"
                    >
                      {loading ? "Creating..." : "Create Question"}
                    </Button>
                  </div>
                </div>
              </form>
            </SpotlightCard>
          </Box>

          <div className="mt-10">
            {userQuestions.length === 0 ? (
              <Text as="div" size="3" color="gray" className="text-center">
                You have not created any questions yet.
              </Text>
            ) : (
              <div>
                <Text as="div" size="5" weight="bold" className="mb-4">
                  Your Questions
                </Text>
                <Flex direction="column" gap="4">
                  {userQuestions.map((quest) => (
                    <SpotlightCard key={quest.id} className="w-full">
                      <Flex direction="column" gap="3">
                        {quest.image && (
                          <img 
                            src={quest.image} 
                            alt="Question" 
                            className="w-full h-48 object-cover rounded-md"
                          />
                        )}
                        <Text as="div" size="4" weight="bold">
                          {quest.question}
                        </Text>
                        <Flex justify="between" gap="4">
                          <Flex gap="4">
                            <Text as="div" size="3">
                              {quest.possibleAnswers?.[0]} ({quest.voteCounts?.[0] || 0})
                            </Text>
                            <Text as="div" size="3">
                              {quest.possibleAnswers?.[1]} ({quest.voteCounts?.[1] || 0})
                            </Text>
                          </Flex>
                          <Button 
                            onClick={() => copyToClipboard(quest.id)}
                            size="2"
                            variant="soft"
                          >
                            Share
                          </Button>
                        </Flex>
                      </Flex>
                    </SpotlightCard>
                  ))}
                </Flex>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center min-h-[300px]">
          <Button 
            onClick={() => openConnectModal?.()} 
            size="3" 
            color="lime"
          >
            Connect your wallet to create question
          </Button>
        </div>
      )}
    </div>
  );
};

export default CreateQuestion;