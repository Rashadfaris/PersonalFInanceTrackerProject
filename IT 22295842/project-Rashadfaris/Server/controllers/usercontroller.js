import sendEmail from '../config/sendEmail.js';
import user_model from '../model/user_model.js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import verifyEmailTemplate from '../utils/verifyEmailTemplate.js';
import generateAccessToken from '../utils/generateAccessToken.js';
import generateRefereshToken from '../utils/generateRefreshToken.js';

//  User Registration
export async function registerUserController(request, response) {
    try {
        const { name, email, password, role = "user" } = request.body;

        if (!name || !email || !password) {
            return response.status(400).json({
                message: "Provide name, email, and password",
                error: true,
                success: false
            });
        }

        const userExists = await user_model.findOne({ email: email.toLowerCase() });

        if (userExists) {
            return response.status(400).json({
                message: "Email already registered",
                error: true,
                success: false
            });
        }

        //  Hash password
        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(password.trim(), salt);

        console.log(" Raw Password Before Hashing:", password);
        console.log(" Hashed Password Before Saving:", hashPassword);
        //  Create user
        const newUser = new user_model({
            name,
            email: email.toLowerCase(),  
            password: hashPassword,
            isVerified: false,
             role: role || "user"
        });

        const savedUser = await newUser.save();

        //  Send email verification
        const VerifyEmailUrl = `${process.env.FRONTEND_URL}/verify-email?codes=${savedUser._id}`;
        const emailSent = await sendEmail({
            sendTo: email,
            subject: "Verify your email - IT22295842",
            html: verifyEmailTemplate({
                name,
                url: VerifyEmailUrl
            })
        });

        console.log("Email Sent Status:", emailSent);

        if (!emailSent) {
            return response.status(500).json({
                message: "User registered, but verification email failed to send.",
                error: true,
                success: false,
                data: savedUser
            });
        }

        return response.json({
            message: "User registered successfully",
            error: false,
            success: true,
            data: savedUser
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false
        });
    }
}

//  Verify Email
export async function verifyEmailController(request, response) {
    try {
        const { code } = request.body;
        const user = await user_model.findOne({ _id: code });

        if (!user) {
            return response.status(400).json({
                message: "Invalid verification code",
                error: true,
                success: false
            });
        }

        //  Update isVerified status
        await user_model.updateOne({ _id: code }, { isVerified: true });

        return response.json({
            message: "Email verified successfully",
            success: true,
            error: false
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false
        });
    }
}

//  Login User
export async function loginController(request, response) {
    try {
        const { email, password } = request.body;

        if (!email || !password) {
            return response.status(400).json({
                message: "Provide email and password",
                error: true,
                success: false
            });
        }

        console.log(" Checking email:", email.toLowerCase());

        //  Find user
        const user = await user_model.findOne({ email: email.toLowerCase() });

        if (!user) {
            console.log(" Email not found");
            return response.status(401).json({
                message: "Invalid email or password",
                error: true,
                success: false
            });
        }

        console.log(" Stored Hashed Password:", user.password);
        console.log(" Entered Password:", password);

        //  Check password
        console.log(" Checking password hash...");
        const isPasswordValid = await bcryptjs.compare(password, user.password);
        console.log(" bcrypt.compare() Result:", isPasswordValid);

        if (!isPasswordValid) {
            return response.status(401).json({
                message: "Invalid email or password",
                error: true,
                success: false
            });
        }

        const accesstoken =await generateAccessToken(user._id, user.role)
        const refereshTokken=await generateRefereshToken(user._id)

        const cookiesOption ={
            httpOnly: true,
            secure : true,
            sameSite :"None"
        }
        response.cookie('accessToken', accesstoken,cookiesOption)
        response.cookie('refereshToken', refereshTokken,cookiesOption)

        return response.json({
            message : "Login successful",
            error : false,
            success : true,
            data : {
                accesstoken,
                refereshTokken,
                role: user.role
            }
        })
        // Check if email is verified
      /*if (!user.isVerified) {
            return response.status(403).json({
                message: "Please verify your email before logging in",
                error: true,
                success: false
            });
        }*/

        // Generate JWT Token
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        console.log(" Login Successful:", user.email);

        return response.json({
            message: "Login successful",
            error: false,
            success: true,
            token: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || "Internal Server Error",
            error: true,
            success: false
        });
    }
}

// logout controller 
export async function logoutController(request, response) {
    try {

        const userid =request.userId //middle ware 
        const cookiesOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        }

        response.clearCookie('accessToken', cookiesOption)
        response.clearCookie('refereshToken',   cookiesOption)

        const removeRefreshToken = await user_model.findByIdAndUpdate(userid, {
             referesh_token: " " });

        return response.json({
            message: "Logout successful",
            error: false,
            success: true
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || "Internal Server Error",
            error: true,
            success: false
        });
    }
}