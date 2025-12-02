using Amazon;
using Amazon.RDS.Util;
using Amazon.Runtime;
using Amazon.Runtime.Credentials;
using Amazon.Runtime.Internal;
using Amazon.Runtime.Internal.Auth;
using Amazon.Runtime.Internal.Util;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using System.Globalization;
using static System.Net.WebRequestMethods;

namespace DSql
{
    public class DSQLAuthTokenGenerator
    {
        public static string GenerateDbAuthToken()
        {
            // Use GetCredentials instead of non-existent ResolveCredentials
            var credentials = DefaultAWSCredentialsIdentityResolver.GetCredentials();
            //var rdsClient = new Amazon.RDS.AmazonRDSClient(credentials, Amazon.RegionEndpoint.USEast1);            
            //string authToken = RDSAuthTokenGenerator.GenerateAuthToken(credentials, Amazon.RegionEndpoint.USEast1, "dvtjixwqtypxyeowwncmlhcywi.dsql.us-east-1.on.aws", 5432, "admin");
            var immutableCredentials = credentials.GetCredentials();
            string authToken = GenerateAuthToken(immutableCredentials, Amazon.RegionEndpoint.USEast1, "dvtjixwqtypxyeowwncmlhcywi.dsql.us-east-1.on.aws");
            return authToken;
        }

        private static string GenerateAuthToken(ImmutableCredentials immutableCredentials, RegionEndpoint region, string hostname)
        {
            if (immutableCredentials == null)
                throw new ArgumentNullException("immutableCredentials");

            if (region == null)
                throw new ArgumentNullException("region");

            hostname = hostname?.Trim();
            if (string.IsNullOrEmpty(hostname))
                throw new ArgumentException("Hostname must not be null or empty.");

            GenerateRDSAuthTokenRequest authTokenRequest = new GenerateRDSAuthTokenRequest();
            IRequest request = new DefaultRequest(authTokenRequest, "dsql");

            request.UseQueryString = true;
            request.HttpMethod = "GET";
            request.Parameters.Add("X-Amz-Expires", "900");
            request.Parameters.Add("Action", "DbConnectAdmin");
            request.Endpoint = new UriBuilder("https", hostname).Uri;

            if (immutableCredentials.UseToken)
            {
                request.Parameters["X-Amz-Security-Token"] = immutableCredentials.Token;
            }

            var signingResult = AWS4PreSignedUrlSigner.SignRequest(request, null, new RequestMetrics(), immutableCredentials.AccessKey, immutableCredentials.SecretKey, "dsql", region.SystemName);

            var authorization = "&" + signingResult.ForQueryParameters;
            var url = AmazonServiceClient.ComposeUrl(request);

            // remove the https:// and append the authorization
            return url.AbsoluteUri.Substring("https://".Length) + authorization;
        }

        private class GenerateRDSAuthTokenRequest : AmazonWebServiceRequest
        {
            public GenerateRDSAuthTokenRequest()
            {
                ((IAmazonWebServiceRequest)this).SignatureVersion = SignatureVersion.SigV4;
            }
        }
    }

    public partial class DSqlContext : DbContext
    {
        public DSqlContext()
        {
        }
        public DSqlContext(DbContextOptions<DSqlContext> options)
            : base(options)
        {
        }

