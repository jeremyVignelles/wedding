using System;
using Microsoft.AspNetCore.Identity;

namespace PasswordHashGenerator
{
    class Program
    {
        // Code inspired from https://www.mikesdotnetting.com/article/335/simple-authentication-in-razor-pages-without-a-database
        static void Main(string[] args)
        {
            var passwordHasher = new PasswordHasher<string>();
            var password = Console.ReadLine();
            Console.WriteLine(passwordHasher.HashPassword(null, password));
        }
    }
}
