import React from "react";

type Props = {
  className?:string
};

const RightIcon = ({className}: Props) => {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M3.33325 8.00016H12.6666M12.6666 8.00016L7.99992 3.3335M12.6666 8.00016L7.99992 12.6668"
        className="stroke-foreground"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default RightIcon;
