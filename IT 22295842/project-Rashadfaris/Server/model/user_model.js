import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'; 

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Provide name"]
    },
    email: {
        type: String,
        required: [true, "Provide email"],
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, "Provide password"]
    },
    verify_email :{
        type :Boolean,
        default :false
    },
    referesh_token : {
        type :String,
        default :""
    },
    
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user"
    },
    currency: {
        type: String,
        default: "USD"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});


const user_model = mongoose.model("User", userSchema);
export default user_model;
