import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import "./App.css";
import abi from "./utils/HonkPortal.json";
import Pending from "./Pending";
import Complete from "./Complete";
import profileImg from "./image/profile.png";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [allHonks, setAllHonks] = useState([]);
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);
  const [complete, setComplete] = useState(false);
  const [isRegistered, setIsRegistered] = useState();
  const [isClicked, setIsClicked] = useState(false);

  const input = document.querySelector(".textbox");
  const nameInput = document.querySelector(".nameBox");
  const contractAddress = "0x74Cf0e36f5A757Ce4bA68425bc4d74DE145A54e8";
  const contractABI = abi.abi;

  const onEnter = (e) => {
    if (e.key === "Enter") {
      honk();
    }
  };

  const onNameEnter = (e) => {
    if (e.key === "Enter") {
      register();
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Make sure you have metamask!");
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account: ", account);
        setCurrentAccount(account);

        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const honkPortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let nickname;
        const hasNickname = await honkPortalContract.getHasNickname(account);

        if (hasNickname) {
          nickname = await honkPortalContract.getNickname(account);
          setName(nickname);
          setIsRegistered(true);
        } else {
          setName(account.substr(0, 6) + "...");
          setIsRegistered(false);
        }
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      setName(accounts[0].substr(0, 6) + "...");
    } catch (error) {
      console.log(error);
    }
  };

  const getAllHonks = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const honkPortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const honks = await honkPortalContract.getAllHonks();

        let honksCleaned = [];

        for (let honk of honks) {
          let nickname;
          const hasNickname = await honkPortalContract.getHasNickname(
            honk.honker
          );
          if (hasNickname) {
            nickname = await honkPortalContract.getNickname(honk.honker);
          } else {
            nickname = honk.honker.substr(0, 6).toLowerCase() + "...";
          }

          honksCleaned.push({
            address: nickname,
            timestamp: new Date(honk.timestamp * 1000),
            message: honk.message,
          });
        }

        setAllHonks(honksCleaned);
      } else {
        console.log("Etherum object doesn't exist.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const honk = async () => {
    try {
      let message = input.value;
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const honkPortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let count = await honkPortalContract.getTotalHonks();
        console.log("Retrived total honk count...", count.toNumber());

        const honkTxn = await honkPortalContract.honk(message, {
          gasLimit: 300000,
        });
        setPending(true);
        console.log("Mining...", honkTxn.hash);

        input.value = "";
        await honkTxn.wait();
        setPending(false);
        setComplete(true);
        setTimeout(() => setComplete(false), 3000);
        console.log("Mined -- ", honkTxn.hash);

        count = await honkPortalContract.getTotalHonks();
        console.log("Retrived total honk count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const register = async () => {
    try {
      let nickname = nameInput.value;
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const honkPortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        if (isRegistered) {
          let changeTxn = await honkPortalContract.changeNickname(nickname, {
            gasLimit: 300000,
          });
          console.log("Your name is...", nickname);
          setPending(true);

          await changeTxn.wait();
        } else {
          let registerTxn = await honkPortalContract.registerNickname(
            nickname,
            {
              gasLimit: 300000,
            }
          );
          console.log("Your name is...", nickname);
          setPending(true);

          await registerTxn.wait();
        }

        setPending(false);
        setComplete(true);
        nameInput.value = "";
        setIsClicked(false);
        setTimeout(() => setComplete(false), 3000);

        nickname = await honkPortalContract.getNickname(currentAccount);
        setName(nickname);
        setIsRegistered(true);
      } else {
        console.log("Ethereum object doesn't exist");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);
  getAllHonks();

  const isToday = (someDate) => {
    const today = new Date();
    return (
      someDate.getDate() === today.getDate() &&
      someDate.getMonth() === today.getMonth() &&
      someDate.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="mainContainer">
      {currentAccount && (
        <div className="profile">
          <div className="profile__head">You are...</div>
          <img className="profile__img" src={profileImg}></img>
          <div className="profile__nickname">{name}</div>
          {!isRegistered && !isClicked && (
            <button
              className="registerBtn"
              onClick={() => {
                setIsClicked(true);
              }}
            >
              Click to register your own nickname!
            </button>
          )}
          {isRegistered && !isClicked && (
            <button
              className="changeBtn"
              onClick={() => {
                setIsClicked(true);
              }}
            >
              Click to change your own nickname!
            </button>
          )}
          {isClicked && (
            <input
              className="nameBox"
              type={"text"}
              placeholder={"Write down your nickname."}
              onKeyPress={onNameEnter}
            />
          )}
        </div>
      )}
      <div className="dataContainer">
        <div className="header">🦢 Honk Honk!</div>
        <div className="bio">Goose Crossing, KAIST</div>
        {!currentAccount && (
          <button className="honkButton connectBtn" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        {currentAccount && (
          <input
            className="textbox"
            type={"text"}
            placeholder={"Honk with a message!"}
            onKeyPress={onEnter}
          />
        )}
        {currentAccount && (
          <button className="honkButton" onClick={honk}>
            Click this to honk like a Goose! 🐤
          </button>
        )}
        {allHonks.reverse().map((honk, index) => {
          const date = honk.timestamp;
          let feedShownDate;

          if (isToday(date)) feedShownDate = "오늘";
          else {
            feedShownDate = date.getMonth() + 1 + "월 " + date.getDate() + "일";
          }

          return (
            <div className="feed">
              <img className="feed__profile" src={profileImg}></img>
              <div className="feed__content">
                <div className="feed__address">{honk.address}</div>
                <div className="feed__msg">{honk.message}</div>
                <div className="feed__time">{feedShownDate}</div>
              </div>
            </div>
          );
        })}
        {pending && <Pending />}
        {complete && <Complete />}
      </div>
    </div>
  );
};

export default App;
