using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using System.Text.Json;

// Assembly attribute to enable the Lambda function's JSON input to be converted into a .NET class.
[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace DSql
{
    public class Function
    {
        public async Task<APIGatewayProxyResponse> FunctionHandler(APIGatewayProxyRequest input, ILambdaContext context)
        {
            var restaurants = await new DataRepository().GetRestaurantsAsync();

            if (restaurants == null || !restaurants.Any())
            {
                return new APIGatewayProxyResponse
                {
                    IsBase64Encoded = false,
                    StatusCode = 404,
                    Headers = new Dictionary<string, string>
                    {
                        { "Access-Control-Allow-Origin", "*" }
                    },
                    Body = JsonSerializer.Serialize("No restaurants found")
                };
            }
            var data = restaurants.Select(x => new 
            {
                Id = x.Id,
                Name = x.Title,
                Description = x.Description,
                Cuisine = x.Cuisine,
                Image = x.ImageFile,
                Location = x.Location,
                Rating = (x.Reviews != null && x.Reviews.Any()) ? x.Reviews.Average(r => r.Rating) : 0.0d,
                Reviews = (x.Reviews != null && x.Reviews.Any()) ? x.Reviews.OrderByDescending(r => r.Id).Select(r => new 
                {
                    Author = (r.User != null) ? r.User.Name : string.Empty,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt.ToShortDateString()
                }).ToList() : null
            }).ToArray();
            var output = new APIGatewayProxyResponse()
            {
                IsBase64Encoded = false,
                StatusCode = 200,
                Headers = new Dictionary<string, string>
                {
                    { "Access-Control-Allow-Origin", "*" }
                },
                Body = JsonSerializer.Serialize(data)
            };
            return output;
        }
    }
}