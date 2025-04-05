import { useState, useEffect } from 'react'
import { fetchAvailBlockData, fetchSpecificBlockData } from './services/availApi'
import BlockCube from './components/BlockCube'
import './App.css'

// Constants
const MAX_BLOCK_SIZE_BYTES = 4 * 1024 * 1024; // 4MB in bytes
const BLOCK_TIME_MS = 20000; // 20 seconds in milliseconds
const AVAIL_EXPLORER_URL = 'https://avail.subscan.io/block/';

function App() {
  const [blockNumber, setBlockNumber] = useState(0);
  const [nextBlockNumber, setNextBlockNumber] = useState(0);
  const [blockDetails, setBlockDetails] = useState([]);
  const [nextBlockDetails, setNextBlockDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewBlock, setIsNewBlock] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [blockStartTime, setBlockStartTime] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(BLOCK_TIME_MS);
  const [isFillingUp, setIsFillingUp] = useState(false);
  const prevFillRef = { current: 0 }; // Using a simple object as we don't need a React ref here anymore

  // Function to fetch the initial block data
  const initializeBlockData = async () => {
    try {
      // Get the latest finalized block as our starting point
      const data = await fetchAvailBlockData();
      const startingBlockNumber = data.blockNumber;
      
      // Set current block
      setBlockNumber(startingBlockNumber);
      setBlockDetails(data.blockDetails);
      
      // Prepare for next block
      setNextBlockNumber(startingBlockNumber + 1);
      
      // Fetch next block details in the background
      const nextData = await fetchSpecificBlockData(startingBlockNumber + 1);
      setNextBlockDetails(nextData.blockDetails);
      
      // Set block start time
      const now = Date.now();
      setBlockStartTime(now);
      
      setIsInitialized(true);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to initialize block data:', err);
      setError('Failed to fetch initial block data. Please try again later.');
      setIsLoading(false);
    }
  };

  // Function to progress to the next block
  const progressToNextBlock = async () => {
    try {
      // Trigger animation
      setIsNewBlock(true);
      setTimeout(() => setIsNewBlock(false), 1000);
      
      // Update current block with pre-fetched next block data
      setBlockNumber(nextBlockNumber);
      setBlockDetails(nextBlockDetails);
      
      // Calculate next block number
      const newNextBlockNumber = nextBlockNumber + 1;
      setNextBlockNumber(newNextBlockNumber);
      
      // Reset block start time
      const now = Date.now();
      setBlockStartTime(now);
      
      // Fetch details for the new next block in the background
      const nextData = await fetchSpecificBlockData(newNextBlockNumber);
      setNextBlockDetails(nextData.blockDetails);
    } catch (err) {
      console.error('Failed to progress to next block:', err);
      // Continue showing current block if there's an error
    }
  };

  // Initialize on component mount
  useEffect(() => {
    initializeBlockData();
  }, []);

  // Update time remaining
  useEffect(() => {
    if (!isInitialized || blockStartTime === 0) return;
    
    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = now - blockStartTime;
      const remaining = Math.max(0, BLOCK_TIME_MS - elapsed);
      
      setTimeRemaining(remaining);
      
      // If time is up, progress to next block
      if (remaining === 0) {
        progressToNextBlock();
      }
    }, 1000); // Update every second
    
    return () => clearInterval(timer);
  }, [blockStartTime, isInitialized, nextBlockNumber, nextBlockDetails]);

  // Calculate total byte size from all data submissions
  const totalByteSize = blockDetails.reduce((sum, submission) => sum + submission.byteSize, 0);
  
  // Calculate fill percentage (how much of the block is filled)
  const rawFillPercentage = (totalByteSize / MAX_BLOCK_SIZE_BYTES) * 100;
  // For display, we use the raw percentage value
  const displayPercentage = rawFillPercentage;
  // For visual height, only show fill if percentage is 1% or more
  const fillPercentage = rawFillPercentage >= 1 ? rawFillPercentage : 0;

  // Detect fill changes to trigger ripple effects
  useEffect(() => {
    // Only trigger fill ripples when the fill level increases
    if (fillPercentage > prevFillRef.current + 1) {
      setIsFillingUp(true);
      
      // Reset the filling state after animation completes
      const timer = setTimeout(() => {
        setIsFillingUp(false);
      }, 1500);
      
      // Update the previous fill reference
      prevFillRef.current = fillPercentage;
      
      return () => clearTimeout(timer);
    }
  }, [fillPercentage]);

  // Format byte size for display
  const formatByteSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format time remaining
  const formatTimeRemaining = (ms) => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  };

  // Format capacity utilization percentage
  const formatCapacityUtilization = (bytes) => {
    const percentage = (bytes / MAX_BLOCK_SIZE_BYTES) * 100;
    return percentage.toFixed(2) + '%';
  };

  // Format signer address to truncated form
  const formatSignerAddress = (address) => {
    if (!address || address.length < 10) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (isLoading) {
    return (
      <div className="app-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="logo-container">
        <img src="/avail.svg" alt="Avail Logo" className="avail-logo" />
      </div>
      <p className="app-subtitle">Avail DA Capacity : Visualised Block-by-Block</p>
      
      <div className="block-info">
        <div className="time-remaining">Next block in: {formatTimeRemaining(timeRemaining)}</div>
      </div>
      
      <BlockCube 
        blockNumber={blockNumber}
        blockDetails={blockDetails}
        displayPercentage={displayPercentage}
        fillPercentage={fillPercentage}
        isNewBlock={isNewBlock}
        isFillingUp={isFillingUp}
        totalByteSize={totalByteSize}
        formatByteSize={formatByteSize}
        formatCapacityUtilization={formatCapacityUtilization}
        formatSignerAddress={formatSignerAddress}
        explorerUrl={AVAIL_EXPLORER_URL}
      />
      
      {/* Always show text for blocks, even with 0% utilization */}
      <div className="capacity-text">
        {Math.floor(displayPercentage)}% of the full DA Capacity utilised for the Block
      </div>
    </div>
  )
}

export default App
