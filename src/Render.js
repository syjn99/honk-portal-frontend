import React from "react";

const Render = ({ honk }) => {
  const date = honk.timestamp;
  let feedShownDate;

  if (isToday(date)) feedShownDate = "오늘";
  else {
    feedShownDate = date.getMonth() + 1 + "월 " + date.getDate() + "일";
  }

  return (
    <div className="feed" key={index}>
      <img className="feed__profile" src={profileImg}></img>
      <div className="feed__content">
        <div className="feed__address">{honk.address}</div>
        <div className="feed__msg">{honk.message}</div>
        <div className="feed__time">{feedShownDate}</div>
      </div>
    </div>
  );
};

export default Render;
