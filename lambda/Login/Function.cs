using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using Helper;
using System.Security.Claims;
using System.Text.Json;
using System.Text.Json.Serialization;

// Assembly attribute to enable the Lambda function's JSON input to be converted into a .NET class.
[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace Login
{
    public class Function
    {

        /// <summary>
        /// A simple function that takes a string and does a ToUpper
        /// </summary>
        /// <param name="input">The event for the Lambda function handler to process.</param>
        /// <param name="context">The ILambdaContext that provides methods for logging and describing the Lambda environment.</param>
        /// <returns></returns>
        public async Task<APIGatewayProxyResponse> FunctionHandler(APIGatewayProxyRequest input, ILambdaContext context)
        {
            var request = JsonSerializer.Deserialize<LoginRequest>(input.Body);
            if (request == null || string.IsNullOrWhiteSpace(request.email) || string.IsNullOrWhiteSpace(request.password))
            {
                return new APIGatewayProxyResponse
                {
                    StatusCode = 400,
                    Headers = new Dictionary<string, string>
                    {
                        { "Access-Control-Allow-Origin", "*" }
                    },
                    Body = JsonSerializer.Serialize("Invalid request payload")
                };
            }
            var user = await new DataRepository().AuthenticateAsync(request.email, request.password);
            if (user == null)
            {
                return new APIGatewayProxyResponse
                {
                    StatusCode = 401,
                    Headers = new Dictionary<string, string>
                    {
                        { "Access-Control-Allow-Origin", "*" }
                    },
                    Body = JsonSerializer.Serialize("Authentication failed")
                };
            }
            var jwtToken = GenerateJwtToken(user.Id);
            var response = new LoginResponse
            {
                token = jwtToken,
                role = user.Role,
                name = user.Name
            };
            return new APIGatewayProxyResponse
            {
                StatusCode = 200,
                Headers = new Dictionary<string, string>
                {
                    { "Access-Control-Allow-Origin", "*" }
                },
                Body = JsonSerializer.Serialize(response, new JsonSerializerOptions { DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull })
            };
        }

        private string GenerateJwtToken(int id)
        {
            var userClaims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, id.ToString())
            };
            // Implement JWT generation logic here
            return new JwtManager().GenerateJwtToken(userClaims, "RestRev", "RestRevUser", 60);
        }
    }

    public class LoginRequest
    {
        public string email { get; set; }
        public string password { get; set; }
    }

    public class LoginResponse
    {
        public string token { get; set; }
        public string role { get; set; }
        public string name { get; set; }
    }
}