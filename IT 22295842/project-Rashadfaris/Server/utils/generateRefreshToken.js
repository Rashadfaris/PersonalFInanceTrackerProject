import jwt from "jsonwebtoken";
import user_model from "../model/user_model.js";

const generateRefereshToken = async (userId) => {
   const token = jwt.sign(
      { id: userId }, //  No role needed for refresh token
      process.env.SECRET_KEY_REFRESH_TOKEN,
      { expiresIn: "30d" }
   );

   try {
      await user_model.updateOne({ _id: userId }, { refresh_token: token });
   } catch (error) {
      console.error("Error updating refresh token:", error);
   }

   return token;
};

export default generateRefereshToken;
