import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformCharacterData, transformTreeData } from '../../constants';
import myManaTree from '../../utils/ManaTree.json';
import './space.css';
import LoadingIndicator from "../../Components/LoadingIndicator";

const Space = ({ characterNFT, setCharacterNFT }) => {
  // State
  const [gameContract, setGameContract] = useState(null);
  const [tree, setTree] = useState(null);
  const [wateringState, setWateringState] = useState('');
  const [showToast, setShowToast] = useState(false);

  status = 'UNHEALTHY';
  if (characterNFT.hasWorkout > 0) {
    status = 'HEALTHY';
  }

  const ruWateringAction = async () => {
    try {
      if (gameContract) {
        if (characterNFT.hasWorkout == 0) {
          alert('Please workout if you want to water the tree again');
          window.location.reload();
        } else {
          setWateringState('watering');
          console.log('Watering Tree...');
          const wateringTxn = await gameContract.waterTree();
          await wateringTxn.wait();
          console.log('wateringTxn:', wateringTxn);
          setWateringState('watered');
  
          setShowToast(true);
          setTimeout(() => {
            setShowToast(false);
            window.location.reload();
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error watering tree:', error);
      setWateringState('');
    }
  };

  // UseEffects
  useEffect(() => {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myManaTree.abi,
        signer
      );

      setGameContract(gameContract);
    } else {
      console.log('Ethereum object not found');
    }
  }, []);

  useEffect(() => {
    const fetchTree = async () => {
      const treeTxn = await gameContract.getManaTree();
      console.log('Tree:', treeTxn);
      setTree(transformTreeData(treeTxn));
    };

    const onWaterComplete = (from, newTreeHp, newPlayerHp) => {
      const treeHp = newTreeHp.toNumber();
      const playerHp = newPlayerHp.toNumber();
      const sender = from.toString();

      console.log(`WateringComplete: Tree Hp: ${treeHp} Player Hp: ${playerHp}`);

      // If player is our own, update both player and boss Hp (not working yet)
      // if (currentAccount === sender.toLowerCase()) {
      if (true) {

        setTree((prevState) => {
            return { ...prevState, hp: treeHp };
        });
        setCharacterNFT((prevState) => {
            return { ...prevState, hp: playerHp };
        });
      }
      // If player isn't ours, update boss Hp only
      else {
        setTree((prevState) => {
            return { ...prevState, hp: treeHp };
        });
      }
    }
  
    if (gameContract) {
      /*
       * gameContract is ready to go! Let's fetch our boss
       */
      fetchTree();
      gameContract.on('WateringComplete', onWaterComplete);
    }

    /*
    * Make sure to clean up this event when this component is removed
    */
    return () => {
        if (gameContract) {
            gameContract.off('WateringComplete', onWaterComplete);
        }
    }
  }, [gameContract]);

  const waterAction = () => {
    if (characterNFT.hasWorkout == 0) {
      return <h4>Go do something healthy so you can water this tree</h4>
    } else {
      return <button className="cta-button" onClick={ruWateringAction}>
            {`🚿 Water ${tree.name}`}
          </button>
    }
  }

  return (
    <div className="space-container">
      {tree && characterNFT && (
        <div id="toast" className={showToast ? 'show' : ''}>
          <div id="desc">{`🚿 Watering complete!`}</div>
        </div>
      )}
      
      {/* Tree */}
      {tree && (
      <div className="tree-container">
        <div className={`tree-content  ${wateringState}`}>
          <h2>🪴 {tree.name} 🪴</h2>
          <div className="image-content">
            <img src={tree.imageURI} alt={`Tree ${tree.name}`} />
            <div className="progress-bar">
              <progress value={tree.level} max={100} />
              <p>{`${tree.level} / ${100} LEVEL`}</p>
            </div>
          </div>
        </div>
        <div className="water-container">
          {waterAction()}
        </div>
        {wateringState === 'watering' && (
          <div className="loading-indicator">
            <LoadingIndicator />
            <p>Watering... 🚿</p>
          </div>
        )}
      </div>
    )}
  
      {/* Dojo Avatar NFT */}
      {characterNFT && (
      <div className="players-container">
        <div className="player-container">
          <div className="player">
            <div className="image-content">
              <h2>{characterNFT.name}</h2>
              <img
                src={`https://cloudflare-ipfs.com/ipfs/${characterNFT.imageURI}`}
                alt={`Character ${characterNFT.name}`}
              />
              <div className="progress-bar">
                <progress value={characterNFT.hasWorkout} max={1} />
                <p>{`${status}`}</p>
              </div>
            </div>
            <div className="stats">
              <h5>{`Record healthy activities with Dojo app`}</h5>
            </div>
          </div>
        </div>
      </div>
    )}
    </div>
  );
};

export default Space;