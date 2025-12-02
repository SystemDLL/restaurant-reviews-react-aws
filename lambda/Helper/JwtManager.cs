using System.Security.Claims;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;

namespace Helper
{
    public class JwtManager
    {

        private static readonly string Secret = Environment.GetEnvironmentVariable("JWT_SECRET_KEY");
        private static readonly SymmetricSecurityKey SecurityKey = new(System.Text.Encoding.UTF8.GetBytes(Secret));
        /// <summary>
        /// Generates a JSON Web Token (JWT).
        /// </summary>
        /// <param name="claims">A list of claims to include in the token payload.</param>
        /// <param name="securityKey">The symmetric secret key used for signing the token.</param>
        /// <param name="issuer">The issuer of the token.</param>
        /// <param name="audience">The intended audience of the token.</param>
        /// <param name="expiresInMinutes">The token's expiration time in minutes.</param>
        /// <returns>A signed JWT string.</returns>
        public string GenerateJwtToken(
            IEnumerable<Claim> claims,
            string issuer,
            string audience,
            int expiresInMinutes)
        {
            // Create the signing credentials using the symmetric key and the HMAC SHA256 algorithm.
            var signingCredentials = new SigningCredentials(SecurityKey, SecurityAlgorithms.HmacSha256);

            // Create a SecurityTokenDescriptor to hold the token details.
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Issuer = issuer,
                Audience = audience,
                Expires = DateTime.UtcNow.AddMinutes(expiresInMinutes), // Set token expiration.
                SigningCredentials = signingCredentials
            };

            // Create the token handler and generate the token.
            var tokenHandler = new JwtSecurityTokenHandler();
            var securityToken = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(securityToken); // Convert the token to a string.
        }

        public ClaimsPrincipal VerifyJwtToken(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = SecurityKey,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero // Optional: reduce clock skew tolerance
            };
            return tokenHandler.ValidateToken(token, validationParameters, out _);
        }

        public int GetUserIdFromClaims(string token)
        {
            var userIdClaim = VerifyJwtToken(token)?.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
            {
                throw new SecurityTokenException("Invalid token: User ID claim is missing or invalid.");
            }
            return userId;
        }
    }
}