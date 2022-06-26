import React, { useEffect, useState } from 'react';
import './SelectCharacter.css';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformCharacterData } from '../../constants';
import myManaTree from '../../utils/ManaTree.json';
import LoadingIndicator from "../../Components/LoadingIndicator";

const SelectCharacter = ({ setCharacterNFT }) => {
  const [characters, setCharacters] = useState([]);
  const [gameContract, setGameContract] = useState(null);
  const [mintingCharacter, setMintingCharacter] = useState(false);

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
    const getCharacters = async () => {
      try {
        console.log('Getting contract characters to mint');
  
        // Call contract to get all mint-able characters (only one for now)
        const charactersTxn = await gameContract.getAllDefaultCharacters();
        console.log('charactersTxn:', charactersTxn);
        
         // Cycle through all of our characters and transform the data (only 1 for now)
        const characters = charactersTxn.map((characterData) =>
          transformCharacterData(characterData)
        );
  
         // Set all mint-able characters in state
        setCharacters(characters);
      } catch (error) {
        console.error('Something went wrong fetching Dojo avatars:', error);
      }
    };

   // Trigger when this event is received
    const onCharacterMint = async (sender, tokenId, characterIndex) => {
      console.log(
        `DojoAvatarNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
      );
      alert(`Your NFT is all done -- see it here: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
  
      // Fetch metadata
      if (gameContract) {
        const characterNFT = await gameContract.checkIfUserHasNFT();
        console.log('CharacterNFT: ', characterNFT);
        setCharacterNFT(transformCharacterData(characterNFT));
      }
    };
  
    // Get the characters
    if (gameContract) {
      getCharacters();

       // Setup NFT Minted Listener
      gameContract.on('DojoAvatarNFTMinted', onCharacterMint);
      }

    return () => {
       // Clean up when component unmounts
      if (gameContract) {
        gameContract.off('DojoAvatarNFTMinted', onCharacterMint);
      }
    };    
  }, [gameContract]);

  // Actions
  const mintCharacterNFTAction = async () => {
    try {
      if (gameContract) {
        setMintingCharacter(true);
        console.log('Minting character in progress...');
        const mintTxn = await gameContract.mintCharacterNFT(characterId);
        await mintTxn.wait();
        console.log('mintTxn:', mintTxn);
        setMintingCharacter(false);
      }
    } catch (error) {
      console.warn('MintCharacterAction Error:', error);
      setMintingCharacter(false);
    }
  };

  const renderCharacters = () =>
    characters.map((character, index) => (
      <div className="character-item" key={character.name}>
        <div className="name-container">
          <p>{character.name}</p>
        </div>
        <img src={`https://cloudflare-ipfs.com/ipfs/${character.imageURI}`} alt={character.name} />
        <button
          type="button"
          className="character-mint-button"
          onClick={()=> mintCharacterNFTAction(index)}
        >{`Mint ${character.name}`}</button>
      </div>
    ));
  
  return (
    <div className="select-character-container">
      <h2>Mint Your Dojo Health Avatar</h2>
      {characters.length > 0 && (
        <div className="character-grid">{renderCharacters()}</div>
      )}
      {mintingCharacter && (
        <div className="loading">
          <div className="indicator">
            <LoadingIndicator />
            <p>Minting In Progress...</p>
          </div>
          <img
            src="https://media.giphy.com/media/GbUrFXadBryQ8/giphy.gif"
            alt="Minting loading indicator"
          />
        </div>
      )}
    </div>
  );
};

export default SelectCharacter;