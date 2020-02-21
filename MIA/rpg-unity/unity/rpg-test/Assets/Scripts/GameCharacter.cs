using UnityEngine;
using System.Collections;

public class GameCharacter : MonoBehaviour {

	// Use this for initialization
	void Start () {
		GameManager.RegisterCharacter (this);
	}
	
	// Update is called once per frame
	void Update () {
	
	}
}
