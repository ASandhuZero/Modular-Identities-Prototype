using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;

public class MyTcpListener
{
    public static void Main()
    {
        TcpListener server = null;

        try
        {
            // Set the TcpListener on port 42024.
            Int32 port = 42024;
            IPAddress localAddr = IPAddress.Parse("127.0.0.1");

            // TcpListener server = new TcpListener(port);
            server = new TcpListener(localAddr, port);
            // Start listening for client requests.
            server.Start();
            // Buffer for reading data
            Byte[] bytes = new Byte[4096];
            String data = null;

            char[] charDelimiters = { '{', '}', ',' };
            // Enter the listening loop.
            while (true)
            {
                Console.Write("Waiting for a connection... ");

                // Perform a blocking call to accept requests.
                TcpClient client = server.AcceptTcpClient();
                //TcpClient sendClient = new TcpClient("127.0.0.1", sendPort);

                Console.WriteLine("Connected!");

                data = null;
                             
                // Get a stream object for reading and writing
                NetworkStream stream = client.GetStream();

                int i;
                // Loop to receive all the data sent by the client.
                while ((i = stream.Read(bytes, 0, bytes.Length)) != 0)
                {
                    // Translate data bytes to a ASCII string.
                    data = System.Text.Encoding.ASCII.GetString(bytes, 0, i);
                    Console.WriteLine("Received: {0}", data);
                    string[] parsedData = data.Split(charDelimiters);
                    data = string.Join("\n", parsedData);
                    foreach (string s in parsedData)
                    {
                        System.Console.WriteLine(s);
                    }
                    
                    // Process the data sent by the client.
                    data = data.ToUpper();
                    byte[] msg = System.Text.Encoding.ASCII.GetBytes(data);



                    //Send back a response.
                    stream.Write(msg, 0, msg.Length);
                    Console.WriteLine("Response sent: {0}", data);

                }


                // Shutdown and end connection
                client.Close();
            }
        }
        catch (SocketException e)
        {
            Console.WriteLine("SocketException: {0}", e);
        }
        finally
        {
            // Stop listening for new clients.
            server.Stop();
        }


        Console.WriteLine("\nHit enter to continue...");
        Console.Read();
    }
}