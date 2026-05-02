const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validation checks
        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        if (!['admin', 'teacher', 'examiner'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role specified (allowed: admin, teacher, examiner)' });
        }
        
        if (password.length < 8 || !email.includes("@")) {
            return res.status(400).json({ message: 'Invalid email or password (password must be at least 8 characters and email must contain @)' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use, please use a different email' });
        }

        // Hash password and create user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            createdAt: new Date()
        });

        // Generate JWT token
        const token = jwt.sign(
            { id: newUser._id, role: newUser.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(201).json({
            message: 'User registered successfully',
            userId: newUser._id,
            token
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ message: 'Error while registering user, please try again' });
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        if (!email.includes("@")) {
            return res.status(400).json({ message: 'Invalid email format' });
        }
        // check if user exists
        const user = await User.findOne({email})
        if (!user){
            return res.status(400).json({ message: 'Invalid email or password' })
        } else {
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                const token = jwt.sign(
                    {id: user._id, role: user.role},
                    process.env.JWT_SECRET,
                    {expiresIn: process.env.JWT_EXPIRES_IN}
                );
                res.status(200).json({
                    message: 'User Logged in Successfully',
                    userId: user._id,
                    token
                })
            } else {
                return res.status(400).json({ message: 'Invalid email or password' })
            }
    }
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Error while logging in, please try again' });
    }

}

module.exports = { registerUser, loginUser };