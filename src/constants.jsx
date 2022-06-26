const CONTRACT_ADDRESS = '0x18539D66Be4eC2b1C06C59f6b82734e98fACdE30';

const transformCharacterData = (characterData) => {
  return {
    name: characterData.name,
    imageURI: characterData.imageURI,
    hasWorkout: characterData.hasWorkout.toNumber(),
  };
};

const transformTreeData = (treeData) => {
  return {
    name: treeData.name,
    imageURI: treeData.imageURI,
    level: treeData.level.toNumber(),
  };
};

export { CONTRACT_ADDRESS, transformCharacterData, transformTreeData };