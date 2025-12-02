using System.Text.Json.Serialization;

namespace Helper.ViewModels
{
    public class RestaurantItem
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }
        [JsonPropertyName("name")]
        public string? Name { get; set; }
        [JsonPropertyName("description")]
        public string? Description { get; set; }
        [JsonPropertyName("image")]
        public string? Image { get; set; }
        [JsonPropertyName("cuisine")]
        public string? Cuisine { get; set; }
        [JsonPropertyName("rating")]
        public double Rating { get; set; }
        [JsonPropertyName("location")] 
        public string? Location { get; set; }
        [JsonPropertyName("reviews")]
        public List<ReviewItem>? Reviews { get; set; } = new List<ReviewItem>();
    }

    public class ReviewItem
    {
        [JsonPropertyName("author")]
        public string Author { get; set; }
        [JsonPropertyName("rating")]
        public int Rating { get; set; }
        [JsonPropertyName("content")]
        public string? Comment { get; set; }
        [JsonPropertyName("date")]
        public string CreatedAt { get; set; }
    }

    public class ProcessRequest
    {
        public string action { get; set; }
        public ICommonType data { get; set; }
    }

    [JsonPolymorphic(TypeDiscriminatorPropertyName = "Type")]
    [JsonDerivedType(typeof(Restaurant), "restaurant")]
    [JsonDerivedType(typeof(Review), "review")]
    [JsonDerivedType(typeof(Get), "get")]
    public class ICommonType
    {
        public ICommonType() { }
        public int Id { get; set; }
    }

    public class Restaurant : ICommonType
    {
        public string Title { get; set; }
        public string ImageFile { get; set; }
        public string Cuisine { get; set; }
        public string Location { get; set; }
        public string Description { get; set; }
    }

    public class Review : ICommonType
    {
        public int RestaurantId { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; }
    }

    public class Get : ICommonType
    {

    }
}
