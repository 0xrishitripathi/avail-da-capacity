# Avail DA Capacity Visualization

A real-time visualization tool for monitoring data availability capacity utilization on the Avail network.

## Overview

This application provides a visual representation of how much of the 4MB block size is being utilized for data submissions on the Avail blockchain. It displays the latest block number and visualizes the percentage of block capacity used in real-time.

## Features

- Real-time block data visualization
- Block-by-block capacity utilization tracking
- Detailed block information on hover
- Smooth transitions between blocks
- Responsive design for various screen sizes

## Technology Stack

- React 18
- Vite
- GraphQL for data fetching
- Framer Motion for animations

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/avail-da-capacity.git
cd avail-da-capacity
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Build for production
```bash
npm run build
```

## API Integration

The application connects to the Avail GraphQL API to fetch real-time block data and data submissions. It calculates the DA capacity used as a percentage of the 4MB block size.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Avail Network for providing the GraphQL API
- The React and Vite communities for their excellent tools
