import jwt from "jsonwebtoken";
import user_model from "../model/user_model.js";

const generateAccessToken = async (userId) => {
   // 🔹 Fetch user details to get the role
   const user = await user_model.findById(userId);

   if (!user) {
      throw new Error("User not found");
   }

   // 🔹 Generate token with role
   const token = jwt.sign(
      { id: userId, role: user.role }, //  Now role is defined
      process.env.SECRET_KEY_ACCESS_TOKEN,
      { expiresIn: "5h" }
   );

   return token;
};

export default generateAccessToken;
