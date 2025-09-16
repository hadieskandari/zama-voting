"use client";

import type { UseWaitForTransactionReceiptReturnType } from "wagmi";
import React, { useCallback, useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Voting from "./components/Voting";
import Events from "./components/Events";
import Navbar from "./components/Navbar";
import VoteList from "./components/VoteList";
import { Flex, Grid, Text } from "@radix-ui/themes";
import Silk from './components/silk';
import CreateQuestion from "./components/createQuesion";
import useMultiBaas from "./hooks/useMultiBaas";

const Home: React.FC = () => {

  const [txReceipt, setTxReceipt] = useState<UseWaitForTransactionReceiptReturnType['data']>();

  const {
    getQuestionsCount,
    getQuestion,
  } = useMultiBaas();

  const [questions, setQuestions] = useState<any[]>([]);
  // Fetch all questions
  const fetchQuestions = useCallback(async () => {
    try {
      const count = await getQuestionsCount();
      if (!count) return setQuestions([]);
      const qList = [];
      for (let i = 0; i < count; i++) {
        const q = await getQuestion(i);
        qList.push({ ...q, id: i });
      }
      setQuestions(qList);
    } catch (err) {
      setQuestions([]);
    }
  }, [getQuestionsCount, getQuestion]);

  useEffect(() => {
    fetchQuestions();
  }, [txReceipt, fetchQuestions]);

  // useEffect(() => {
  //   fetchUserVotes();
  // }, [isConnected, address, questions, txReceipt, fetchUserVotes]);


  return (
    <div>


      <div className="navbar mb-32">
        <Navbar />

        <div className="absolute top-0 right-0 w-full h-full -z-10">
          <Silk
            speed={5}
            scale={1}
            color="#7B7481"
            noiseIntensity={1.5}
            rotation={0}
          />
        </div>



      </div>
      <div>
        <Flex direction="column" gap="4" align="center" className="mt-5">
          <Text as="div" size="8" weight="bold">Welcome to ZamaCV Confidential voting!</Text>
          <Flex align="center" justify="center" gap="1">
            <Text as="div" size="2" color="gray">Prevents bribery and blackmailing by keeping votes private with </Text>
            <img style={{ backgroundColor: '#ffd208' }} alt="cv" loading="lazy" width="40" height="25" decoding="async" data-nimg="1" src="https://cdn.prod.website-files.com/61bc21e3a843412266a08eb3/68417dce00c33fce2253fc6e_Untitled%20design%20(1).svg" />

          </Flex>
        </Flex>
        {
          questions.length === 0 ? (
            <Flex justify="center" className="my-10 px-4">
              <Text as="div" size="3" color="gray">No questions available. Please check back later.</Text>
            </Flex>
          ) : <Voting setTxReceipt={setTxReceipt} question={questions[0]} primary />

        }


        <Grid columns="2" rows="2" className="mt-10 px-4">

          {
            questions.map((q, idx) => (
              <div key={idx} className="mb-6">

                <Voting setTxReceipt={setTxReceipt} question={q} />

              </div>
            ))
          }

        </Grid>
        {/* <CreateQuestion /> */}
        {/* question 2: 
          Does FHEVM integration excite you for Zama's future?
        */}
        {/* <Events txReceipt={txReceipt} /> */}
        {/* <VoteList /> */}




      </div>
    </div>
  );
};

export default Home;
