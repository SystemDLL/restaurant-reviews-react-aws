using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace Helper.Entity
{
    public partial class Context : DbContext
    {
        public Context()
        {
        }

        public Context(DbContextOptions<Context> options)
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
}