        public virtual DbSet<User> User { get; set; }
        public virtual DbSet<Restaurant> Restaurant { get; set; }
        public virtual DbSet<Review> Review { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id).HasName("PK_User");
                entity.Property(e => e.Id).ValueGeneratedOnAdd();
                entity.Property(e => e.Email).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Password).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Role).IsRequired().HasMaxLength(20);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
                entity.Property(e => e.SortOrder).HasMaxLength(5);
                entity.Property(e => e.FilterCuisine).HasMaxLength(20);
            });

            modelBuilder.Entity<Restaurant>(entity =>
            {
                entity.HasKey(e => e.Id).HasName("PK_Restaurant");
                entity.Property(e => e.Id).ValueGeneratedOnAdd();
                entity.Property(e => e.Title).IsRequired().HasMaxLength(100);
                entity.Property(e => e.ImageFile).HasMaxLength(200);
                entity.Property(e => e.Cuisine).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Location).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Description).IsRequired();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
                entity.HasOne(d => d.User)
                    .WithMany(p => p.Restaurants)
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_Restaurant_User");
            });

            modelBuilder.Entity<Review>(entity =>
            {
                entity.HasKey(e => e.Id).HasName("PK_Review");
                entity.Property(e => e.Id).ValueGeneratedOnAdd();
                entity.Property(e => e.Comment).IsRequired();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
                entity.HasOne(d => d.User)
                    .WithMany(p => p.Reviews)
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_Review_User");
            });
            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }

    public partial class User
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string Role { get; set; }
        public string Name { get; set; }
        public string? SortOrder { get; set; }
        public string? FilterCuisine { get; set; }
        public int? FilterRatingMin { get; set; }
        public int? FilterRatingMax { get; set; }
        public virtual ICollection<Restaurant> Restaurants { get; set; }
        public virtual ICollection<Review> Reviews { get; set; }
    }

    public partial class Restaurant
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Title { get; set; }
        public string ImageFile { get; set; }
        public string Cuisine { get; set; }
        public string Location { get; set; }
        public string Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public virtual User User { get; set; }
        public virtual ICollection<Review> Reviews { get; set; }
    }

    public partial class Review
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int RestaurantId { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public virtual User User { get; set; }
        public virtual Restaurant Restaurant { get; set; }
    }

    public class DataRepository
    {
        public DbContextOptions<DSqlContext> Options { get; private set; }
        public DataRepository()
        {
            var connectionStringBuilder = new NpgsqlConnectionStringBuilder
            {
                Host = "dvtjixwqtypxyeowwncmlhcywi.dsql.us-east-1.on.aws",
                Port = 5432,
                Database = "postgres",
                Username = "admin",
                Password = DSQLAuthTokenGenerator.GenerateDbAuthToken(),
                SslMode = SslMode.Require, // DSQL enforces SSL
                Pooling = true, // Use connection pooling in Lambda for efficiency
                IncludeErrorDetail = true,
            };
            string connectionString = connectionStringBuilder.ConnectionString;
            //var dbConnectionString = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING");
            var optionsBuilder = new DbContextOptionsBuilder<DSqlContext>();
            optionsBuilder.UseNpgsql(connectionString);
            Options = optionsBuilder.Options;
        }

        public async Task<List<Restaurant>> GetRestaurantsAsync()
        {
            using (var context = new DSqlContext(Options))
            {
                return await context.Restaurant.Include(x => x.Reviews).ToListAsync();
            }
        }

        public async Task<List<Restaurant>> GetMyRestaurantsAsync(int userId)
        {
            using (var context = new DSqlContext(Options))
            {
                return await context.Restaurant.Include(x => x.Reviews).Where(x => x.UserId == userId).ToListAsync();
            }
        }

        public async Task<Restaurant?> GetRestaurantAsync(int id)
        {
            using (var context = new DSqlContext(Options))
            {
                return await context.Restaurant.Include(x => x.Reviews).ThenInclude(r => r.User).FirstOrDefaultAsync(x => x.Id == id);
            }
        }

        public async Task<User?> AuthenticateAsync(string username, string password)
        {
            using (var context = new DSqlContext(Options))
            {
                var user = await context.User?.FirstOrDefaultAsync(u => u.Email == username);
                if (user != null /*&& Common.VerifyPassword(password, user.Password)*/)
                {
                    return user;
                }
            }
            return null;
        }

        public async Task<User?> RegisterAsync(string email, string password, string name, string role)
        {
            using (var context = new DSqlContext(Options))
            {
                if (await context.User!.AnyAsync(u => u.Email == email))
                {
                    return null; // User already exists
                }
                var hashedPassword = password; /*Common.HashPassword(password);*/
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
            using (var context = new DSqlContext(Options))
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
            using (var context = new DSqlContext(Options))
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
            using (var context = new DSqlContext(Options))
            {
                await context.Review.AddAsync(review);
                await context.SaveChangesAsync();
            }
        }
    }
}
