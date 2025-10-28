import React, { useEffect, useState } from "react";
import Voting from "./Voting";
import { Box, Grid } from "@radix-ui/themes";
import { useVoting } from "../hooks/useVoting";

const VoteList: React.FC = () => {
  const { questionsCount, getQuestion } = useVoting();
  const [questions, setQuestions] = useState<Array<{ id: number }>>([]);

  useEffect(() => {
    if (questionsCount > 0) {
      setQuestions(Array.from({ length: questionsCount }, (_, i) => ({ id: i })));
    }
  }, [questionsCount]);

  return (
    <Grid columns="2" gap="4" width="auto">
      {questions.map((question) => (
        <Box key={question.id}>
          <Voting questionId={question.id} />
        </Box>
      ))}
    </Grid>
  );
};

export default VoteList;
