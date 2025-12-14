const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/emailService');
const { logAction } = require('../utils/dbLogger');
const db = require('../db'); // Required for OTP

// Register Logic
exports.register = async (req, res) => {
    try {
        const { email, password, first_name, last_name, phone_number } = req.body;

        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            email,
            password_hash: hashedPassword,
            first_name,
            last_name,
            phone_number
        });
        
        await sendEmail(
            newUser.email,
            "Тавтай морил!",
            `Сайн байна уу? ${newUser.last_name}, Манайд бүртгүүлсэнд баярлалаа!`
        );

        res.status(201).json({ message: "User registered successfully", user: newUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// Login Logic
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findByEmail(email);
        if (!user) {
            await logAction(null, 'WARNING', `Failed login attempt: Email ${email} not found`, '/api/auth/login');
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            await logAction(user.user_id, 'WARNING', 'Failed login attempt: Wrong password', '/api/auth/login');
            return res.status(400).json({ message: "Invalid credentials" });
        }

        await logAction(user.user_id, 'SUCCESS', 'User Logged In', '/api/auth/login');

        const token = jwt.sign(
            { id: user.user_id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token, user: { id: user.user_id, email: user.email, role: user.role } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// --- NEW: OTP Functions ---

exports.sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        
        // 1. Generate 6 digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        // 2. Set expiration (10 minutes)
        const expiresAt = new Date(Date.now() + 10 * 60000);

        // 3. Save to DB
        await db.query(
            'INSERT INTO otp_codes (email, code, expires_at) VALUES ($1, $2, $3)',
            [email, code, expiresAt]
        );

        // 4. Send Email
        await sendEmail(email, "Your Verification Code", `Your OTP code is: ${code}`);

        res.json({ message: "OTP sent to email" });
    } catch (err) {
        console.error("OTP Error:", err);
        res.status(500).json({ error: "Failed to send OTP" });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { email, code } = req.body;

        // 1. Check if code exists and is NOT expired
        const result = await db.query(
            `SELECT * FROM otp_codes 
             WHERE email = $1 AND code = $2 AND expires_at > NOW()
             ORDER BY created_at DESC LIMIT 1`,
            [email, code]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // 2. Delete used OTP (Optional security step)
        await db.query('DELETE FROM otp_codes WHERE id = $1', [result.rows[0].id]);

        res.json({ message: "OTP Verified Successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};