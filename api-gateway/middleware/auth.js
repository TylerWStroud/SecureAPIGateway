import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "default-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
/**
 * in-memory user store (replace with database)
 * passwords are bcrypt hashed
 *
 * To generate new hashed passwords, use the generateHash uttility script
 */
const users = [
  {
    id: 1,
    username: "admin",
    // bcrypt hashed password for "admin123"
    password: "$2a$12$3K6APC.mrZoq4/pZmeT/ZOvP3O0Gqwem.1GEl8sFNxGDviVPoPkc.",
    roles: ["admin", "user"],
  },
  {
    id: 2,
    username: "user",
    // bcrypt hashed password for "user123"
    password: "$2a$12$tiIkCdwCSQQbhif8A4Ve.ujCv7tBEGPIGaUj.VA/tLpLdaGFgRNK2",
    roles: ["user"],
  },
];

/**
 * authenticate user and return JWT token (OAuth Bearer Token Flow)
 */
export const authenticateUser = async (username, password) => {
  const user = users.find((u) => u.username === username); // check if user exists
  if (!user) {
    throw new Error("Invalid username"); // returns null if user does not exist
  }

  // check if password is correct using bcrypt
  try {
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error("Invalid password"); // returns null if password is incorrect
    }

    // generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        roles: user.roles,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        roles: user.roles,
      },
    };
  } catch (error) {
    console.error("!! Password verification error: ", error);
    return null;
  }
};

/**
 * Hash a password using bcrypt (for creating new users)
 * @param {string} password - plain text password
 * @returns {Promise<string>} bcrypt hashed password
 */
export async function hashPassword(password) {
  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    return hashedPassword;
  } catch (error) {
    console.error("!! Password hashing error: ", error);
    throw error;
  }
}

/**
 * Verify JWT Bearer token
 * @param {string} token - Bearer token string
 * @returns {object|null} decoded token payload or null if invalid
 */
export const verifyToken = (token) => {
  try {
    if (!token || !token.startsWith("Bearer ")) {
      // check for token with Bearer token format
      throw new Error("Invalid token format");
    }

    const actualToken = token.substring(7); // remove "Bearer " prefix
    const decoded = jwt.verify(actualToken, JWT_SECRET); // verify token
    return decoded; // return decoded token payload
  } catch (error) {
    console.error("!! Token verification error: ", error);
    return null;
  }
};

/**
 * AUTHENTICATION MIDDLEWARE
 * Verifies Bearer token on protected routes
 */
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization; // get Authorization header
  if (!authHeader) {
    res.statusCode = 401; // Unauthorized
    res.setHeader("Content-Type", "application/json"); // set response content type
    res.end(
      // send error response
      JSON.stringify({
        error: "Authorization header missing",
        message: "Please provide a Bearer token",
        code: "401, AUTH_REQUIRED",
      })
    );
    return; // stop further processing
  }

  const user = verifyToken(authHeader); // verify token
  if (!user) {
    res.statusCode = 401; // Unauthorized
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        // send error response
        error: "Unauthorized",
        message: "Invalid or expired token",
        code: "401, AUTH_INVALID_TOKEN",
      })
    );
    return; // stop further processing
  }

  req.user = user; // attach user info to request object
  next(); // proceed to next middleware or route handler
}

/**
 * LOGIN ENDPOINT HANDLER
 * Handles POST /auth/login requests
 */
export function handleLogin(req, res) {
  if (req.method !== "POST") {
    res.statusCode = 405; // Method Not Allowed
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        error: "Method Not Allowed",
        code: "METHOD_NOT_ALLOWED",
      })
    );
    return;
  }

  let body = ""; // initialize request body
  req.on("data", (chunk) => {
    // listen for data events
    body += chunk.toString(); // accumulate request body
  });

  req.on("end", async () => {
    // when request body is fully received
    try {
      const { username, password } = JSON.parse(body); // parse JSON body
      if (!username || !password) {
        res.statusCode = 400; // Bad Request
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            // send error response
            error: "Bad Request",
            message: "Username and password are required",
            code: "400, MISSING_CREDENTIALS",
          })
        );
        return;
      }

      const result = await authenticateUser(username, password); // authenticate username and password
      if (!result) {
        res.statusCode = 401; // Unauthorized
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            error: "Unauthorized",
            message: "Invalid username or password",
            code: "401, AUTH_INVALID_CREDENTIALS",
          })
        );
        return;
      }

      res.statusCode = 200; // username and password are valid
      res.setHeader("Content-Type", "application/json");
      res.end(
        // send success response with token
        JSON.stringify({
          access_token: result.token,
          token_type: "Bearer",
          expires_in: JWT_EXPIRES_IN,
          user: {
            id: result.user.id,
            username: result.user.username,
            roles: result.user.roles,
          },
        })
      );
    } catch (error) {
      res.statusCode = 400; // Bad Request
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          error: "Bad Request",
          message: "Invalid JSON payload in request body",
          code: "400, INVALID_JSON",
        })
      );
    }
  });
}
