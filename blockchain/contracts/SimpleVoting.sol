// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract SimpleVoting {
    struct Question {
        string question;
        address createdBy;
        string[2] possibleAnswers;
        string image; // URL or IPFS hash
        uint256[2] voteCounts;
    }

    Question[] public questions;
    // questionId => voter => answerIndex (0 or 1)
    mapping(uint256 => mapping(address => uint8)) public votes;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event QuestionCreated(
        uint256 indexed questionId,
        string question,
        address indexed createdBy
    );
    event Voted(
        address indexed voter,
        uint256 indexed questionId,
        uint8 answerIndex
    );

    function createQuestion(
        string memory _question,
        string memory _answer1,
        string memory _answer2,
        string memory _image
    ) public {
        Question memory q = Question({
            question: _question,
            createdBy: msg.sender,
            possibleAnswers: [_answer1, _answer2],
            image: _image,
            voteCounts: [uint256(0), uint256(0)]
        });
        questions.push(q);
        emit QuestionCreated(questions.length - 1, _question, msg.sender);
    }

    function resetQuestions() public {}

    function vote(uint256 questionId, uint8 answerIndex) public {
        require(questionId < questions.length, "Invalid question");
        require(answerIndex < 2, "Invalid answer index");

        if (!hasVoted[questionId][msg.sender]) {
            // New vote
            votes[questionId][msg.sender] = answerIndex;
            questions[questionId].voteCounts[answerIndex] += 1;
            hasVoted[questionId][msg.sender] = true;
            emit Voted(msg.sender, questionId, answerIndex);
        } else {
            // Change vote
            uint8 oldAnswer = votes[questionId][msg.sender];
            require(oldAnswer != answerIndex, "Already voted for this answer");
            questions[questionId].voteCounts[oldAnswer] -= 1;
            questions[questionId].voteCounts[answerIndex] += 1;
            votes[questionId][msg.sender] = answerIndex;
            emit Voted(msg.sender, questionId, answerIndex);
        }
    }

    function hasVotedFor(
        uint256 questionId,
        address voter
    ) public view returns (bool) {
        require(questionId < questions.length, "Invalid question");
        return hasVoted[questionId][voter];
    }

    function clearVote(uint256 questionId) public {
        require(questionId < questions.length, "Invalid question");
        require(hasVoted[questionId][msg.sender], "No vote to clear");
        uint8 oldAnswer = votes[questionId][msg.sender];
        questions[questionId].voteCounts[oldAnswer] -= 1;
        hasVoted[questionId][msg.sender] = false;
        delete votes[questionId][msg.sender];
    }

    function getQuestion(
        uint256 questionId
    )
        public
        view
        returns (
            string memory question,
            address createdBy,
            string[2] memory possibleAnswers,
            string memory image,
            uint256[2] memory voteCounts
        )
    {
        require(questionId < questions.length, "Invalid question");
        Question storage q = questions[questionId];
        return (
            q.question,
            q.createdBy,
            q.possibleAnswers,
            q.image,
            q.voteCounts
        );
    }

    function getQuestionsCount() public view returns (uint256) {
        return questions.length;
    }

    function getUserQuestions(
        address user
    ) public view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < questions.length; i++) {
            if (questions[i].createdBy == user) {
                count++;
            }
        }

        uint256[] memory userQuestions = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < questions.length; i++) {
            if (questions[i].createdBy == user) {
                userQuestions[index] = i;
                index++;
            }
        }
        return userQuestions;
    }
}
