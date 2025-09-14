"use client";

import type { UseWaitForTransactionReceiptReturnType } from "wagmi";
import React, { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Voting from "./components/Voting";
import Events from "./components/Events";
import Navbar from "./components/Navbar";
import VoteList from "./components/VoteList";
import { Flex, Text } from "@radix-ui/themes";

const Home: React.FC = () => {
  const [txReceipt, setTxReceipt] = useState<UseWaitForTransactionReceiptReturnType['data']>();

  return (
    <div>
      <div className="navbar">
        <Navbar />
      </div>
      <div>
        <Flex direction="column" gap="4" align="center" className="mt-5">
          <Text as="div" size="8" weight="bold">Welcome ApeCoin to Solana!</Text>
          <Flex gap="2" align="center">
            <Text as="div" size="2" color="gray">
              powered by
            </Text>
            <img alt="apechain" loading="lazy" width="75" height="25" decoding="async" data-nimg="1" src="https://opinions.fun/_next/image?url=%2Fapecoin2.png&w=256&q=75&dpl=dpl_AStURAeDZfk3GcvqoEUogCw7G5Bq" />
          </Flex>
        </Flex>
        <Voting setTxReceipt={setTxReceipt} />
        {/* <Events txReceipt={txReceipt} /> */}
        <VoteList />
      </div>
    </div>
  );
};

export default Home;
