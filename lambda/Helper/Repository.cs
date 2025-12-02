using Helper.Entity;
using Microsoft.EntityFrameworkCore;

namespace Helper
{
    public class DataRepository 
    {
        public DbContextOptions<Context> Options { get; private set; }
        public DataRepository() 
        {
            var dbConnectionString = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING");
            var optionsBuilder = new DbContextOptionsBuilder<Context>();
            optionsBuilder.UseNpgsql(dbConnectionString);
            Options = optionsBuilder.Options;
        }

        public async Task<List<Restaurant>> GetRestaurantsAsync()
        {
            using (var context = new Context(Options))
            {
                return await context.Restaurant.Include(x => x.Reviews).ToListAsync();
            }
        }

        public async Task<List<Restaurant>> GetMyRestaurantsAsync(int userId)
        {
            using (var context = new Context(Options))
            {
                return await context.Restaurant.Include(x => x.Reviews).Where(x => x.UserId == userId).ToListAsync();
            }
        }

        public async Task<Restaurant?> GetRestaurantAsync(int id)
        {
            using (var context = new Context(Options))
            {
                return await context.Restaurant.Include(x => x.Reviews).ThenInclude(r => r.User).FirstOrDefaultAsync(x => x.Id == id);
            }
        }

        public async Task<User?> AuthenticateAsync(string username, string password)
        {
            using (var context = new Context(Options))
            {
                var user = await context.User?.FirstOrDefaultAsync(u => u.Email == username);
                if ( user != null && Common.VerifyPassword(password, user.Password))
                {
                    return user;
                }
            }
            return null;
        }

        public async Task<User?> RegisterAsync(string email, string password, string name, string role)
        {
            using (var context = new Context(Options))
            {
                if (await context.User!.AnyAsync(u => u.Email == email))
                {
                    return null; // User already exists
                }
                var hashedPassword = Common.HashPassword(password);
                var newUser = new User
                {
                    Email = email,
                    Password = hashedPassword,
                    Name = name,
                    Role = role,                    
                };
                await context.User.AddAsync(newUser);
                await context.SaveChangesAsync();
                return newUser;
            }            
        }

        public async Task<Restaurant?> ManageRestaurantAsync(Restaurant restaurant)
        {
            using (var context = new Context(Options))
            {
                if (restaurant.Id == 0)
                {
                    Console.WriteLine("Adding new restaurant");
                    await context.Restaurant.AddAsync(restaurant);
                }
                else
                {
                    Console.WriteLine("Updating existing restaurant ID " + restaurant.Id);
                    var r = await context.Restaurant.FindAsync(restaurant.Id);
                    if (r == null)
                    {
                        return null; 
                    }
                    else if (r.UserId != restaurant.UserId)
                    {                         
                        throw new UnauthorizedAccessException("You do not have permission to update this restaurant.");
                    }
                    r.Title = restaurant.Title;
                    r.Description = restaurant.Description;
                    r.Cuisine = restaurant.Cuisine;
                    r.Location = restaurant.Location;
                    r.CreatedAt = DateTime.UtcNow;
                    if (!string.IsNullOrWhiteSpace(restaurant.ImageFile)) r.ImageFile = restaurant.ImageFile;
                    context.Restaurant.Update(r);
                }
                await context.SaveChangesAsync();
                return restaurant;
            }
        }

        public async Task DeleteRestaurantAsync(int id, int userId)
        {
            Console.WriteLine($"Deleting existing restaurant ID {id} by User {userId}");
            using (var context = new Context(Options))
            {
                var restaurant = await context.Restaurant.FindAsync(id);
                if (restaurant != null && restaurant.UserId == userId)
                {
                    context.Review.RemoveRange(context.Review.Where(r => r.RestaurantId == id));
                    context.Restaurant.Remove(restaurant);
                    await context.SaveChangesAsync();
                }
                else
                {
                    throw new UnauthorizedAccessException("You do not have permission to delete this restaurant.");
                }
            }
        }

        public async Task AddReviewAsync(Review review)
        {
            using (var context = new Context(Options))
            {
                await context.Review.AddAsync(review);
                await context.SaveChangesAsync();
            }
        }
    }
}
