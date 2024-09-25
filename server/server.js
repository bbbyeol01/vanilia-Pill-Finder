const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

// cors
const cors = require("cors");

// DB
const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// login
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// passport
// const passport = require("passport");
// const KakaoStrategy = require("passport-kakao").Strategy;

// server
const express = require("express");
const app = express();

const PORT = 3000;

// JSON 파싱
app.use(express.json());

// CORS 설정
app.use(
  cors({
    origin: "http://localhost:3000", // 허용할 출처
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // 허용할 HTTP 메소드
    credentials: true, // 인증 정보를 포함할지 여부
  })
);

app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.get("/map", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/map.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/login.html"));
});

app.get("/mypage", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/mypage.html"));
});

app.get("/api/kakao/map/key", (req, res) => {
  res.json({ kakao_api_key: process.env.KAKAO_MAP_API_KEY });
});

// DB 연결 확인
app.get("/db-check", async (req, res) => {
  try {
    // 간단한 쿼리를 실행해서 DB 연결 확인
    const [rows] = await db.query("SELECT 1");
    res.status(200).send("DB Connected!");
  } catch (error) {
    console.error("DB Connection Error:", error);
    res.status(500).send("DB Connection Failed");
  }
});

// 회원가입
app.post("/register", async (req, res) => {
  const { username, password, nickname, email } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await db.query(
      "INSERT INTO `user` (username, password, nickname, email) VALUES (?, ?, ?, ?)",
      [username, hashedPassword, nickname, email]
    );
    res.status(201).send("User registered");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error registering user");
  }
});

// 로그인
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const [user] = await db.query("SELECT * FROM `user` WHERE username = ?", [
      username,
    ]);

    if (user.length === 0) {
      return res.status(404).send("입력된 정보가 올바르지 않습니다.");
    }

    // 입력값을 해시한 결과가 DB의 비밀번호와 일치하는지 확인
    const validPassword = await bcrypt.compare(password, user[0].password);
    if (!validPassword) {
      // 아이디 오류와 비밀번호 오류가 다른 오류를 뱉으면 무차별 공격에 취약함. 같은 오류를 반환해야한다.
      // return res.status(401).send("입력된 정보가 올바르지 않습니다.");
      return res.status(404).send("입력된 정보가 올바르지 않습니다.");
    }

    // 아이디, 패스워드가 DB 정보와 일치하면 토큰 발급
    const token = jwt.sign(
      { username: user[0].username },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).send("Server Error");
  }
});

// 토큰 인증
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token> 형태에서 토큰만 추출

  if (!token)
    return res.status(401).json({ message: "토큰이 만료되었습니다." });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err)
      return res.status(403).json({ message: "유효하지 않은 토큰입니다." });

    console.log(token);
    console.log(user);
    req.user = user; // 토큰에서 디코딩된 유저 정보를 req 객체에 저장
    next();
  });
}

// 유저 정보 반환 -> authenticateToken를 통과한 req(유효 토큰)만 조회
app.get("/api/user-info", authenticateToken, async (req, res) => {
  try {
    // DB에서 유저 정보 조회
    const [user] = await db.query(
      "SELECT username, email, nickname, profile_image FROM `user` WHERE username = ?",
      [req.user.username]
    );

    if (user.length !== 0) {
      console.log(user);
      // 유저 정보를 클라이언트에 반환
      res.json(user);
    } else {
      res.status(404).json({ message: "유저를 찾을 수 없습니다." });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// 카카오;
// passport.use(
//   new KakaoStrategy(
//     {
//       clientID: process.env.KAKAO_REST_API_KEY,
//       callbackURL: process.env.KAKAO_REDIRECT_URI,
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       const kakaoId = profile.id; // 카카오 계정 고유 ID
//       const email = profile._json.kakao_account.email; // 이메일
//       const nickname = profile._json.properties.nickname; // 닉네임
//       const profileImage = profile._json.properties.profile_image; // 프로필 사진 URL

//       const [user] = await db.query("SELECT * FROM user WHERE username = ?", [
//         kakaoId,
//       ]);

//       // 이미 가입한 회원이 아니면 회원가입
//       if (user.length === 0) {
//         await db.query(
//           "INSERT INTO `user` (username, email, nickname, profile_image) VALUES (?, ?, ?, ?)",
//           [kakaoId, email, nickname, profileImage]
//         );

//         const newUser = { kakaoId, email, nickname, profileImage };

//         const token = jwt.sign(
//           { nickname: newUser.nickname }, // JWT에 포함할 정보
//           process.env.JWT_SECRET,
//           { expiresIn: "1h" }
//         );

//         return done(null, { nickname: newUser.nickname, token });
//       }

//       // JWT 발급
//       const token = jwt.sign(
//         { nickname: user[0].nickname }, // JWT에 포함할 정보
//         process.env.JWT_SECRET,
//         { expiresIn: "1h" }
//       );

//       return done(null, { nickname: user[0].nickname, token }); // 사용자 정보와 함께 토큰 반환
//     }
//   )
// );

// // 카카오 로그인 시작
// app.get("/login/kakao", passport.authenticate("kakao"));

// // 카카오 로그인 콜백
// app.get(
//   "/api/oauth/kakao",
//   passport.authenticate("kakao", { session: false }), // 세션 비활성화
//   (req, res) => {
//     // JWT를 클라이언트에 전달
//     res.redirect(`/?token=${req.token}`);
//   }
// );

app.post("/logout", (req, res) => {
  // 블랙리스트에 추가하거나 만료 처리
  // authorization은 Bearer ${token} 형태로 오기 때문에 공백으로 split
  const token = req.headers.authorization?.split(" ")[1];

  res.status(200).json({ message: "로그아웃되었습니다." });
});

// 유저 증상 가져오기
app.get("/symptom/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const query = "SELECT symptom FROM mysymptom WHERE username = ?";

    const [results] = await db.query(query, [username]);

    if (results.length === 0) {
      return res.status(404).send("등록된 증상이 없습니다.");
    }

    const symptomList = results.map((row) => row.symptom);
    res.json({ symptomList });
  } catch (error) {
    return res.status(500).send(`DB Error : ${error}`);
  }
});

// 유저 약 가져오기
app.get("/pill/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const query = "SELECT pill FROM mypill WHERE username = ?";

    const [results] = await db.query(query, [username]);

    if (results.length === 0) {
      return res.status(404).send("등록된 약이 없습니다.");
    }

    const pillList = results.map((row) => row.pill);
    res.json({ pillList });
  } catch (error) {
    return res.status(500).send(`DB Error : ${error}`);
  }
});

// 유저 약 등록
app.post("/pill/register", async (req, res) => {
  const { username, pill } = req.body;
  console.log(username);

  try {
    const query1 = `SELECT * FROM mypill where username = ? and pill = ?`;

    const [exist] = await db.query(query1, [username, pill]);

    if (exist.length !== 0) {
      return res.status(403).send(`이미 등록된 약입니다.`);
    }

    const query2 = `INSERT INTO mypill (username, pill) VALUES (? , ?)`;

    db.query(query2, [username, pill]);
    res.status(200).send(`등록되었습니다.`);
  } catch (error) {
    return res.status(500).send(`DB Error : ${error}`);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
