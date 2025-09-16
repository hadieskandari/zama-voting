"use client";
import React, { useState } from "react";
import { Button, Box, Text, TextField } from "@radix-ui/themes";
import useMultiBaas from "../hooks/useMultiBaas";
import { useAccount } from "wagmi";

const CreateQuestion: React.FC = () => {
  const { createQuestion } = useMultiBaas();
  const { isConnected } = useAccount();
  const [question, setQuestion] = useState("");
  const [answer1, setAnswer1] = useState("");
  const [answer2, setAnswer2] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

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
      await createQuestion(question, answer1, answer2, image);
      setSuccess("Question created successfully!");
      setQuestion("");
      setAnswer1("");
      setAnswer2("");
      setImage("");
    } catch (err: any) {
      setError(err.message || "Failed to create question.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth="500px" mx="auto" my="6">
      <form onSubmit={handleSubmit}>
        <Text as="label" size="3">Question</Text>
        <TextField.Root
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Enter your question"
          className="mb-3 w-full"
        />
        <Text as="label" size="3">Answer 1</Text>
        <TextField.Root
          value={answer1}
          onChange={e => setAnswer1(e.target.value)}
          placeholder="First answer option"
          className="mb-3 w-full"
        />
        <Text as="label" size="3">Answer 2</Text>
        <TextField.Root
          value={answer2}
          onChange={e => setAnswer2(e.target.value)}
          placeholder="Second answer option"
          className="mb-3 w-full"
        />
        <Text as="label" size="3">Image URL (optional)</Text>
        <TextField.Root
          value={image}
          onChange={e => setImage(e.target.value)}
          placeholder="Image URL or IPFS hash"
          className="mb-3 w-full"
        />
        {error && <Text color="red" className="mb-2">{error}</Text>}
        {success && <Text color="green" className="mb-2">{success}</Text>}
        <Button type="submit" size="3" color="indigo" disabled={loading} className="w-full mt-2">
          {loading ? "Creating..." : "Create Question"}
        </Button>
      </form>
    </Box>
  );
};

export default CreateQuestion;
