import express from "express";
import dotenv from "dotenv";
dotenv.config();
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import { initSocket } from "./socket/index.js";
import connectDB from "./config/db.js";
import authRoutes from "./features/auth/auth.route.js";
connectDB();

// CRON JOBS

const app = express();
const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 3000;
// CORS CONFIG 

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, // allows cookies
  })
);

app.use('/uploads', express.static('uploads'));


// PARSERS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);


app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong"
  });
});

app.get("/", (req, res) => {
  res.send("Server running with socket.io + cookies enabled");
});

server.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);



// DEBUGGER
// setInterval(() => {
//   console.log("---- SOCKET STORE STATUS ----");

//   /* -------------------------
//       GUESTS
//   -------------------------- */
//   console.log("Guests:", socketStore.guests.size);

//   /* -------------------------
//       ADMINS (adminId -> [sessionIds])
//   -------------------------- */
//   console.log(
//     "Admins:",
//     Object.fromEntries(
//       [...socketStore.admins.entries()].map(([adminId, sessions]) => [
//         adminId,
  
//         // Convert each admin's sessions map → plain object
//         Object.fromEntries(
//           [...sessions.entries()].map(([sessionId, socketSet]) => [
//             sessionId,
//             [...socketSet]   // convert Set(socketIds) → array
//           ])
//         )
//       ])
//     )
//   );
  
//   /* -------------------------
//       USERS (userId -> socketCount)
//   -------------------------- */
//   console.log(
//     "Users:",
//     Object.fromEntries(
//       [...socketStore.users.entries()].map(([userId, sockets]) => [
//         userId,
//         sockets.size
//       ])
//     )
//   );

//   /* -------------------------
//       ONLINE TOTAL
//   -------------------------- */
//   const online = socketStore.getOnlineCounts();
//   console.log("Online Total:", online.total);

//   console.log("--------------------------------\n");
// }, 3000);
