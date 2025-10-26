import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('SimpleVoting', function () {
  let voting: any;
  let owner: any;
  let addr1: any;
  let addr2: any;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const Voting = await ethers.getContractFactory('SimpleVoting');
    voting = await Voting.deploy();
  });

  it('should allow creating a question', async function () {
    await voting.createQuestion('Best color?', 'Red', 'Blue', 'image-url');
    const count = await voting.getQuestionsCount();
    expect(count).to.equal(1);
    const q = await voting.getQuestion(0);
    expect(q.question).to.equal('Best color?');
    expect(q.possibleAnswers[0]).to.equal('Red');
    expect(q.possibleAnswers[1]).to.equal('Blue');
    expect(q.image).to.equal('image-url');
    expect(q.createdBy).to.equal(owner.address);
  });

  it('should allow voting and count votes', async function () {
    await voting.createQuestion('Best color?', 'Red', 'Blue', 'image-url');
    await voting.connect(addr1).vote(0, 1); // addr1 votes for Blue
    await voting.connect(addr2).vote(0, 0); // addr2 votes for Red
    const q = await voting.getQuestion(0);
    expect(q.voteCounts[0]).to.equal(1); // Red
    expect(q.voteCounts[1]).to.equal(1); // Blue
  });

  it('should allow changing vote', async function () {
    await voting.createQuestion('Best color?', 'Red', 'Blue', 'image-url');
    await voting.connect(addr1).vote(0, 1); // Blue
    await voting.connect(addr1).vote(0, 0); // Change to Red
    const q = await voting.getQuestion(0);
    expect(q.voteCounts[0]).to.equal(1); // Red
    expect(q.voteCounts[1]).to.equal(0); // Blue
  });

  it('should allow clearing vote', async function () {
    await voting.createQuestion('Best color?', 'Red', 'Blue', 'image-url');
    await voting.connect(addr1).vote(0, 1); // Blue
    await voting.connect(addr1).clearVote(0);
    const q = await voting.getQuestion(0);
    expect(q.voteCounts[0]).to.equal(0);
    expect(q.voteCounts[1]).to.equal(0);
  });

  it('should not allow voting for invalid question or answer', async function () {
    await expect(voting.connect(addr1).vote(0, 0)).to.be.revertedWithCustomError(voting, 'InvalidQuestion');
    await voting.createQuestion('Best color?', 'Red', 'Blue', 'image-url');
    await expect(voting.connect(addr1).vote(0, 2)).to.be.revertedWithCustomError(voting, 'InvalidAnswerIndex');
  });

  it('should fetch all created questions', async function () {
    await voting.createQuestion('Best color?', 'Red', 'Blue', 'img1');
    await voting.createQuestion('Best animal?', 'Cat', 'Dog', 'img2');
    const count = await voting.getQuestionsCount();
    expect(count).to.equal(2);
    const q0 = await voting.getQuestion(0);
    const q1 = await voting.getQuestion(1);
    expect(q0.question).to.equal('Best color?');
    expect(q1.question).to.equal('Best animal?');
    expect(q0.possibleAnswers[0]).to.equal('Red');
    expect(q1.possibleAnswers[1]).to.equal('Dog');
  });

  it('should report hasVotedFor correctly', async function () {
    await voting.createQuestion('Best color?', 'Red', 'Blue', 'img1');
    // initially nobody has voted
    const hasBefore = await voting.hasVotedFor(0, owner.address);
    expect(hasBefore).to.equal(false);

    // addr1 votes
    await voting.connect(addr1).vote(0, 1);
    const hasAfter = await voting.hasVotedFor(0, addr1.address);
    expect(hasAfter).to.equal(true);

    // clear vote
    await voting.connect(addr1).clearVote(0);
    const hasCleared = await voting.hasVotedFor(0, addr1.address);
    expect(hasCleared).to.equal(false);
  });
});
