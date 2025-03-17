const verifyEmailTemplate = ({ name, url }) => {
    return `
    <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; text-align: center;">
        <div style="max-width: 500px; background: white; padding: 20px; border-radius: 8px; margin: auto; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #333;">Hello, ${name}!</h2>
            <p style="color: #555; font-size: 16px;">
                Thank you for registering with <strong>Personal Finance Tracker</strong>. Please click the button below to verify your email.
            </p>
            <a href="${url}" 
                style="
                    display: inline-block; 
                    background-color: #007bff; 
                    color: white; 
                    padding: 12px 20px; 
                    text-decoration: none; 
                    font-size: 16px; 
                    border-radius: 5px; 
                    margin-top: 10px;">
                Verify Email
            </a>
            <p style="color: #888; font-size: 12px; margin-top: 20px;">
                If you did not request this, please ignore this email.
            </p>
        </div>
    </div>
    `;
};

export default verifyEmailTemplate;
