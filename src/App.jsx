import { useState, useEffect, Fragment } from 'react'
import { fetchAvailBlockData, fetchSpecificBlockData } from './services/availApi'
import './App.css'

// Constants
const MAX_BLOCK_SIZE_BYTES = 4 * 1024 * 1024; // 4MB in bytes
const BLOCK_TIME_MS = 20000; // 20 seconds in milliseconds
const AVAIL_EXPLORER_URL = 'https://avail.subscan.io/block/';
const MIN_FILL_HEIGHT = 5; // Minimum height in percentage for visibility

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
  const [showBlobInfo, setShowBlobInfo] = useState(false);

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
  // Ensure a minimum visible height for very small values, but keep the actual percentage for display
  const fillPercentage = rawFillPercentage > 0 ? Math.max(MIN_FILL_HEIGHT, rawFillPercentage) : 0;
  
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

  // Handle mouse events for blob info
  const handleMouseEnter = () => {
    setShowBlobInfo(true);
  };

  const handleMouseLeave = () => {
    setShowBlobInfo(false);
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
      <p className="app-subtitle">Avail DA: Boundless DA Capacity – Visualised Block-by-Block</p>
      
      <div className="block-info">
        <div className="time-remaining">Next block in: {formatTimeRemaining(timeRemaining)}</div>
      </div>
      
      <div className="block-container">
        <div 
          className={`block ${isNewBlock ? 'pulse' : ''}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Only show the block fill when there's actual data */}
          {totalByteSize > 0 && (
            <div 
              className="block-fill" 
              style={{ height: `${Math.max(MIN_FILL_HEIGHT, fillPercentage)}%` }}
            >
              <div className="capacity-label">{fillPercentage.toFixed(1)}%</div>
            </div>
          )}
          
          <a 
            href={`${AVAIL_EXPLORER_URL}${blockNumber}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block-number-link"
          >
            #{blockNumber}
          </a>
        </div>
        
        {showBlobInfo && (
          <div className="blob-info-popup">
            <div className="blob-info-header">block info</div>
            <div className="blob-info-content">
              <div className="blob-info-item">
                <div className="blob-info-line">
                  <span className="blob-info-key">block_size:</span> 
                  <span className="blob-info-value">4 MB</span>
                </div>
                
                {blockDetails.length > 0 && (
                  <>
                    {blockDetails.map((blob, index) => (
                      <Fragment key={index}>
                        <div className="blob-info-line">
                          <span className="blob-info-key">blob_size:</span> 
                          <span className="blob-info-value">{formatByteSize(blob.byteSize)}</span>
                        </div>
                        <div className="blob-info-line">
                          <span className="blob-info-key">app_ID:</span> 
                          <span className="blob-info-value">{blob.appId}</span>
                        </div>
                        <div className="blob-info-line">
                          <span className="blob-info-key">signer:</span> 
                          <span className="blob-info-value">{formatSignerAddress(blob.signer)}</span>
                        </div>
                      </Fragment>
                    ))}
                  </>
                )}
                
                <div className="blob-info-line">
                  <span className="blob-info-key">DA Capacity used:</span> 
                  <span className="blob-info-value">{formatCapacityUtilization(totalByteSize)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {totalByteSize > 0 && (
        <div className="capacity-text">
          {fillPercentage.toFixed(1)}% of the full DA Capacity utilised for the Block
        </div>
      )}
    </div>
  )
}

export default App
