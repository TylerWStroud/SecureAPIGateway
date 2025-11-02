/**
 * Generates a hash for the given input string.
 * @param {string} input - The input string to hash.
 * @returns {string} - The resulting hash.
 *
 * HOW TO USE:
 *  === IN TERMINAL ===
 * type > node api-gateway/scripts/generateHash.js your-input-string
 *
 * Example:
 *  > node api-gateway/scripts/generateHash.js mySecretPassword
 *
 */

import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS);
async function generateHash() {
  const password = process.argv[2]; // get input from command line argument

  if (!password) { // if no input provided
    console.error(
      "Please provide an input string to hash.\nUsage: node api-gateway/scripts/generateHash.js <password>\nExample: node api-gateway/scripts/generateHash.js mySecretPassword"
    );
    process.exit(1);
  }

  try{ // generate hash
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    console.log("\n ==== Password hash generated successfully! ==== \n");
    console.log(`Input: ${password}`);
    console.log(`Hash:  ${hash}\n`);

    const isValid = await bcrypt.compare(password, hash);
    if(isValid){
        console.log("Hash verification successful: The hash matches the input.");
    } else {
        console.log("Hash verification failed: The hash does not match the input.");
    }
  } catch(error){
    console.error("Error generating hash:", error);
    process.exit(1); // exit with error
  }
}
 generateHash();