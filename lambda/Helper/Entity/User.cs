namespace Helper.Entity
{
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
}
