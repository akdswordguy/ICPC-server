# ICPC Hash Server

This server receives and verifies hashes (and optionally CodeChef IDs) for ICPC video recording identification.

## Prerequisites
- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- [npm](https://www.npmjs.com/)

## Installation

1. **Clone the repository or copy the server code to a directory:**
   ```sh
   git clone <your-repo-url>
   cd <your-repo-directory>
   # OR just copy the server.js file here
   ```

2. **Install dependencies:**
   ```sh
   npm install express body-parser
   ```

3. **Start the server:**
   ```sh
   node server.js
   ```
   The server will run on `http://localhost:5000` by default.

## API Endpoints

### POST `/hash`
- **Description:** Receives a hash, timestamp, and optionally a CodeChef ID.
- **Body:**
  ```json
  {
    "hash": "<hash>",
    "timestamp": "<timestamp>",
    "codechef_id": "<codechef_id>" 
  }
  ```
- **Response:** `{ "status": "ok" }`

### POST `/verify`
- **Description:** Verifies a hash for a given timestamp.
- **Body:**
  ```json
  {
    "timestamp": "<timestamp>",
    "videoHash": "<hash>"
  }
  ```
- **Response:** `{ "valid": true|false }`

## Notes
- Make sure the port `5000` is open or change the `PORT` variable as needed.
