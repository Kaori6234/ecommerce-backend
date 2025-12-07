const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/emailService');
const { logAction } = require('../utils/dbLogger');

// Register Logic
exports.register = async (req, res) => {
    try {
        const { email, password, first_name, last_name, phone_number } = req.body;

        // 1. Check if user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // 2. Encrypt the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Save to Database
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

        // 1. Find User
        const user = await User.findByEmail(email);
        if (!user) {
            await logAction(null, 'WARNING', `Failed login attempt: Email ${email} not found`, '/api/auth/login');
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // 2. Check Password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            await logAction(user.user_id, 'WARNING', 'Failed login attempt: Wrong password', '/api/auth/login');
            return res.status(400).json({ message: "Invalid credentials" });
        }

        await logAction(user.user_id, 'SUCCESS', 'User Logged In', '/api/auth/login');

        // 3. Create Token
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