import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSecret = process.env.SESSION_SECRET || "jagjar-session-secret";
  
  const isProduction = process.env.NODE_ENV === 'production';
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Is production environment:', isProduction);
  
  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret,
    resave: true,           // Force session to be saved back to the store
    saveUninitialized: true, // Save uninitialized sessions
    store: storage.sessionStore,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      secure: isProduction, // In production, cookies are sent only over HTTPS
      httpOnly: true,       // Prevents client-side JavaScript from reading the cookie
      sameSite: 'lax',      // Allows cross-site requests with GET 
      path: '/'             // Ensure cookie is available across all paths
    }
  };
  
  console.log('Session settings configured. Store type:', storage.sessionStore.constructor.name);

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log('LocalStrategy - Attempting authentication for username:', username);
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          console.log('LocalStrategy - User not found');
          return done(null, false);
        }
        
        const passwordValid = await comparePasswords(password, user.password);
        console.log('LocalStrategy - Password valid:', passwordValid);
        
        if (!passwordValid) {
          return done(null, false);
        } else {
          console.log('LocalStrategy - Authentication successful for user:', user.username);
          return done(null, user);
        }
      } catch (error) {
        console.error('LocalStrategy - Error during authentication:', error);
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    console.log('serializeUser called with user ID:', user.id);
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      console.log('deserializeUser called with ID:', id);
      const user = await storage.getUser(id);
      if (user) {
        console.log('deserializeUser found user:', user.username);
        done(null, user);
      } else {
        console.log('deserializeUser could not find user with ID:', id);
        done(null, false);
      }
    } catch (error) {
      console.error('deserializeUser error:', error);
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).send("Username already exists");
      }

      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(req.body.email);
      if (existingEmail) {
        return res.status(400).send("Email already exists");
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    console.log('POST /api/login - Request body:', req.body);
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error('POST /api/login - Authentication error:', err);
        return next(err);
      }
      
      if (!user) {
        console.log('POST /api/login - Authentication failed:', info);
        return res.status(401).json({ message: 'Authentication failed' });
      }
      
      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error('POST /api/login - Login error:', loginErr);
          return next(loginErr);
        }
        console.log('POST /api/login - Login successful:', user.username);
        return res.status(200).json(req.user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    console.log('POST /api/logout - User:', req.user?.username);
    req.logout((err) => {
      if (err) {
        console.error('POST /api/logout - Error:', err);
        return next(err);
      }
      console.log('POST /api/logout - Successful logout');
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    console.log('GET /api/user - isAuthenticated:', req.isAuthenticated());
    if (req.isAuthenticated()) {
      console.log('GET /api/user - User:', req.user);
    }
    
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });

  // User profile update
  app.patch("/api/user/profile", (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const { username, email, companyName, website } = req.body;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(400).send("User ID is required");
      }
      
      // Update user profile logic would go here
      // For now, just return the updated user object
      res.json({
        ...req.user,
        username: username || req.user?.username,
        email: email || req.user?.email
      });
    } catch (error) {
      next(error);
    }
  });

  // Change password
  app.patch("/api/user/password", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(400).send("User ID is required");
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).send("User not found");
      }
      
      // Verify current password
      if (!(await comparePasswords(currentPassword, user.password))) {
        return res.status(400).send("Current password is incorrect");
      }
      
      // Update password
      // This would update the user's password in the database
      // For now, just return success
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });
}
