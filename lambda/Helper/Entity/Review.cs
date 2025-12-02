namespace Helper.Entity
{
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
}
