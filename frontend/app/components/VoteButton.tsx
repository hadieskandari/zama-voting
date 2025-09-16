import { FC } from "react";

interface VoteButtonProps {
  index: number;
  voteCount: number;
  isActive: boolean;
  isDisabled: boolean;
  handleVote: (index: number) => void;
  label?: string;
  color?: string;
}

const VoteButton: FC<VoteButtonProps> = ({
  index,
  voteCount,
  isActive,
  isDisabled,
  handleVote,
  label,
  color,
}) => {
  const backgroundColor = isActive
    ? "bg-button-voted hover:bg-button-clear-vote"
    : "bg-button-default hover:bg-button-cast-vote"
  const cursor = isDisabled ? "cursor-not-allowed" : "cursor-pointer";

  return (


    <button className="p-[2px] relative w-full" onClick={() => handleVote(index)} disabled={isDisabled}>
      <div className={color ? color : 'from-indigo-500 to-purple-500 absolute inset-0 bg-gradient-to-r rounded-lg  '}></div>
      <div className="px-8 py-2  bg-black rounded-[6px]  relative group transition duration-200 text-white hover:bg-transparent">
        {label ? label : `Option ${index + 1}`}
      </div>
    </button>

    

    // <button
    //   className={`vote-button ${backgroundColor} ${cursor}`}
    //   onClick={() => handleVote(index)}
    //   disabled={isDisabled}
    // >
    //   Option {index + 1}: {voteCount} votes
    // </button>
  );
};

export default VoteButton;
