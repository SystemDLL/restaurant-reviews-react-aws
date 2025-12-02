namespace Helper.Entity
{
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
}
