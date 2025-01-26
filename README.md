# Setup Instructions

## Prerequisites
Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

## Installation Steps
1. Clone the repository to your local machine:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Install the required dependencies:
   ```bash
   npm install
   ```

3. Install additional libraries:
   ```bash
   npm install xlsx
   npm install exceljs
   npm install vuedraggable@next --save
   ```

4. Run database migrations (if applicable):
   ```bash
   npm run migrate:run
   ```

## Running the Application
- To start the app in **development mode** (with hot reloading):
  ```bash
  npm run dev
  ```

- To start the app in **production mode**:
  1. Build the project:
     ```bash
     npm run build
     ```
  2. Start the server:
     ```bash
     npm run start
     
