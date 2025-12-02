using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using Helper;
using Helper.ViewModels;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

// Assembly attribute to enable the Lambda function's JSON input to be converted into a .NET class.
[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace Process
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
            var request = JsonSerializer.Deserialize<ProcessRequest>(input.Body);
            if (request == null || string.IsNullOrWhiteSpace(request.action) || request.data == null)
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
            int userId = 0;
            try
            {
                userId = new JwtManager().GetUserIdFromClaims(input.Headers["Authorization"].Split(' ')[1]);
            }
            catch (Exception ex)
            {
                return new APIGatewayProxyResponse
                {
                    StatusCode = 401,
                    Headers = new Dictionary<string, string>
                    {
                        { "Access-Control-Allow-Origin", "*" }
                    },
                    Body = JsonSerializer.Serialize("Unauthorized: " + ex.Message)
                };
            }
            if (userId == 0)
            {
                return new APIGatewayProxyResponse
                {
                    StatusCode = 401,
                    Headers = new Dictionary<string, string>
                    {
                        { "Access-Control-Allow-Origin", "*" }
                    },
                    Body = JsonSerializer.Serialize("Unauthorized: Invalid user ID")
                };
            }
            Console.WriteLine($"Action: {request.action} | User ID: {userId}");
            // Process the request based on action and data
            try
            {
                switch (request.action)
                {
                    case "add_restaurant":
                        {
                            Console.WriteLine("Adding restaurant: " + JsonSerializer.Serialize(request.data));
                            var restaurant = request.data as Restaurant;
                            if (restaurant == null)
                            {
                                throw new ArgumentException("Invalid restaurant data");
                            }
                            //Store ImageFile to S3 and get the URL
                            var imageUrl = await new S3Manager().UploadFileAsync(restaurant.ImageFile);
                            var dRestaurant = new Helper.Entity.Restaurant
                            {
                                Id = 0,
                                UserId = userId,
                                Title = restaurant.Title,
                                ImageFile = imageUrl,
                                Cuisine = restaurant.Cuisine,
                                Location = restaurant.Location,
                                Description = restaurant.Description,
                                CreatedAt = DateTime.UtcNow
                            };
                            _ = await new DataRepository().ManageRestaurantAsync(dRestaurant);
                            return ProcessSuccess("Request processed successfully");
                        }
                    case "update_restaurant":
                        {
                            var restaurant = request.data as Restaurant;
                            if (restaurant == null)
                            {
                                throw new ArgumentException("Invalid restaurant data");
                            }
                            
                            var dRestaurant = new Helper.Entity.Restaurant
                            {
                                Id = restaurant.Id,
                                UserId = userId,
                                Title = restaurant.Title,                                
                                Cuisine = restaurant.Cuisine,
                                Location = restaurant.Location,
                                Description = restaurant.Description
                            };
                            //Store ImageFile to S3 and get the URL
                            if (!string.IsNullOrWhiteSpace(restaurant.ImageFile))
                            {
                                dRestaurant.ImageFile = await new S3Manager().UploadFileAsync(restaurant.ImageFile);
                            }
                            _ = await new DataRepository().ManageRestaurantAsync(dRestaurant);
                            return ProcessSuccess("Request processed successfully");
                        }
                    case "delete_restaurant":
                        {
                            var restaurant = request.data as Get;
                            if (restaurant == null)
                            {
                                throw new ArgumentException("Invalid restaurant data");
                            }
                            await new DataRepository().DeleteRestaurantAsync(restaurant.Id, userId);
                            return ProcessSuccess("Request processed successfully");
                        }
                    case "add_review":
                        {
                            var review = request.data as Review;
                            if (review == null)
                            {
                                throw new ArgumentException("Invalid restaurant data");
                            }
                            var dReview = new Helper.Entity.Review
                            {
                                Id = 0,
                                UserId = userId,
                                RestaurantId = review.RestaurantId,
                                Rating = review.Rating,
                                Comment = review.Comment,
                                CreatedAt = DateTime.UtcNow
                            };
                            await new DataRepository().AddReviewAsync(dReview);
                            return ProcessSuccess("Request processed successfully");
                        }
                        case "my_restaurants":
                        {
                            var getRequest = request.data as Get;
                            var restaurants = await new DataRepository().GetMyRestaurantsAsync(userId);
                            if (restaurants == null)
                            {
                                return new APIGatewayProxyResponse
                                {
                                    StatusCode = 404,
                                    Headers = new Dictionary<string, string>
                                    {
                                        { "Access-Control-Allow-Origin", "*" }
                                    },
                                    Body = JsonSerializer.Serialize("Restaurant not found")
                                };
                            }
                            var result = restaurants.Select(restaurant => new RestaurantItem
                            {
                                Id = restaurant.Id,
                                Name = restaurant.Title,
                                Image = restaurant.ImageFile,
                                Cuisine = restaurant.Cuisine,
                                Location = restaurant.Location,
                                Description = restaurant.Description,
                                Rating = (restaurant.Reviews != null && restaurant.Reviews.Any()) ? restaurant.Reviews.Average(r => r.Rating) : 0.0d
                            });
                            return ProcessSuccess(result);
                        }
                    default:
                        return new APIGatewayProxyResponse
                        {
                            StatusCode = 400,
                            Headers = new Dictionary<string, string>
                            {
                                { "Access-Control-Allow-Origin", "*" }
                            },
                            Body = JsonSerializer.Serialize("Unknown action")
                        };
                }
                
            }
            catch (UnauthorizedAccessException ex)
            {
                Console.WriteLine(ex);
                return new APIGatewayProxyResponse
                {
                    StatusCode = 403,
                    Headers = new Dictionary<string, string>
                    {
                        { "Access-Control-Allow-Origin", "*" }
                    },
                    Body = JsonSerializer.Serialize("Forbidden: " + ex.Message)
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                return new APIGatewayProxyResponse
                {
                    StatusCode = 500,
                    Headers = new Dictionary<string, string>
                    {
                        { "Access-Control-Allow-Origin", "*" }
                    },
                    Body = JsonSerializer.Serialize("Internal server error: " + ex.Message)
                };
            }
        }

        private APIGatewayProxyResponse ProcessSuccess<T>(T data)
        {
            return new APIGatewayProxyResponse
            {
                StatusCode = 200,
                Headers = new Dictionary<string, string>
                {
                    { "Access-Control-Allow-Origin", "*" }
                },
                Body = JsonSerializer.Serialize(data)
            };
        }
    }    
}