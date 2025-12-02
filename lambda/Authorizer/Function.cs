using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using Helper;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text.Json.Serialization;

// Assembly attribute to enable the Lambda function's JSON input to be converted into a .NET class.
[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace Authorizer
{
    public class Function
    {
        public AuthPolicy FunctionHandler(APIGatewayCustomAuthorizerRequest request, ILambdaContext context)
        {
            try
            {
                // Extract the token from the "Authorization" header.
                if (!request.Headers.TryGetValue("Authorization", out var authHeader) || string.IsNullOrEmpty(authHeader))
                {
                    context.Logger.LogInformation("Authorization header is missing or empty.");
                    return DenyAllPolicy(request.MethodArn);
                }

                var token = authHeader.Split(' ').Last();
                var claimsPrincipal = new JwtManager().VerifyJwtToken(token);

                // The token is valid; generate an "Allow" policy.
                return AllowPolicy(claimsPrincipal.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "user", request.MethodArn, claimsPrincipal.Claims);
            }
            catch (SecurityTokenExpiredException)
            {
                // The token has expired.
                context.Logger.LogWarning("Token has expired.");
                return DenyAllPolicy(request.MethodArn);
            }
            catch (Exception ex)
            {
                // Any other validation or processing error.
                context.Logger.LogError($"Token validation failed: {ex.Message} | {ex.StackTrace}");
                return DenyAllPolicy(request.MethodArn);
            }
        }

        // Generates an Allow policy for the API Gateway.
        private AuthPolicy AllowPolicy(string principalId, string resource, IEnumerable<Claim> claims)
        {
            var policy = new AuthPolicy
            {
                PrincipalId = principalId,
                PolicyDocument = new PolicyDocument
                {
                    Statement = new List<PolicyDocument.StatementItem>
                {
                    new()
                    {
                        Action = "execute-api:Invoke",
                        Effect = "Allow",
                        Resource = resource
                    }
                }
                },
                Context = claims.ToDictionary(c => c.Type, c => (object)c.Value)
            };
            return policy;
        }

        // Generates a Deny policy for the API Gateway.
        private AuthPolicy DenyAllPolicy(string resource)
        {
            var policy = new AuthPolicy
            {
                PrincipalId = "user",
                PolicyDocument = new PolicyDocument
                {
                    Statement = new List<PolicyDocument.StatementItem>
                {
                    new()
                    {
                        Action = "execute-api:Invoke",
                        Effect = "Deny",
                        Resource = resource
                    }
                }
                }
            };
            return policy;
        }
    }

    public class AuthPolicy
    {
        [JsonPropertyName("principalId")]
        public string? PrincipalId { get; set; }

        [JsonPropertyName("policyDocument")]
        public PolicyDocument? PolicyDocument { get; set; }

        [JsonPropertyName("context")]
        public Dictionary<string, object>? Context { get; set; }
    }

    public class PolicyDocument
    {
        [JsonPropertyName("Version")]
        public string Version { get; set; } = "2012-10-17";

        [JsonPropertyName("Statement")]
        public List<StatementItem>? Statement { get; set; }

        public class StatementItem
        {
            [JsonPropertyName("Action")]
            public string? Action { get; set; }

            [JsonPropertyName("Effect")]
            public string? Effect { get; set; }

            [JsonPropertyName("Resource")]
            public string? Resource { get; set; }
        }
    }
}