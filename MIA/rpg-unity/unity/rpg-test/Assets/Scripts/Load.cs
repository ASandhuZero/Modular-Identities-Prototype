using UnityEngine;
using System.Collections;
using System.IO;

public static class Load {

	public static string LoadJson(string filename)
	{
		string json;

		using (StreamReader r = new StreamReader(filename))
		{
			json = r.ReadToEnd();
		}
		return json;
	}

	public static string LoadCast(string castFilename)
	{
		// load cast file from name passed in
		string json = LoadJson (castFilename);
		return json;

	}

}
