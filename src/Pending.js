import React from "react";

const Pending = () => {
  return (
    <container className="pending">
      <span className="spin"></span>
      <span className="pending__text">Transaction Pending...</span>
    </container>
  );
};

export default Pending;
