using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;


[Serializable]
public class Graphics
{
	public string icon;
	public string body;
	public string head;
	public string hair;
	public string nose;
	public string eyes;
	public string mouth;
}

[Serializable]
public class Character
{
	public string name;
	public string profession;
	public Graphics graphics;
}

[Serializable]
public class Cast
{
	public List<Character> characters;
}
	
public class GameManager : MonoBehaviour {
	public static Cast cast = new Cast();
	public GameObject characters = new GameObject();
	public static List<GameCharacter> characterList = new List<GameCharacter> ();

	public static void RegisterCharacter(GameCharacter character) {
		characterList.Add (character);
	}

	static GameManager () {

	}

	// Use this for initialization
	void Start () {
		StartCoroutine (LoadCast ());
	}

	public GameObject FindCharacterObjectByName(string name)
	{
		Transform[] characterTransforms = characters.GetComponentsInChildren<Transform>(true);
		foreach(Transform t in characterTransforms){
			if(t.name == name){
				return t.gameObject;
			}
		}
		return null;
	}

	IEnumerator LoadCast() {
		string castJSON = "";
		// Load cast file
		castJSON = Load.LoadCast("../../data/cast.json");

		while (castJSON == "") yield return null;

		// parse cast file
		cast = JsonUtility.FromJson<Cast>(castJSON);
		// Setup graphics for characters
		for (int i = 0; i < cast.characters.Count; i++) {
			Character curChar = cast.characters [i];

			// update names of characters in game based on cast file
			if (curChar.graphics.icon != null) {
				// find game object associated with the icon name from the cast file
				GameObject charGameObject = FindCharacterObjectByName (curChar.graphics.icon);

				if (charGameObject != null) {
					// update name to cast name
					charGameObject.name = curChar.name;
					// turn on the graphics for this character
					charGameObject.SetActive (true);
				}
			}
		}
	}
	
	// Update is called once per frame
	void Update () {
	
	}
}
