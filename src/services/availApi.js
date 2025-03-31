import { request, gql } from 'graphql-request';

const AVAIL_INDEXER_URL = 'https://indexer.avail.so/';

/**
 * Fetches the latest finalized block number from Avail
 * @returns {Promise<number>} The latest block number
 */
export const fetchLatestBlockNumber = async () => {
  const query = gql`
    {
      blocks(
        orderBy: NUMBER_DESC
        first: 1
      ) {
        nodes {
          number
        }
      }
    }
  `;

  try {
    const data = await request(AVAIL_INDEXER_URL, query);
    return data.blocks.nodes[0].number;
  } catch (error) {
    console.error('Error fetching latest block number:', error);
    throw error;
  }
};

/**
 * Fetches data submissions for a specific block
 * @param {number} blockNumber - The block number to fetch data for
 * @returns {Promise<Array>} Array of data submissions for the block
 */
export const fetchBlockDetails = async (blockNumber) => {
  const query = gql`
    {
      dataSubmissions(
        filter: {
          extrinsicId: { startsWith: "${blockNumber}" }
        }
      ) {
        nodes {
          byteSize
          signer
          appId
        }
      }
    }
  `;

  try {
    const data = await request(AVAIL_INDEXER_URL, query);
    return data.dataSubmissions.nodes;
  } catch (error) {
    console.error(`Error fetching details for block ${blockNumber}:`, error);
    // Return empty array instead of throwing to handle blocks with no data submissions
    return [];
  }
};

/**
 * Fetches both the latest block number and its details in a single function
 * @returns {Promise<Object>} Object containing block number and details
 */
export const fetchAvailBlockData = async () => {
  try {
    // First get the latest block number
    const blockNumber = await fetchLatestBlockNumber();
    
    // Then fetch details for that block
    const blockDetails = await fetchBlockDetails(blockNumber);
    
    return {
      blockNumber,
      blockDetails: blockDetails.length > 0 ? blockDetails : []
    };
  } catch (error) {
    console.error('Error fetching Avail block data:', error);
    throw error;
  }
};

/**
 * Fetches details for a specific block number
 * @param {number} blockNumber - The specific block number to fetch details for
 * @returns {Promise<Object>} Object containing block number and details
 */
export const fetchSpecificBlockData = async (blockNumber) => {
  try {
    // Query to get data submissions for a specific block
    const query = gql`
      query GetBlockDetails($blockNumber: String!) {
        dataSubmissions(
          filter: {
            extrinsicId: { startsWith: $blockNumber }
          }
        ) {
          nodes {
            byteSize
            signer
            appId
          }
        }
      }
    `;

    const variables = {
      blockNumber: blockNumber.toString()
    };

    const response = await request(AVAIL_INDEXER_URL, query, variables);
    
    // Extract data submissions from the response
    const blockDetails = response.dataSubmissions.nodes || [];
    
    return {
      blockNumber,
      blockDetails
    };
  } catch (error) {
    console.error('Error fetching block details:', error);
    // Return empty array for block details if there's an error
    return {
      blockNumber,
      blockDetails: []
    };
  }
};
