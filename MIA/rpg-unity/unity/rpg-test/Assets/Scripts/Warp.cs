using UnityEngine;
using System.Collections;

public class Warp : MonoBehaviour {

	public Transform warpTarget;

	void OnTriggerEnter2D (Collider2D other)
	{
		Debug.Log ("An object collided.");
		other.gameObject.transform.position = warpTarget.position;
		Camera.main.transform.position = warpTarget.position;
	}
}
