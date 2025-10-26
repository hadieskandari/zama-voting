"use client";

import type { UseWaitForTransactionReceiptReturnType } from "wagmi";
import React, { useCallback, useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Voting from "../components/Voting";
import Navbar from "../components/Navbar";
import { Flex, Grid, Text } from "@radix-ui/themes";
import Silk from '../components/silk';
import useMultiBaas from "../hooks/useMultiBaas";

const Home: React.FC = () => {

    const [txReceipt, setTxReceipt] = useState<UseWaitForTransactionReceiptReturnType['data']>();
    const [loading, setLoading] = useState(true);
    const {
        getQuestionsCount,
        getQuestion,
    } = useMultiBaas();

    const [questions, setQuestions] = useState<any[]>([]);
    // Fetch all questions
    const fetchQuestions = useCallback(async (id: number) => {
        try {
            const q = await getQuestion(id);
            if (!q) {
                setQuestions([]);
                setLoading(false);
                return;
            }
            setQuestions([ { ...q, id } ]);
            setLoading(false);
        } catch (err) {
            setQuestions([]);
        }
    }, [getQuestionsCount, getQuestion]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const qp: { [key: string]: string } = {};
        params.forEach((value, key) => {
            qp[key] = value;
        });
        fetchQuestions(Number(qp.questionId));
    }, [fetchQuestions]);

    return (
        <div>
            <div className="navbar mb-32">
                <Navbar />

                <div className="absolute top-0 right-0 w-full h-full -z-10">
                    <Silk
                        speed={5}
                        scale={1}
                        color="#545454"
                        noiseIntensity={1.5}
                        rotation={0}
                    />
                </div>

                {!loading ? (
                    questions && questions.length > 0 ? (
                    <Voting question={questions[0]} setTxReceipt={setTxReceipt} questitonId={questions[0]?.id} />
                    ) : (
                    <Flex justify="center" align="center" className="h-64">
                        <Text>Sorry! No question found.</Text>
                    </Flex>
                    )
                ) : (
                <Flex justify="center" align="center" className="h-64">
                    <Text>Loading question...</Text>
                </Flex>
                )}
            </div>
        </div>
    );
};

export default Home;
