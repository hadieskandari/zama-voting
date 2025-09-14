import React from "react";
import Voting from "./Voting";
import { Box, Grid } from "@radix-ui/themes";

// Sample votes data (could be replaced with real data)
const sampleVotes = [
  { id: 1, label: "Vote A" },
  { id: 2, label: "Vote B" },
  { id: 3, label: "Vote C" },
  { id: 4, label: "Vote D" },
  { id: 5, label: "Vote E" },
  { id: 6, label: "Vote F" },
];

const VoteList: React.FC = () => {
  return (
    <Grid columns="2" gap="4" width="auto">
      {sampleVotes.map((vote) => (
        <Box key={vote.id}>
          <Voting setTxReceipt={() => {}} />
        </Box>
      ))}
    </Grid>
  );
};

export default VoteList;
