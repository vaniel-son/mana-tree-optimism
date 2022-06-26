import React, { useEffect, useState } from 'react';
import './App.css';
import SelectCharacter from './Components/SelectCharacter';
import Space from './Components/Space';
import { CONTRACT_ADDRESS, transformCharacterData } from './constants';
import myManaTree from './utils/ManaTree.json';
import { ethers } from 'ethers';
import LoadingIndicator from './Components/LoadingIndicator';

const App = () => {
  // State
  const [currentAccount, setCurrentAccount] = useState(null);
  const [characterNFT, setCharacterNFT] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Actions
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log('Make sure you have MetaMask!');
        return;
      } else {
        console.log('We have the ethereum object', ethereum);

        const accounts = await ethereum.request({ method: 'eth_accounts' });

        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log('Found an authorized account:', account);
          setCurrentAccount(account);
        } else {
          console.log('No authorized account found');
        }
      }
    } catch (error) {
      console.log(error);
    }

    setIsLoading(false);
  };

  // Render Methods
  const renderContent = () => {
    if (isLoading) {
      return <LoadingIndicator />;
    }
    
    if (!currentAccount) {
      return (
        <div className="connect-wallet-container">
          <img
            src="https://media.giphy.com/media/kxMQXnH7ucS9q/giphy.gif"
            alt="Monty Python Gif"
          />
          <button
            className="cta-button connect-wallet-button"
            onClick={connectWalletAction}
          >
            Connect Wallet To Get Started
          </button>
        </div>
      );
    } else if (currentAccount && !characterNFT) {
      return <SelectCharacter setCharacterNFT={setCharacterNFT} />;	
  	
      // If there is a connected wallet and Dojo Avatar, then watering is possible
    } else if (currentAccount && characterNFT) {
      return <Space characterNFT={characterNFT} setCharacterNFT={setCharacterNFT} />;
    }
  }; 

  // Connect to metamask
  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }

      // Request access to account
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      // Display the address we are connected to so we know for sure its working
      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    checkIfWalletIsConnected();

    const checkNetwork = async () => {
      try { 
        if (window.ethereum.networkVersion !== '80001') {
          alert("Connect to Rinkeby network!")
        }
      } catch(error) {
        console.log(error)
      }
    }

    checkNetwork();
    
  }, []);

  useEffect(() => {
    // Interact with the smart contract
    const fetchNFTMetadata = async () => {
      console.log('Checking for Character NFT on address:', currentAccount);
  
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myManaTree.abi,
        signer
      );
  
      const txn = await gameContract.checkIfUserHasNFT();
      if (txn.name) {
        console.log('User has Dojo Avatar NFT');
        setCharacterNFT(transformCharacterData(txn));
      } else {
        console.log('No Dojo Avatar NFT found');
      }

      setIsLoading(false);
    };
  
    // Only run if there is a connected wallet
    if (currentAccount) {
      console.log('CurrentAccount:', currentAccount);
      fetchNFTMetadata();
    }
}, [currentAccount]);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">🌱 Tree of Mana 🌲</p>
          <p className="sub-text">Van has passed away, and all that remains is his NFT tree so please water it to keep it alive or else the tree dies too...</p>
          {renderContent()}
        </div>
        <div className="footer-container">
          <a
            className="footer-text"
            href='#'
            target="_blank"
            rel="noreferrer"
          >{`Made by Van and Marvin`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;