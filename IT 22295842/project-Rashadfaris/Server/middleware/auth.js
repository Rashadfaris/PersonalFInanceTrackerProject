import jwt from "jsonwebtoken";

const auth = (request, response, next) => {
   try {
      const token = request.cookies.accessToken || request?.headers?.authorization?.split(" ")[1];

      console.log("Token received:", token);

      if (!token) {
         return response.status(401).json({
            message:  "No token, authorization denied",
            error: true,
            success: false
         });
      }

      // Verify the token
      const decoded = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
      console.log("Decoded Token:", decoded); // Debugging

      if (!decoded.id || !decoded.role) {
         return response.status(401).json({
            message: "Unauthorized access - role not found",
            error: true,
            success: false
         });
      }

      request.user = { id: decoded.id, role: decoded.role };   console.log("User ID attached to request:", request.userId); // Debugging
      console.log("User ID attached to request:", request.user.id); // Correct log statement


      next();
   } catch (error) {
      return response.status(500).json({
         message: error.message || error,
         error: true,
         success: false
      });
   }
};

// 🔹 Admin check function
export const isAdmin = (request, response, next) => {
   auth(request, response, (error) => {
      if (error) return response.status(500).json({ message: error.message });

      if (request.user.role !== "admin") {
         return response.status(403).json({
            message: "Access denied. Admins only.",
            error: true,
            success: false
         });
      }

      next();
   });
};

// 🔹 Middleware for Admin-only routes
export const adminAuth = (request, response, next) => {
   auth(request, response, (error) => {
      if (error) return response.status(500).json({ message: error.message });

      if (request.user.role !== "admin") { 
         return response.status(403).json({
            message: "Access denied. Admins only.",
            error: true,
            success: false
         });
      }

      next();
   });
};

export const canAccessTransaction = async (request, response, next) => {
   try {
      const { user } = request;
      
      if (!user) {
         return response.status(401).json({
            message: "Unauthorized request",
            error: true,
            success: false
         });
      }

      // Admins can access all transactions
      if (user.role === "admin") {
         return next();
      }

      // Normal users can only access their own transactions
      request.query.userId = user.id; // Modify query to fetch only their transactions
      next();
   } catch (error) {
      return response.status(500).json({
         message: error.message || "Internal Server Error",
         error: true,
         success: false
      });
   }
};

export default auth;
