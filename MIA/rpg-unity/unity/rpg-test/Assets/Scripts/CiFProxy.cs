using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using UnityEngine;
using System.Collections;
using System.Threading;

[Serializable]
public class PracticeNames {
	public List<string> names;
}

[Serializable]
public class ActionNames {
	public List<string> names;
}

[Serializable]
public class ActionDialogue {
	public List<string> dialogue;
}

[Serializable]
public class CurrentStage {
	public bool isTerminal;
}

public class CiFProxy
{
	static string sendMessage = "";
	public static bool serverReturned = false;
	public static PracticeNames practiceNamesList = new PracticeNames();
	public static ActionNames actionNamesList = new ActionNames();
	public static ActionDialogue actionDialogue = new ActionDialogue ();
	public static SocialPractice practice = new SocialPractice ();
	public static CurrentStage curStage = new CurrentStage ();

	public static void SendMessage(string messageType)
	{
		sendMessage = messageType;
	}
		
    public void Proxy()
    {
        //TcpListener server = null;
        try
        {
            Debug.Log("Inside the Try");
//            // Set the TcpListener on port 42024.
            Int32 port = 4200;
			string localAddr = "127.0.0.1";

            // Enter the listening loop.
            while (true)
            {
                // Perform a blocking call to accept requests.
				// TODO: This probably shouldn't be a single string, it should be a queue
				if (sendMessage != "")
				{
					TcpClient clientSocket = new TcpClient(localAddr, port);

	                Console.WriteLine("Connected!");

	               // data = null;

	                // Get a stream object for reading and writing
	                NetworkStream stream = clientSocket.GetStream();

					// Writes message to Network Stream
					Byte[] message = System.Text.Encoding.ASCII.GetBytes(sendMessage);
					stream.Write(message, 0, message.Length);
					if (stream.CanRead)
					{
						byte[] myReadBuffer = new byte[1024];
						StringBuilder completeData = new StringBuilder();
						int numberOfBytesRead = 0;

						// Incoming message may be larger than the buffer size.
						do{
							numberOfBytesRead = stream.Read(myReadBuffer, 0, myReadBuffer.Length);

							completeData.AppendFormat("{0}", Encoding.ASCII.GetString(myReadBuffer, 0, numberOfBytesRead));

						}
						while(stream.DataAvailable);

						if (sendMessage == "GetPracticeNames")
						{
							String data = completeData.ToString();
							practiceNamesList = JsonUtility.FromJson<PracticeNames>(data);
							//GetPractices.practices = practiceList.practices;
						}
						else if (sendMessage == "GetPractice")
						{
							String data = completeData.ToString();
							practice = JsonUtility.FromJson<SocialPractice>(data);
						}
						else if (sendMessage == "GetActionNames")
						{
							String data = completeData.ToString();
							actionNamesList = JsonUtility.FromJson<ActionNames>(data);
						}
						else if (sendMessage == "GetDialogue")
						{
							String data = completeData.ToString();
							actionDialogue = JsonUtility.FromJson<ActionDialogue>(data);
						}
						else if (sendMessage == "IsTerminalStage")
						{
							String data = completeData.ToString();
							curStage = JsonUtility.FromJson<CurrentStage>(data);

						}
						sendMessage = "";

					}
					serverReturned = true;

					clientSocket.Close();
				}
			}
        }
        catch (SocketException e)
        {
            Debug.Log("Inside Catch");
            Console.WriteLine("SocketException: {0}", e);
        }
        finally
        {
            Debug.Log("Inside finally");
            // Stop listening for new clients.
           // server.Stop();
        }


        Debug.Log("\nHit enter to continue...");
        Console.Read();
        Debug.Log("Console read");
    }
}

//public static class GetPractices
//{
//	public static List<Practice> practices { get; set; }
//}
//
//public static class GetCurrentPractice
//{
//	public static Practice currentPractice { get; set; }
//}
//
//public static class GetPracticeByName
//{
//	public static string practiceName { get; set; }
//}
//
//public static class SetCurrentPractice
//{
//	public static string practiceName { get; set; }
//}
//
//public static class GetCurrentStage
//{
//	public static string currentStage { get; set; }
//}
//
//public static class SetCurrentStage
//{
//	public static string currentStage { get; set; }
//}
//
//public static class GetCurrentAction
//{
//	public static string currentAction { get; set; }
//}
//
//public static class SetCurrentAction
//{
//	public static string currentAction { get; set; }
//}
//
//public static class GetCurrentRoleBindings
//{
//	public static string currentRoleBindings { get; set; }
//}
//
//public static class GetEventStageByLabel
//{
//	public static string stage { get; set; }
//}
//
//public static class GetStageByLabel
//{
//	public static string stage { get; set; }
//}
//
//public static class GetPossibleActions
//{
//	public static string possibleActions { get; set; }
//}
//
//public static class GenerateActions
//{
//	public static string possibleActions { get; set; }
//}
//
//public static  class InstantiatePerformance
//{
//	public static string performance { get; set; }
//}
//
//public static class InTerminalStage
//{
//	public static string booleanValue { get; set; }
//}
//
//public static class GetActionByName
//{
//	public static string actionList { get; set; }
//}
//
//public static class GetScoredMTInfo
//{
//	public static string scoredMTInfo { get; set; }
//}
//
//public static class GetScoredActionsInfo
//{
//	public static string scoredActionsInfo { get; set; }
//}
//
//public static class GetCharacters
//{
//	public static string keys { get; set; }
//}
//
//public static class GetIsCharacterOffstage
//{
//	public static string booleanValue { get; set; }
//}
//
//public static class GetIsCharacterOnstage
//{
//	public static string booleanValue { get; set; }
//}
//
//public static class AddHistory
//{
//	public static string historyAtTime { get; set; }
//}
//
//public static class SetupNextTime
//{
//	public static string currentTimeStep { get; set; }
//}
