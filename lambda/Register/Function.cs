using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using System.Text.Json;
using System.Text.Json.Serialization;

// Assembly attribute to enable the Lambda function's JSON input to be converted into a .NET class.
[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace Register
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
            var request = JsonSerializer.Deserialize<RegisterRequest>(input.Body);
            if (request == null || string.IsNullOrWhiteSpace(request.email) || string.IsNullOrWhiteSpace(request.password) || string.IsNullOrWhiteSpace(request.name) || string.IsNullOrWhiteSpace(request.role))
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
            var user = await new Helper.DataRepository().RegisterAsync(request.email, request.password, request.name, request.role);
            if (user == null)
            {
                return new APIGatewayProxyResponse
                {
                    StatusCode = 400,
                    Headers = new Dictionary<string, string>
                    {
                        { "Access-Control-Allow-Origin", "*" }
                    },
                    Body = JsonSerializer.Serialize("User already exists.")
                };
            }
            else
            {
                return new APIGatewayProxyResponse
                {
                    StatusCode = 200,
                    Headers = new Dictionary<string, string>
                    {
                        { "Access-Control-Allow-Origin", "*" }
                    },
                    Body = JsonSerializer.Serialize("User registered successfully.")
                };
            }
        }
    }

    public class RegisterRequest
    {
        public string email { get; set; }
        public string password { get; set; }
        public string name { get; set; }
        public string role { get; set; }
    }
}