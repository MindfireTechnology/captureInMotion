using System;
using System.Collections.Generic;
using IO = System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.IO;
using System.Text;
using System.Threading;

namespace Web.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	[DisableRequestSizeLimit]
	public class StreamingController : ControllerBase
	{
		public string LocalPath { get; }

		public StreamingController()
		{
			LocalPath = @"D:\Temp\";
		}

		//[HttpPost]
		//public async void Save([FromForm] StreamData request)
		//{
		//    Debug.WriteLine($"Receiving Data for {request.Name}:{request.Sequence}");
		//    using (var stream = request.Data.OpenReadStream())
		//    using (var file = IO.File.Open(IO.Path.Combine(LocalPath, request.Name + ".webm"), IO.FileMode.OpenOrCreate, IO.FileAccess.Write, IO.FileShare.ReadWrite | IO.FileShare.Delete))
		//    {
		//        file.Seek(0, IO.SeekOrigin.End);
		//        await stream.CopyToAsync(file);
		//    }
		//}



		//[HttpPost]
		//public async void Save()
		//{
		//    string name = Request.Query["Name"];
		//    string sequence = Request.Query["Sequence"];

		//    //Debug.WriteLine($"Receiving Data for {name}:{sequence} - {string.Join(", ", buffer.Take(20).Select(n => n.ToString("X").PadLeft(2, '0')))}");
		//    Debug.WriteLine($"Receiving Data for {name}:{sequence}");

		//    int read = 0;
		//    byte[] buffer = new byte[10240];
		//    Stream stream = Request.Body;

		//    Stream dest = new MemoryStream();
		//    using (var file = IO.File.Open(IO.Path.Combine(LocalPath, name + ".webm"), FileMode.OpenOrCreate, FileAccess.Write, FileShare.ReadWrite | FileShare.Delete))
		//    {
		//        try
		//        {
		//            file.Seek(0, IO.SeekOrigin.End);

		//            //await stream.CopyToAsync(dest).ConfigureAwait(false);
		//            //await dest.CopyToAsync(file);

		//            //while ((read = await stream.ReadAsync(buffer, 0, buffer.Length)) > 0)
		//            //{
		//            //    //await file.WriteAsync(buffer, 0, read);
		//            //    file.Write(buffer, 0, read);
		//            //    stream.
		//            //}

		//        } catch (Exception ex)
		//        {
		//            Debug.WriteLine(ex);
		//        }
		//    }
		//    dest.Dispose();
		//}

		[HttpPost]
		public async void Save([FromForm] StreamData request)
		{
			Debug.WriteLine($"Receiving Data for {request.Name}:{request.Sequence} - {request.Data.Length.FormatSize()}");

			string name = "Dan";
			using (var file = IO.File.Open(IO.Path.Combine(LocalPath, name + ".webm"), FileMode.OpenOrCreate, FileAccess.Write, FileShare.ReadWrite | FileShare.Delete))
			{
				try
				{
					file.Seek(0, SeekOrigin.End);
					file.SetLength(file.Length + request.Data.Length);
					request.Data.CopyTo(file);
				}
				catch (Exception ex)
				{
					Debug.WriteLine(ex);
				}
			}
		}
	}

	public class StreamData
	{
		public string Name { get; set; }
		public int Sequence { get; set; }
		public IFormFile Data { get; set; }
	}

	public static class BytesExtensions
	{
		// Load all suffixes in an array  
		static readonly string[] suffixes =
		{ "Bytes", "KB", "MB", "GB", "TB", "PB" };
		public static string FormatSize(this long bytes)
		{
			int counter = 0;
			decimal number = (decimal)bytes;
			while (Math.Round(number / 1024) >= 1)
			{
				number = number / 1024;
				counter++;
			}

			return string.Format("{0:n1}{1}", number, suffixes[counter]);
		}


		//public static string ToHumanReadableString(this int value)
		//{
		//	if (value < Math.Pow(1024, 1))
		//		return $"{value} bytes";
		//	else if (value < Math.Pow(1024, 2))
		//		return $"{Math.Sqrt(value).ToString("{0:N2}")} KiB";
		//	else if (value < Math.Pow(1024, 3))
		//		return $"{Math.Pow(value, (double) 1/3).ToString("{0:N2}")} MiB";

		//	return value.ToString();
		//}
	}
}