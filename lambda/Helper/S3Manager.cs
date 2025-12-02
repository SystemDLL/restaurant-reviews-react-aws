using Amazon.S3;

namespace Helper
{
    public class S3Manager
    {
        public async Task<string> UploadFileAsync(string imageFile)
        {
            var guid = Guid.NewGuid();
            var filePath = Path.GetTempFileName();
            await File.WriteAllBytesAsync(filePath, Convert.FromBase64String(imageFile));
            Console.WriteLine("Uploading file to S3: " + filePath);
            using (var client = new Amazon.S3.AmazonS3Client(Amazon.RegionEndpoint.USEast1))
            {
                var putRequest = new Amazon.S3.Model.PutObjectRequest
                {
                    BucketName = Environment.GetEnvironmentVariable("S3_BUCKET_NAME"),
                    Key = $"assets/images/{guid.ToString()}",
                    FilePath = filePath
                };
                putRequest.ServerSideEncryptionMethod = ServerSideEncryptionMethod.AES256;
                var response = await client.PutObjectAsync(putRequest);
            }
            return guid.ToString();
        }
    }
}
